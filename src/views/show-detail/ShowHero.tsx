'use client';
import {ReactNode} from 'react';
import {Button, PosterImage} from '../../components/common';
import type {Show} from '../../types';
import {motion} from 'framer-motion';
import {Share2} from 'lucide-react';
import {useTranslation} from 'react-i18next';

type InfoItem = {
    label: string;
    value: ReactNode;
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'reservation' | 'waiting' | 'complete' | 'disabled';

type ShowHeroProps = {
    show: Show;
    infoItems: InfoItem[];
    showStatusLabel: string;
    showStatusClassName?: string;
    isRTL: boolean;
    isReservationStatus: boolean;
    isReservationComplete: boolean;
    reservationButtonVariant: ButtonVariant;
    reserveLabel: string;
    waitingListLabel: string;
    completeLabel: string;
    bookTicketLabel: string;
    onReservationClick: () => void;
};

export const ShowHero = ({
                             show,
                             infoItems,
                             showStatusLabel,
                             showStatusClassName = 'text-accent-500',
                             isReservationStatus,
                             isReservationComplete,
                             reservationButtonVariant,
                             reserveLabel,
                             waitingListLabel,
                             completeLabel,
                             onReservationClick,
                         }: ShowHeroProps) => {
    const {t} = useTranslation();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                {show.poster && (
                    <PosterImage
                        src={show.poster}
                        alt={`${show.name} - مسرحية`}
                        className="w-full h-auto max-h-[500px] object-contain"
                    />
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                        <h1 className="text-4xl font-bold text-accent-600 dark:text-secondary-500 mb-2">
                            {show.name}
                        </h1>
                        <motion.button
                            onClick={() => {
                                const url = window.location.href;
                                if (navigator.share) {
                                    navigator.share({
                                        title: show.name,
                                        url,
                                    });
                                } else {
                                    navigator.clipboard.writeText(url);
                                    alert(t('link_copied'));
                                }
                            }}
                            className="text-sm mx-2 text-accent-500 hover:text-secondary-500 font-medium underline text-center md:text-left"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            <Share2 size={30}/>
                        </motion.button>
                    </div>
                    {show.castWord && (<h3 className="mb-2 text-primary-500 flex items-center gap-2 italic">
                        "{show.castWord}"
                    </h3>)}
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${showStatusClassName}`}>
                        {showStatusLabel}
                    </h3>
                </div>

                <div className="space-y-3 text-lg text-primary-800 dark:text-primary-100">
                    {infoItems.map(
                        item =>
                            item.value && (
                                <div key={item.label} className="grid grid-cols-1 sm:grid-cols-9 gap-3 items-center">
                                <span
                                    className="font-semibold text-primary-600 dark:text-primary-300 sm:col-span-2">{item.label}:</span>
                                    <span
                                        className="inline-flex flex-wrap items-center gap-2 text-primary-900 dark:text-primary-100 sm:col-span-7">
                                    {item.value}
                                </span>
                                </div>
                            ),
                    )}
                </div>

                <div className="space-y-3 flex flex-col items-center">
                    {isReservationStatus && (
                        <Button
                            type="button"
                            variant={reservationButtonVariant}
                            className="w-[70%]"
                            onClick={onReservationClick}
                            disabled={isReservationComplete}
                        >
                            {reservationButtonVariant === 'reservation'
                                ? reserveLabel
                                : reservationButtonVariant === 'waiting'
                                    ? waitingListLabel
                                    : completeLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
};
