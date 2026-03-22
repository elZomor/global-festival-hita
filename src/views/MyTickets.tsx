'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useMyReservations } from '../api/hooks';
import type { MyReservation } from '../types';

type StatusFilter = 'ALL' | 'CONFIRMED' | 'WAITING_LIST';

const statusBadgeClass: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  WAITING_LIST: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  CLOSED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function TicketCard({ reservation }: { reservation: MyReservation }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const formattedDate = reservation.showDate
    ? new Date(reservation.showDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const formattedTime = reservation.showTime
    ? reservation.showTime.slice(0, 5)
    : '';

  const badgeClass = statusBadgeClass[reservation.status] ?? statusBadgeClass.CLOSED;
  const statusLabel = t(`myTickets.status.${reservation.status}`, reservation.status);

  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 shadow-sm overflow-hidden flex flex-col">
      <div className="flex gap-4 p-4">
        <div className="shrink-0">
          {reservation.showPoster ? (
            <img
              src={reservation.showPoster}
              alt={reservation.showName}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-accent-100 dark:bg-accent-900 flex items-center justify-center text-3xl">
              🎭
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-primary-900 dark:text-primary-50 leading-snug line-clamp-2">
            {reservation.showName}
          </h3>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-0.5">
            {reservation.festivalName}
          </p>
        </div>
      </div>

      <div className="border-t border-primary-200 dark:border-primary-700 px-4 py-3 space-y-1.5 text-sm text-primary-700 dark:text-primary-300">
        {formattedDate && (
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formattedDate}{formattedTime ? ` · ${formattedTime}` : ''}</span>
          </div>
        )}
        {reservation.venueName && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="truncate">{reservation.venueName}</span>
          </div>
        )}
        {reservation.seatNumber && (
          <div className="flex items-center gap-2">
            <span>💺</span>
            <span className="font-medium">{t('myTickets.seatNumber', { seat: reservation.seatNumber })}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span>🎟</span>
            <span className="font-medium">
              {t('myTickets.reservationNumber', { number: reservation.reservationNumber })}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 shadow-sm overflow-hidden animate-pulse">
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-lg bg-primary-200 dark:bg-primary-700 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded w-3/4" />
          <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-1/2" />
        </div>
      </div>
      <div className="border-t border-primary-200 dark:border-primary-700 px-4 py-3 space-y-2">
        <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-2/3" />
        <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-1/2" />
        <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-3/4" />
      </div>
    </div>
  );
}

export const MyTickets = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const { data: reservations, isLoading } = useMyReservations();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const filtered = (reservations ?? []).filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: t('myTickets.all') },
    { key: 'CONFIRMED', label: t('myTickets.confirmed') },
    { key: 'WAITING_LIST', label: t('myTickets.waitingList') },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
            {t('myTickets.title')}
          </h1>
          {!isLoading && reservations && (
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
              {t('myTickets.subtitle', { count: reservations.length })}
            </p>
          )}
        </div>

        <div className="flex gap-1 bg-primary-100 dark:bg-primary-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-50 shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="text-6xl">🎭</span>
          <p className="text-primary-600 dark:text-primary-400 text-lg">
            {t('myTickets.noTickets')}
          </p>
          <Link
            href="/festival"
            className="px-5 py-2 rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors font-medium"
          >
            {t('myTickets.browseShows')} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => <TicketCard key={r.id} reservation={r} />)}
        </div>
      )}
    </div>
  );
};
