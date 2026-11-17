'use client';
import {useLocale} from 'next-intl';
import Link from 'next/link';
import {useT} from '../../i18n/useT';
import {Show} from '../../types';
import {compareWithToday, getLongFormattedDate, translateTime} from "../../utils/dateUtils";

interface ShowCardProps {
    show: Show;
}

type ShowState = 'upcoming' | 'today' | 'past';

const showState = (date: string): ShowState => {
    switch (compareWithToday(new Date(date))) {
        case 'AFTER':
            return 'upcoming';
        case 'EQUALS':
            return 'today';
        default:
            return 'past';
    }
};

// A show as a fired vessel: tonight's show glows ember, upcoming shows are
// glazed, past shows cool to soot (poster desaturated).
export const ShowCard = ({show}: ShowCardProps) => {
    const t = useT();
    const locale = useLocale();
    const state = showState(show.date);
    const stateLabel = {
        upcoming: t('show.available'),
        today: t('show.today'),
        past: t('show.finished'),
    }[state];

    return (
        <Link
            href={`/shows/${show.id}`}
            className={`group flex h-full flex-col rounded-[3px] border bg-primary-50 dark:bg-primary-900 transition-[border-color,box-shadow] duration-300 hover:shadow-kiln ${
                state === 'today'
                    ? 'border-ember-500'
                    : 'border-primary-200 dark:border-primary-800 hover:border-ember-500/70'
            }`}
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[3px] bg-primary-200 dark:bg-primary-950">
                {show.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={show.poster}
                        alt={show.name}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-[filter] duration-700 ease-out ${
                            state === 'past' ? 'grayscale contrast-110 group-hover:grayscale-0' : ''
                        }`}
                    />
                ) : (
                    <div className="glaze flex h-full w-full items-end p-5">
                        <span className="brush text-3xl text-primary-500 dark:text-primary-400">{show.name}</span>
                    </div>
                )}
                <span
                    className={`absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-semibold ${
                        state === 'today'
                            ? 'bg-ember-500 text-primary-950'
                            : state === 'upcoming'
                                ? 'bg-primary-50/90 text-primary-950 dark:bg-primary-950/85 dark:text-primary-50'
                                : 'bg-primary-950/75 text-primary-200'
                    }`}
                >
                    {state === 'today' && <span className="h-1.5 w-1.5 rounded-full bg-primary-950" aria-hidden="true"/>}
                    {stateLabel}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
                <h3 className="text-xl font-semibold leading-snug text-primary-950 dark:text-primary-50">
                    {show.name}
                </h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-primary-500 dark:text-primary-400">{t('show.director')}</dt>
                    <dd className="text-primary-800 dark:text-primary-200">{show.director}</dd>
                    <dt className="text-primary-500 dark:text-primary-400">{t('show.venue')}</dt>
                    <dd className="text-primary-800 dark:text-primary-200">{show.venueName}</dd>
                    <dt className="text-primary-500 dark:text-primary-400">{t('show.dateLabel')}</dt>
                    <dd className="text-primary-800 dark:text-primary-200 tabular">
                        {getLongFormattedDate(locale, new Date(show.date))} · {translateTime(show.time, locale)}
                    </dd>
                </dl>
                <span className="mt-auto pt-2 text-sm font-medium text-primary-900 dark:text-primary-100 underline decoration-ember-500/60 underline-offset-4 group-hover:decoration-ember-500">
                    {t('show.viewDetails')}
                </span>
            </div>
        </Link>
    );
};
