'use client';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {FileText} from 'lucide-react';
import {Card, Badge, SectionHeader, LoadingState} from '../components/common';
import {useArticles, useShows} from '../api/hooks';
import {buildMediaUrl} from '../utils/mediaUtils';
import {getArticlePreviewText} from '../utils/articleContent';

type ArticleListingPageProps = {
    contentType?: 'ARTICLE' | 'SYMPOSIA';
    translationNamespace?: 'articles' | 'symposia';
    detailPath?: 'articles' | 'symposia';
};

export const ArticleListingPage = ({
                                       contentType = 'ARTICLE',
                                       translationNamespace = 'articles',
                                       detailPath = 'articles',
                                   }: ArticleListingPageProps) => {
    const {t, i18n} = useTranslation();
    const isRTL = i18n.language === 'ar';
    const {
        data: articles = [],
        isLoading,
        isError,
    } = useArticles(contentType);
    const {
        data: shows = [],
        isLoading: isLoadingShows,
        isError: hasShowsError,
    } = useShows();

    const getPrimaryAttachment = (attachments?: string[]) =>
        attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';

    const filteredArticles = articles

    const getShowTitle = (showId?: string) => {
        if (!showId) return null;
        const show = shows.find(s => s.id === showId);
        return show ? show.name : null;
    };

    if (isLoading || isLoadingShows) {
        return <LoadingState/>;
    }

    if (isError || hasShowsError) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.error')}</p>
            </div>
        );
    }

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
