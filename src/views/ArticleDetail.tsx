'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useTranslation} from 'react-i18next';
import {ArrowLeft, Calendar, User} from 'lucide-react';
import {Badge, Card, LoadingState} from '../components/common';
import {useArticles, useFestivalEditions, useShows} from '../api/hooks';
import {buildMediaUrl} from '../utils/mediaUtils';
import {getArticlePreviewText, getLocalizedArticleContent} from '../utils/articleContent';

type ArticleDetailPageProps = {
    contentType?: 'ARTICLE' | 'SYMPOSIA';
    translationNamespace?: 'articles' | 'symposia';
    listPath?: string;
    detailPath?: 'articles' | 'symposia';
};

export const ArticleDetailPage = ({
    contentType = 'ARTICLE',
    translationNamespace = 'articles',
    listPath = '/articles',
    detailPath = 'articles',
}: ArticleDetailPageProps) => {
    const params = useParams();
    const slug = params.slug as string;
    const {t, i18n} = useTranslation();
    const isRTL = i18n.language === 'ar';

    const articlesQuery = useArticles(contentType);
    const showsQuery = useShows();
    const festivalsQuery = useFestivalEditions();

    const isLoading = articlesQuery.isLoading || showsQuery.isLoading || festivalsQuery.isLoading;
    const hasError = articlesQuery.isError || showsQuery.isError || festivalsQuery.isError;

    const article = articlesQuery.data?.find(a => a.slug === slug);
    const relatedShow = article?.showId ? showsQuery.data?.find(s => s.id === article.showId) : null;
    const relatedArticles =
        articlesQuery.data
            ?.filter(
                a => a.id !== article?.id && (a.showId === article?.showId || a.editionYear === article?.editionYear),
            )
            .slice(0, 3) ?? [];
    const relatedFestival = article?.festivalId
        ? festivalsQuery.data?.find(
              festival => festival.slug === article.festivalId || String(festival.year) === article.festivalId,
          )
        : null;

    if (isLoading) {
        return <LoadingState/>;
    }

    if (hasError) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
                    {t('common.error')}
                </h2>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
                    {t('common.noResults')}
                </h2>
            </div>
        );
    }

    const attachmentUrls = (article.attachments ?? []).map(buildMediaUrl).filter(Boolean);
    const localizedTitle = isRTL ? article.titleAr : article.titleEn;
    const structuredSections = (article.sections ?? []).map(section => section.trim()).filter(Boolean);
    const hasStructuredSections = structuredSections.length > 0;
    const localizedContent = getLocalizedArticleContent(article, isRTL);
    const contentSections = localizedContent
        .split(/\r?\n\s*\r?\n/)
        .map(section => section.trim())
        .filter(Boolean);
    const fallbackContent = localizedContent ? [localizedContent] : [];
    const sectionsToRender = hasStructuredSections
        ? structuredSections
        : contentSections.length > 0
            ? contentSections
            : fallbackContent;

    const attachmentsBetweenSections: Record<number, string> = {};
    let attachmentsAfterText: string[] = [];
    let primaryAttachment: string | undefined;

    if (hasStructuredSections) {
        const queue = [...attachmentUrls];
        structuredSections.forEach((_, index) => {
            if (index < structuredSections.length - 1 && queue.length > 0) {
                attachmentsBetweenSections[index] = queue.shift() as string;
            }
        });
        attachmentsAfterText = queue;
    } else {
        [primaryAttachment, ...attachmentsAfterText] = attachmentUrls;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link
                href={listPath}
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
                                        {t(`${translationNamespace}.relatedShow`)}
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
                                        {t(`${translationNamespace}.relatedFestival`)}
                                    </p>
                                    <Link href={`/festival/${relatedFestival.slug}`}>
                                        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50 hover:underline">
                                            {isRTL ? relatedFestival.titleAr : relatedFestival.titleEn}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-primary-700 dark:text-primary-200">
                                        {new Date(relatedFestival.startDate).toLocaleDateString(
                                            isRTL ? 'ar-EG' : 'en-US',
                                            {
                                                month: 'long',
                                                day: 'numeric',
                                            },
                                        )}{' '}
                                        -{' '}
                                        {new Date(relatedFestival.endDate).toLocaleDateString(
                                            isRTL ? 'ar-EG' : 'en-US',
                                            {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            },
                                        )}
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="gold">
                            {t(`${translationNamespace}.types.${article.type}`)}
                        </Badge>
                        <Badge variant="default">
                            {article.editionYear}
                        </Badge>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-accent-600 dark:text-secondary-500 leading-tight">
                        {localizedTitle}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-primary-600 dark:text-primary-400">
                        <div className="flex items-center gap-2">
                            <User size={18}/>
                            <span className="font-medium">{article.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Calendar size={18}/>
                            <span>
                                {new Date(article.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {!hasStructuredSections && primaryAttachment && (
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
                            <div key={index} className="space-y-6">
                                <p className="whitespace-pre-line">
                                    {paragraph}
                                </p>
                                {hasStructuredSections && attachmentsBetweenSections[index] && (
                                    <div className="w-full flex justify-center">
                                        <img
                                            src={attachmentsBetweenSections[index]}
                                            alt={`${localizedTitle} section attachment ${index + 1}`}
                                            className="max-h-[360px] w-full max-w-3xl object-contain rounded-2xl bg-primary-50 dark:bg-primary-900"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {attachmentsAfterText.length > 0 && (
                    <div
                        className={`grid gap-6 ${
                            attachmentsAfterText.length === 1 ? 'grid-cols-1 justify-items-center' : 'grid-cols-1 md:grid-cols-2'
                        }`}
                    >
                        {attachmentsAfterText.map((attachment, idx) => {
                            const attachmentIndex = hasStructuredSections ? idx + 1 : idx + 2;
                            return (
                                <div key={attachment + idx} className="w-full flex justify-center">
                                    <img
                                        src={attachment}
                                        alt={`${localizedTitle} attachment ${attachmentIndex}`}
                                        className="max-h-[360px] w-full max-w-xl object-contain rounded-2xl bg-primary-50 dark:bg-primary-900"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </article>

            {relatedArticles.length > 0 && (
                <div className="border-t border-primary-300 dark:border-primary-700 pt-8">
                    <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500 mb-6">
                        {t(`${translationNamespace}.relatedArticles`)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedArticles.map(relatedArticle => {
                            const attachmentUrl = relatedArticle.attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';
                            const previewText = getArticlePreviewText(relatedArticle, isRTL);
                            return (
                                <Link key={relatedArticle.id} href={`/${detailPath}/${relatedArticle.slug}`} className="block h-full">
                                    <Card className="transition-all hover:shadow-2xl h-full">
                                        <div className="flex flex-col md:flex-row gap-4 h-full">
                                            {attachmentUrl && (
                                                <div className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={attachmentUrl}
                                                        alt={isRTL ? relatedArticle.titleAr : relatedArticle.titleEn}
                                                        className="w-full h-48 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge variant="gold">
                                                        {t(`${translationNamespace}.types.${relatedArticle.type}`)}
                                                    </Badge>
                                                    <Badge variant="default">
                                                        {relatedArticle.editionYear}
                                                    </Badge>
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                                                    {isRTL ? relatedArticle.titleAr : relatedArticle.titleEn}
                                                </h2>

                                                <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                                                    <span>
                                                        {t(`${translationNamespace}.author`)}: <span className="font-medium">{relatedArticle.author}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(relatedArticle.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </p>

                                                <p className="text-primary-700 dark:text-primary-300 leading-relaxed line-clamp-3">
                                                    {previewText ? `${previewText}...` : ''}
                                                </p>

                                                <p className="text-secondary-500 hover:text-secondary-400 font-medium">
                                                    {t(`${translationNamespace}.readMore`)} →
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

export const ArticleDetail = () => <ArticleDetailPage/>;
