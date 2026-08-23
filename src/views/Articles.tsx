import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { FileText } from 'lucide-react';
import { Card, Badge, SectionHeader } from '../components/common';
import { getT } from '../i18n/getT';
import { serverApiFetch, withQueryParams, apiPrefix } from '../api/server';
import {
    mapArticleApiResultToArticle,
    mapShowApiResultToShow,
    type ArticleApiResult,
    type PaginatedResponse,
    type ShowApiResult,
} from '../api/hooks';
import { buildMediaUrl } from '../utils/mediaUtils';
import { getArticlePreviewText } from '../utils/articleContent';

type ArticleListingPageProps = {
    contentType?: 'ARTICLE' | 'SYMPOSIA';
    translationNamespace?: 'articles' | 'symposia';
    detailPath?: 'articles' | 'symposia';
};

export const ArticleListingPage = async ({
                                       contentType = 'ARTICLE',
                                       translationNamespace = 'articles',
                                       detailPath = 'articles',
                                   }: ArticleListingPageProps) => {
    const [t, isRTL, articlesResponse, showsResponse] = await Promise.all([
        getT(),
        getLocale().then(locale => locale === 'ar'),
        serverApiFetch<PaginatedResponse<ArticleApiResult>>(
            withQueryParams(`${apiPrefix}/articles`, { type: contentType, page_size: 50 }),
            300,
        ),
        serverApiFetch<PaginatedResponse<ShowApiResult>>(`${apiPrefix}/shows`, 300),
    ]);

    const articles = (articlesResponse?.results ?? []).map(mapArticleApiResultToArticle);
    const shows = (showsResponse?.results ?? []).map(mapShowApiResultToShow);

    const getPrimaryAttachment = (attachments?: string[]) =>
        attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';

    const filteredArticles = articles

    const getShowTitle = (showId?: string) => {
        if (!showId) return null;
        const show = shows.find(s => s.id === showId);
        return show ? show.name : null;
    };

    return (
        <div className="space-y-6 w-full md:w-[85%] mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileText size={40} className="text-accent-600 dark:text-secondary-500"/>
                    <SectionHeader className="mb-0">{t(`${translationNamespace}.title`)}</SectionHeader>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map(article => {
                    const attachmentUrl = getPrimaryAttachment(article.attachments);
                    const previewText = getArticlePreviewText(article, isRTL);
                    return (
                        <Link key={article.id} href={`/${detailPath}/${article.slug}`} className="block h-full">
                            <Card className="transition-all hover:shadow-2xl h-full">
                                <div className="flex flex-col md:flex-row gap-4 h-full">
                                    {attachmentUrl && (
                                        <div
                                            className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={attachmentUrl}
                                                alt={isRTL ? article.titleAr : article.titleEn}
                                                className="w-full h-48 object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="gold">
                                                {t(`${translationNamespace}.types.${article.type}`)}
                                            </Badge>
                                            <Badge variant="default">
                                                {article.editionYear}
                                            </Badge>
                                            {article.showId && (
                                                <Badge variant="red">
                                                    {getShowTitle(article.showId)}
                                                </Badge>
                                            )}
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                                            {isRTL ? article.titleAr : article.titleEn}
                                        </h2>

                                        <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                      <span>
                        {t(`${translationNamespace}.author`)}: <span className="font-medium">{article.author}</span>
                      </span>
                                            <span>•</span>
                                            <span>
                        {new Date(article.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
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

            {filteredArticles.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-primary-600 dark:text-primary-400 text-lg">
                        {t('common.noResults')}
                    </p>
                </div>
            )}
        </div>
    );
};

export const Articles = () => <ArticleListingPage/>;
