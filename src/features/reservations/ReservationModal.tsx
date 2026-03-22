'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { Button, Card } from '../../components/common';
import { ReserveShowResponse, useMyShowReservation, useReserveShow, useShowSeats } from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { SeatMapPicker } from './SeatMapPicker';

interface ReservationModalProps {
    showId: string;
    showName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (response: ReserveShowResponse) => void;
    token?: string;
}

const knownReservationErrorCodes = [
    'NO_SHOW', 'NO_SEATS', 'DUPLICATE_MAIL', 'UNKNOWN_ERROR',
    'INVALID_SEAT', 'SEAT_TAKEN', 'INVALID_TOKEN',
] as const;
type ReservationErrorCode = (typeof knownReservationErrorCodes)[number];
const isKnownReservationErrorCode = (value?: string): value is ReservationErrorCode => {
    if (!value) return false;
    return (knownReservationErrorCodes as readonly string[]).includes(value);
};

export const ReservationModal = ({ showId, showName, isOpen, onClose, onSuccess, token }: ReservationModalProps) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, loginWithGoogleCredential } = useAuth();
    const reserveMutation = useReserveShow();
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    const seatsQuery = useShowSeats(isOpen ? showId : undefined);
    const takenSeats = seatsQuery.data?.taken ?? [];

    const myReservationQuery = useMyShowReservation(showId, user?.email, isOpen && isAuthenticated);
    const alreadyBooked =
        myReservationQuery.data?.message !== 'NO_RESERVATION' &&
        myReservationQuery.data?.data != null;
    const existingSeatNumber = myReservationQuery.data?.data?.seatNumber ?? '';
    const existingStatus = myReservationQuery.data?.data?.status;

    const handleClose = () => {
        reserveMutation.reset();
        setSelectedSeat(null);
        onClose();
    };

    const handleReserve = async () => {
        if (!selectedSeat) return;
        try {
            const response = await reserveMutation.mutateAsync({ showId, seatNumber: selectedSeat, token });
            handleClose();
            onSuccess?.({
                ...response.data,
                name: response.data.name,
                reservationNumber: response.data.reservationNumber,
            });
        } catch (err) {
            const message = (err as { message?: string })?.message?.toString().toUpperCase();
            if (message === 'SEAT_TAKEN') {
                setSelectedSeat(null);
                seatsQuery.refetch();
            }
        }
    };

    const getErrorMessage = () => {
        if (!reserveMutation.error) return null;
        const rawMessage = reserveMutation.error.message?.toString().toUpperCase();
        if (rawMessage === 'DUPLICATE_MAIL') {
            const details = reserveMutation.error.details as { data?: { seatNumber?: string } } | undefined;
            const seat = details?.data?.seatNumber ?? '';
            return t('reservation.errors.codes.DUPLICATE_MAIL', { seat });
        }
        if (isKnownReservationErrorCode(rawMessage)) {
            return t(`reservation.errors.codes.${rawMessage}`);
        }
        return reserveMutation.error.message ?? t('reservation.errors.generic');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-primary-950/80 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <Card className="space-y-4" hover={false}>
                    <div className="space-y-1 text-center">
                        <p className="text-sm uppercase tracking-[0.2em] text-secondary-500">{t('reservation.label')}</p>
                        <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500">{showName}</h2>
                    </div>

                    {!isAuthenticated ? (
                        <div className="space-y-4">
                            <p className="text-sm text-center text-primary-600 dark:text-primary-300">
                                {t('auth.signInToReserve')}
                            </p>
                            <div className="flex justify-center">
                                <GoogleLoginButton
                                    onSuccess={async (credential) => {
                                        try { await loginWithGoogleCredential(credential); } catch { /* auth error */ }
                                    }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" variant="primary" onClick={handleClose}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : alreadyBooked ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-center">
                                <span className="text-3xl">{existingStatus === 'WAITING_LIST' ? '⏳' : '💺'}</span>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                    {existingStatus === 'WAITING_LIST'
                                        ? t('reservation.errors.codes.DUPLICATE_WAITING_LIST', { seat: existingSeatNumber })
                                        : t('reservation.errors.codes.DUPLICATE_MAIL', { seat: existingSeatNumber })}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" variant="primary" onClick={handleClose}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-center text-primary-700 dark:text-primary-200">
                                {t('reservation.selectSeat')}
                            </p>

                            {seatsQuery.isLoading ? (
                                <div className="flex justify-center py-8 text-primary-500">
                                    {t('common.loading')}
                                </div>
                            ) : (
                                <SeatMapPicker
                                    takenSeats={takenSeats}
                                    selectedSeat={selectedSeat}
                                    onSeatSelect={setSelectedSeat}
                                />
                            )}

                            {selectedSeat && (
                                <p className="text-sm text-center font-medium text-amber-600 dark:text-amber-400">
                                    💺 {t('reservation.selectedSeat', { seat: selectedSeat })}
                                </p>
                            )}

                            {reserveMutation.isError && getErrorMessage() && (
                                <p className="text-sm text-accent-600 text-center">{getErrorMessage()}</p>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between items-center">
                                <div className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400 truncate min-w-0">
                                    {user?.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full shrink-0" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-accent-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="truncate">{user?.name}</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        className="w-full sm:w-auto"
                                        onClick={handleClose}
                                        disabled={reserveMutation.isPending}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="reservation"
                                        className="w-full sm:w-auto"
                                        onClick={handleReserve}
                                        disabled={!selectedSeat || reserveMutation.isPending}
                                    >
                                        {reserveMutation.isPending ? t('reservation.submitting') : t('reservation.submit')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
