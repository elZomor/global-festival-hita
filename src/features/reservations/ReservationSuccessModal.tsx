'use client';
import {useTranslation} from 'react-i18next';
import {Button, Card} from '../../components/common';
import type {ReserveShowResponse} from '../../api/hooks';

type ReservationSuccessModalProps = {
    isOpen: boolean;
    reservation?: ReserveShowResponse | null;
    onClose: () => void;
};

export const ReservationSuccessModal = ({isOpen, reservation, onClose}: ReservationSuccessModalProps) => {
    const {t} = useTranslation();

    if (!isOpen || !reservation) return null;

    const isWaitingList = reservation.reservationStatus === 'WAITING_LIST';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-primary-950/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="w-full max-w-md" onClick={event => event.stopPropagation()}>
                <Card className="space-y-4 text-center" hover={false}>
                    <p className="text-xl font-semibold text-primary-900 dark:text-primary-100">
                        {isWaitingList
                            ? t('reservation.successModal.waitingListTitle')
                            : t('reservation.successModal.title')}
                    </p>
                    <>
                        <p className="text-lg text-primary-800 dark:text-primary-50">
                            {t('reservation.successModal.nameLabel')}: {reservation.name}
                        </p>
                        {isWaitingList ? (
                            <>
                                <p className="text-lg text-primary-800 dark:text-primary-50">
                                    {t('reservation.successModal.waitingListPositionLabel')}: {reservation.seatNumber}
                                </p>
                                <p className="text-xs text-primary-600 dark:text-primary-300">
                                    {t('reservation.successModal.waitingListInstruction')}
                                </p>
                            </>
                        ) : (
                            <>
                                {reservation.seatNumber && (
                                    <p className="text-lg text-primary-800 dark:text-primary-50">
                                        {t('reservation.successModal.seatNumberLabel')}: {reservation.seatNumber}
                                    </p>
                                )}
                                <p className="text-xs text-primary-600 dark:text-primary-300">
                                    {t('reservation.successModal.instruction')}
                                </p>
                            </>
                        )}
                    </>

                    <div className="pt-2">
                        <Button variant="primary" className="w-full" onClick={onClose}>
                            {t('reservation.successModal.close')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
