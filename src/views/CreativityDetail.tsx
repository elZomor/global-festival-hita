import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Badge, Card } from '../components/common';
import { getT } from '../i18n/getT';
import { serverApiFetch, withQueryParams, apiPrefix } from '../api/server';
import {
    mapArticleApiResultToCreativity,
    mapFestivalApiResultToEdition,
    mapShowApiResultToShow,
    type ArticleApiResult,
    type FestivalApiResponse,
    type PaginatedResponse,
    type ShowApiResult,
} from '../api/hooks';
import { buildMediaUrl } from '../utils/mediaUtils';

export const CreativityDetail = async ({ slug }: { slug: string }) => {
    const [t, locale, creativityResponse, showsResponse, festivalsResponse] = await Promise.all([
        getT(),
        getLocale(),
        serverApiFetch<PaginatedResponse<ArticleApiResult>>(
            withQueryParams(`${apiPrefix}/articles`, { type: 'CREATIVITY', page_size: 50 }),
            300,
        ),
        serverApiFetch<PaginatedResponse<ShowApiResult>>(`${apiPrefix}/shows`, 300),
        serverApiFetch<FestivalApiResponse>(`${apiPrefix}/festivals`, 3600),
    ]);
    const isRTL = locale === 'ar';

    const creativityEntries = (creativityResponse?.results ?? []).map(mapArticleApiResultToCreativity);
    const shows = (showsResponse?.results ?? []).map(mapShowApiResultToShow);
    const festivals = (festivalsResponse?.results ?? []).map(mapFestivalApiResultToEdition);

    const entry = creativityEntries.find(item => item.slug === slug || item.id === slug);
    const relatedShow = entry?.showId ? shows.find(show => show.id === entry.showId) : null;
    const relatedEntries = creativityEntries
        .filter(item => item.id !== entry?.id && item.editionYear === entry?.editionYear)
        .slice(0, 3);
    const relatedFestival = entry?.festivalId
        ? festivals.find(
              festival => festival.slug === entry.festivalId || String(festival.year) === entry.festivalId,
          )
        : null;

    if (!entry) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
                    {t('common.noResults')}
                </h2>
            </div>
        );
    }

    const attachmentUrls = (entry.attachments ?? []).map(buildMediaUrl).filter(Boolean);
    const [primaryAttachment, ...extraAttachments] = attachmentUrls;
    const localizedTitle = isRTL ? entry.titleAr ?? entry.title : entry.titleEn ?? entry.title;
    const localizedContent = (isRTL ? entry.contentAr ?? entry.content : entry.contentEn ?? entry.content) ?? '';
    const contentSections = localizedContent
        .split(/\r?\n\s*\r?\n/)
        .map(section => section.trim())
        .filter(Boolean);
    const sectionsToRender = contentSections.length > 0 ? contentSections : [localizedContent];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link
                href="/creativity"
                className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-400 transition-colors"
            >
                <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''}/>
                {t('common.backToList')}
            </Link>

            <article className="space-y-6">
                {(relatedShow || relatedFestival) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedShow && (
                            <Card className="border border-secondary-300 h-full">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wide text-secondary-500">
                                        {t('creativity.relatedShow')}
                                    </p>
                                    <Link href={`/shows/${relatedShow.id}`}>
                                        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50 hover:underline">
                                            {relatedShow.name}
                                        </h3>
                                    </Link>
                                </div>
                            </Card>
                        )}

                        {relatedFestival && (
                            <Card className="border border-primary-300 h-full">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wide text-secondary-500">
                                        {t('creativity.relatedFestival')}
                                    </p>
                                    <Link href={`/festival/${relatedFestival.slug}`}>
                                        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50 hover:underline">
                                            {isRTL ? relatedFestival.titleAr : relatedFestival.titleEn}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-primary-700 dark:text-primary-200">
                                        {new Date(relatedFestival.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                        })}{' '}
                                        -{' '}
                                        {new Date(relatedFestival.endDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="gold">
                            {t(`creativity.types.${entry.type}`)}
                        </Badge>
                        {entry.editionYear && (
                            <Badge variant="default">
                                {entry.editionYear}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-accent-600 dark:text-secondary-500 leading-tight">
                        {localizedTitle}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-primary-600 dark:text-primary-400">
                        <div className="flex items-center gap-2">
                            <User size={18}/>
                            <span className="font-medium">{entry.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Calendar size={18}/>
                            <span>
                                {new Date(entry.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {primaryAttachment && (
                    <div className="w-full flex justify-center">
                        <img
                            src={primaryAttachment}
                            alt={localizedTitle}
                            className="max-h-[360px] w-full max-w-3xl object-contain rounded-2xl bg-primary-50 dark:bg-primary-900"
                        />
                    </div>
                )}

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div
                        className="text-primary-800 dark:text-primary-200 leading-relaxed space-y-6"
                        style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.75',
                        }}
                    >
                        {sectionsToRender.map((paragraph, index) => (
                            <p key={index} className="mb-6 whitespace-pre-line">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                {extraAttachments.length > 0 && (
                    <div
                        className={`grid gap-6 ${
                            extraAttachments.length === 1 ? 'grid-cols-1 justify-items-center' : 'grid-cols-1 md:grid-cols-2'
                        }`}
                    >
                        {extraAttachments.map((attachment, idx) => (
                            <div key={attachment + idx} className="w-full flex justify-center">
                                <img
                                    src={attachment}
                                    alt={`${localizedTitle} attachment ${idx + 2}`}
                                    className="max-h-[360px] w-full max-w-xl object-contain rounded-2xl bg-primary-50 dark:bg-primary-900"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </article>

            {relatedEntries.length > 0 && (
                <div className="border-t border-primary-300 dark:border-primary-700 pt-8">
                    <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500 mb-6">
                        {t('creativity.relatedArticles')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedEntries.map(item => {
                            const relatedTitle = isRTL ? item.titleAr ?? item.title : item.titleEn ?? item.title;
                            const preview = isRTL ? item.contentAr ?? item.content : item.contentEn ?? item.content;
                            const attachmentUrl = item.attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';
                            return (
                                <Link key={item.id} href={`/creativity/${item.slug}`} className="block h-full">
                                    <Card className="transition-all hover:shadow-2xl h-full">
                                        <div className="flex flex-col md:flex-row gap-4 h-full">
                                            {attachmentUrl && (
                                                <div className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={attachmentUrl}
                                                        alt={relatedTitle}
                                                        className="w-full h-48 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge variant="gold">
                                                        {t(`creativity.types.${item.type}`)}
                                                    </Badge>
                                                    {item.editionYear && (
                                                        <Badge variant="default">
                                                            {item.editionYear}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                                                    {relatedTitle}
                                                </h2>

                                                <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                                                    <span>
                                                        {t('creativity.by')} <span className="font-medium">{item.author}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </p>

                                                <p className="text-primary-700 dark:text-primary-300 leading-relaxed line-clamp-3">
                                                    {preview.substring(0, 250)}...
                                                </p>

                                                <p className="text-secondary-500 hover:text-secondary-400 font-medium">
                                                    {t('creativity.readMore')} →
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
