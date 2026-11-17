'use client';
import {ReactNode} from 'react';
import {Button, PosterImage, ShareButton} from '../../components/common';
import type {Show} from '../../types';

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
    isAuthenticated: boolean;
    onReservationClick: () => void;
};

export const ShowHero = ({
                             show,
                             infoItems,
                             showStatusLabel,
                             showStatusClassName = 'text-primary-500',
                             isReservationStatus,
                             isReservationComplete,
                             reservationButtonVariant,
                             reserveLabel,
                             waitingListLabel,
                             completeLabel,
                             isAuthenticated,
                             onReservationClick,
                         }: ShowHeroProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5">
                {show.poster ? (
                    <div className="rounded-[3px] border border-primary-200 dark:border-primary-800 overflow-hidden shadow-kiln">
                        <PosterImage
                            src={show.poster}
                            alt={show.name}
                            className="w-full h-auto max-h-[640px] object-contain bg-primary-100 dark:bg-primary-950"
                        />
                    </div>
                ) : (
                    <div className="glaze aspect-[3/4] rounded-[3px] border border-primary-200 dark:border-primary-800 flex items-end p-6">
                        <span className="brush text-4xl text-primary-500 dark:text-primary-400">{show.name}</span>
                    </div>
                )}
            </div>

            <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                    <p className={`flex items-center gap-2 text-sm font-semibold ${showStatusClassName}`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-current" aria-hidden="true"/>
                        {showStatusLabel}
                    </p>
                    <div className="flex items-start justify-between gap-4">
                        <h1 dir="auto" className="brush fired-text text-[clamp(2.5rem,6vw,4.5rem)]">
                            {show.name}
                        </h1>
                        <ShareButton title={show.name} className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-[3px] border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-200 hover:border-ember-500 hover:text-ember-600 dark:hover:text-ember-400 transition-colors"/>
                    </div>
                    <span className="ember-swipe swipe-cool w-32" aria-hidden="true"/>
                    {show.castWord && (
                        <blockquote className="max-w-xl text-lg leading-relaxed text-primary-600 dark:text-primary-300">
                            &ldquo;{show.castWord}&rdquo;
                        </blockquote>
                    )}
                </div>

                <dl className="border-t border-primary-300 dark:border-primary-800">
                    {infoItems.map(
                        item =>
                            item.value && (
                                <div key={item.label} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4 py-3 border-b border-primary-200 dark:border-primary-800">
                                    <dt className="text-sm text-primary-500 dark:text-primary-400">{item.label}</dt>
                                    <dd className="flex flex-wrap items-center gap-2 text-primary-900 dark:text-primary-100">
                                        {item.value}
                                    </dd>
                                </div>
                            ),
                    )}
                </dl>

                {isReservationStatus && isAuthenticated && (
                    <Button
                        type="button"
                        variant={reservationButtonVariant}
                        className="w-full sm:w-auto sm:min-w-64 min-h-12"
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
    )
};
