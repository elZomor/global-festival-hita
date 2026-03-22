'use client';
import Link from 'next/link';
import {Badge, Card, SectionHeader} from '../../components/common';
import type {Article} from '../../types';
import {buildMediaUrl} from '../../utils/mediaUtils';
import {getArticlePreviewText} from '../../utils/articleContent';

type ShowArticlesTabProps = {
    title: string;
    emptyLabel: string;
    authorLabel: string;
    readMoreLabel: string;
    isRTL: boolean;
    articles: Article[];
    getTypeLabel: (type: Article['type']) => string;
    detailPath?: string;
};

export const ShowArticlesTab = ({
    title,
    emptyLabel,
    authorLabel,
    readMoreLabel,
    isRTL,
    articles,
    getTypeLabel,
    detailPath = 'articles',
}: ShowArticlesTabProps) => (
    <div className="space-y-6 w-full md:w-[85%] mx-auto">
        <SectionHeader>{title}</SectionHeader>
        {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map(article => {
                    const attachmentUrl =
                        article.attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';
                    const preview = getArticlePreviewText(article, isRTL);

                    return (
                        <Link key={article.id} href={`/${detailPath}/${article.slug}`} className="block h-full">
                            <Card className="transition-all hover:shadow-2xl h-full">
                                <div className="flex flex-col md:flex-row gap-4 h-full">
                                    {attachmentUrl && (
                                        <div className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
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
                                                {getTypeLabel(article.type)}
                                            </Badge>
                                            <Badge variant="default">
                                                {article.editionYear}
                                            </Badge>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                                            {isRTL ? article.titleAr : article.titleEn}
                                        </h2>

                                        <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                                            <span>
                                                {authorLabel}: <span className="font-medium">{article.author}</span>
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
                                            {preview ? `${preview}...` : ''}
                                        </p>

                                        <p className="text-secondary-500 hover:text-secondary-400 font-medium">
                                            {readMoreLabel} →
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-primary-600 dark:text-primary-400">{emptyLabel}</p>
            </div>
        )}
    </div>
);
