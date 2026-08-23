'use client';
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShowHero } from './ShowHero';
import { ReservationModal } from '../../features/reservations/ReservationModal';
import { ReservationSuccessModal } from '../../features/reservations/ReservationSuccessModal';
import { useIsHitaMember, useReserveShow, type ReserveShowResponse } from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import type { Show } from '../../types';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'reservation' | 'waiting' | 'complete' | 'disabled';

const RESERVATION_STATUSES = ['OPEN_FOR_RESERVATION', 'OPEN_FOR_WAITING_LIST', 'COMPLETE'];

const getReservationStatusClass = (status: string): ButtonVariant => {
    switch (status) {
        case 'OPEN_FOR_RESERVATION':
            return 'reservation';
        case 'OPEN_FOR_WAITING_LIST':
            return 'waiting';
        case 'COMPLETE':
            return 'complete';
        default:
            return 'secondary';
    }
};

type ShowReservationSectionProps = {
    show: Show;
    infoItems: { label: string; value: ReactNode }[];
    showStatusLabel: string;
    showStatusClassName?: string;
    isRTL: boolean;
    reserveLabel: string;
    waitingListLabel: string;
    completeLabel: string;
    bookTicketLabel: string;
    token?: string;
};

export const ShowReservationSection = ({
    show,
    infoItems,
    showStatusLabel,
    showStatusClassName,
    isRTL,
    reserveLabel,
    waitingListLabel,
    completeLabel,
    bookTicketLabel,
    token,
}: ShowReservationSectionProps) => {
    const { isAuthenticated } = useAuth();
    const { data: isHitaMember } = useIsHitaMember(isAuthenticated);
    const reserveMutation = useReserveShow();
    const [isReservationOpen, setReservationOpen] = useState(false);
    const [reservationSuccess, setReservationSuccess] = useState<ReserveShowResponse | null>(null);
    const queryClient = useQueryClient();

    const isReservationStatus = RESERVATION_STATUSES.includes(show.isOpenForReservation)
        && (!isAuthenticated || Boolean(token) || isHitaMember === true);
    const isReservationComplete = show.isOpenForReservation === 'COMPLETE';
    const reservationButtonVariant = getReservationStatusClass(show.isOpenForReservation);

    const handleSuccessModalClose = () => {
        setReservationSuccess(null);
        queryClient.invalidateQueries({queryKey: ['show']});
        queryClient.invalidateQueries({queryKey: ['shows']});
    };

    return (
        <>
            <ShowHero
                show={show}
                infoItems={infoItems}
                showStatusLabel={showStatusLabel}
                showStatusClassName={showStatusClassName}
                isRTL={isRTL}
                isReservationStatus={isReservationStatus}
                isReservationComplete={isReservationComplete}
                reservationButtonVariant={reservationButtonVariant}
                isAuthenticated={isAuthenticated}
                reserveLabel={reserveLabel}
                waitingListLabel={waitingListLabel}
                completeLabel={completeLabel}
                bookTicketLabel={bookTicketLabel}
                onReservationClick={async () => {
                    if (show.isOpenForReservation === 'OPEN_FOR_WAITING_LIST' && isAuthenticated) {
                        try {
                            const response = await reserveMutation.mutateAsync({ showId: show.id, token });
                            setReservationSuccess(response.data);
                        } catch {
                            setReservationOpen(true);
                        }
                    } else {
                        setReservationOpen(true);
                    }
                }}
            />

            {isReservationStatus && (
                <ReservationModal
                    showId={show.id}
                    showName={show.name}
                    isOpen={isReservationOpen}
                    onClose={() => setReservationOpen(false)}
                    onSuccess={response => setReservationSuccess(response)}
                    token={token}
                />
            )}
            <ReservationSuccessModal
                isOpen={Boolean(reservationSuccess)}
                reservation={reservationSuccess}
                onClose={handleSuccessModalClose}
            />
        </>
    );
};
