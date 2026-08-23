import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { type ReactNode } from 'react';
import { BackButton } from '../components/common';
import { getT } from '../i18n/getT';
import { serverApiFetch, withQueryParams, apiPrefix } from '../api/server';
import {
    mapArticleApiResultToArticle,
    mapShowApiResultToShow,
    type ArticleApiResult,
    type PaginatedResponse,
    type ShowApiResult,
} from '../api/hooks';
import { compareWithToday, getLongFormattedDate, translateTime } from '../utils/dateUtils';
import {
    ShowTabsNavigation,
    ShowInfoTab,
    ShowArticlesTab,
    ShowCommentsTab,
    ShowReservationSection,
    type ShowTab,
    type ShowTabKey,
    type ShowDetailSection,
} from './show-detail';
import {isDetailEntry} from '../components/detail-display/utils';

type ShowDetailProps = {
    showId: string;
    tab?: string;
    token?: string;
};

const TAB_KEYS: ShowTabKey[] = ['info', 'articles', 'symposia', 'comments'];

export const ShowDetail = async ({ showId, tab: tabParam, token }: ShowDetailProps) => {
    const activeTab: ShowTabKey = TAB_KEYS.includes(tabParam as ShowTabKey) ? (tabParam as ShowTabKey) : 'info';

    const [t, locale, showResult, articlesResponse, symposiaResponse] = await Promise.all([
        getT(),
        getLocale(),
        serverApiFetch<ShowApiResult>(`${apiPrefix}/shows/${showId}`, 300),
        serverApiFetch<PaginatedResponse<ArticleApiResult>>(
            withQueryParams(`${apiPrefix}/articles`, { type: 'ARTICLE', page_size: 50 }),
            300,
        ),
        serverApiFetch<PaginatedResponse<ArticleApiResult>>(
            withQueryParams(`${apiPrefix}/articles`, { type: 'SYMPOSIA', page_size: 50 }),
            300,
        ),
    ]);
    const isRTL = locale === 'ar';
    const show = showResult ? mapShowApiResultToShow(showResult) : null;

    if (!show) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
                    {t('common.noResults')}
                </h2>
            </div>
        );
    }

    const relatedArticles = (articlesResponse?.results ?? [])
        .map(mapArticleApiResultToArticle)
        .filter(a => a.showId === show.id);
    const relatedSymposia = (symposiaResponse?.results ?? [])
        .map(mapArticleApiResultToArticle)
        .filter(symposium => symposium.showId === show.id);

    const showDate = show.date ? new Date(show.date) : null;
    const tabs: ShowTab[] = [
        {key: 'info', label: t('show.tabs.info')},
        {key: 'articles', label: t('show.tabs.articles')},
        {key: 'symposia', label: t('show.tabs.symposia')},
        {key: 'comments', label: t('show.tabs.comments')},
    ];
    const reservationComparison = showDate ? compareWithToday(showDate) : 'AFTER';
    const statusTranslationKey =
        reservationComparison === 'AFTER'
            ? 'show.available'
            : reservationComparison === 'BEFORE'
                ? 'show.finished'
                : 'show.today';
    const showStatusLabel = t(statusTranslationKey);
    const formattedDate = showDate ? getLongFormattedDate(locale, showDate) : t('show.notAvailable');
    const formattedTime = show.time ? translateTime(show.time, locale) : t('show.timeTBD');
    const showStatusClassName = (() => {
        if (!show.date) return 'text-accent-500';
        const comparison = compareWithToday(new Date(show.date));
        switch (comparison) {
            case 'AFTER':
                return 'text-secondary-600 dark:text-secondary-400';
            case 'EQUALS':
                return 'text-theatre-gold-500 dark:text-theatre-gold-400';
            case 'BEFORE':
            default:
                return 'text-accent-600 dark:text-accent-400';
        }
    })();
    const festivalDisplayName = show.festivalName ?? (show.editionYear ? t('show.festivalFallback', {year: show.editionYear}) : undefined);
    const festivalRouteParam = show.festivalId;
    const festivalLinkValue = festivalDisplayName && festivalRouteParam ? (
        <Link
            href={`/festival/${festivalRouteParam}`}
            className="text-secondary-600 dark:text-secondary-400 underline"
        >
            {festivalDisplayName}
        </Link>
    ) : (
        <span className="text-primary-600 dark:text-primary-300">{t('show.unknownFestival')}</span>
    );
    const eventLinkValue = show.bookingUrl && (
        <a
            href={show.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-secondary-600 dark:text-secondary-400 underline"
        >
            {t('show.openEventLink')}
        </a>
    );
    const venueValue = (
        <span className="inline-flex items-center gap-2 flex-wrap text-primary-800 dark:text-primary-100">
      {show.venueName}
            {show.venueLocation && (
                <a
                    href={show.venueLocation}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary-600 dark:text-secondary-400 text-sm underline"
                >
                    {t('show.viewMap')}
                </a>
            )}
    </span>
    );

    const infoItems: { label: string; value: ReactNode }[] = [
        {label: t('show.eventLink'), value: eventLinkValue},
        {label: t('show.festivalName'), value: festivalLinkValue},
        {label: t('show.authorLabel'), value: show.author ?? t('show.notAvailable')},
        {label: t('show.director'), value: show.director ?? t('show.notAvailable')},
        {label: t('show.venue'), value: venueValue},
        {label: t('show.dateLabel'), value: formattedDate},
        {label: t('show.timeLabel'), value: formattedTime},
    ];

    type DetailSectionSource = ShowDetailSection['items'] | string | string[] | undefined;
    const buildDetailSection = (title: string, source?: DetailSectionSource): ShowDetailSection | undefined => {
        if (!source) {
            return undefined;
        }

        if (Array.isArray(source)) {
            if (source.length === 0) {
                return undefined;
            }

            if (isDetailEntryArray(source)) {
                return {title, items: source};
            }

            const normalized = source
                .map(value => (typeof value === 'string' ? value.trim() : ''))
                .filter(Boolean);

            if (normalized.length === 0) {
                return undefined;
            }

            return {
                title,
                items: normalized.map(text => ({text})),
            };
        }

        if (typeof source === 'string') {
            const trimmed = source.trim();
            if (!trimmed) {
                return undefined;
            }

            return {
                title,
                items: [{text: trimmed}],
            };
        }

        return {
            title,
            items: source,
        };
    };

    const isDetailEntryArray = (items: unknown[]): items is ShowDetailSection['items'] =>
        items.every(item => isDetailEntry(item));

    const descriptionSection = buildDetailSection(t('show.sections.synopsis'), show.showDescription);
    const actorsSection = buildDetailSection(t('show.sections.actors'), show.cast);
    const crewSection = buildDetailSection(t('show.sections.crew'), show.crew);
    const additionalSection = buildDetailSection(t('show.sections.additional'), show.notes);

    const tabHref = (tabKey: ShowTabKey) => {
        const params = new URLSearchParams();
        params.set('tab', tabKey);
        if (token) params.set('token', token);
        return `/shows/${showId}?${params.toString()}`;
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'articles':
                return (
                    <ShowArticlesTab
                        title={t('show.criticalArticles')}
                        emptyLabel={t('show.noArticles')}
                        authorLabel={t('articles.author')}
                        readMoreLabel={t('articles.readMore')}
                        isRTL={isRTL}
                        articles={relatedArticles}
                        getTypeLabel={type => t(`articles.types.${type}`)}
                        detailPath="articles"
                    />
                );
            case 'symposia':
                return (
                    <ShowArticlesTab
                        title={t('show.symposium')}
                        emptyLabel={t('show.noSymposia')}
                        authorLabel={t('symposia.author')}
                        readMoreLabel={t('symposia.readMore')}
                        isRTL={isRTL}
                        articles={relatedSymposia}
                        getTypeLabel={type => t(`symposia.types.${type}`)}
                        detailPath="symposia"
                    />
                );
            case 'comments':
                return <ShowCommentsTab showId={show.id} openForComments={show.openForComments}/>;
            case 'info':
            default:
                return (
                    <ShowInfoTab
                        descriptionSection={descriptionSection}
                        actorsSection={actorsSection}
                        crewSection={crewSection}
                        additionalSection={additionalSection}
                    />
                );
        }
    };

    return (
        <div className="space-y-8">
            <BackButton label={t('common.back')} isRTL={isRTL}/>

            <ShowReservationSection
                show={show}
                infoItems={infoItems}
                showStatusLabel={showStatusLabel}
                showStatusClassName={showStatusClassName}
                isRTL={isRTL}
                reserveLabel={t('show.reserve')}
                waitingListLabel={t('show.reserve_waiting_list')}
                completeLabel={t('show.complete')}
                bookTicketLabel={t('show.bookTicket')}
                token={token}
            />

            <ShowTabsNavigation tabs={tabs} activeTab={activeTab} getHref={tabHref}/>

            {renderActiveTab()}
        </div>
    );
};
