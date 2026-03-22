'use client';
import {useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {Calendar, ArrowLeft, Share2} from 'lucide-react';
import {Badge, Card, LoadingState} from '../components/common';
import {festivalConfig} from '../config/festival';
import {ShowCard} from '../features/festival/ShowCard';
import {
    useArticles,
    useCreativityEntries,
    useFestivalEditions,
    useShows,
    useSymposia,
} from '../api/hooks';
import {formatLocalizedNumber, localizeDigitsInString} from '../utils/numberUtils';
import {buildMediaUrl} from '../utils/mediaUtils';
import {getArticlePreviewText} from '../utils/articleContent';
import {FestivalInfoTab} from './festival-detail';
import {baseUrl} from "../constants";
import {motion} from "framer-motion";

type Tab = 'info' | 'shows' | 'articles' | 'symposia' | 'creativity';

export const FestivalEdition = () => {
    const params = useParams();
    const festivalSlug = params.festivalSlug as string;
    const {t, i18n} = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [activeTab, setActiveTab] = useState<Tab>('info');

    const editionsQuery = useFestivalEditions();
    const edition = editionsQuery.data?.find(e => e.slug === festivalSlug);
    const showsQuery = useShows(edition?.id, {enabled: Boolean(edition?.id)});
    const articlesQuery = useArticles();
    const symposiaQuery = useSymposia();
    const creativityQuery = useCreativityEntries();

    const isLoading =
        editionsQuery.isLoading ||
        showsQuery.isLoading ||
        articlesQuery.isLoading ||
        symposiaQuery.isLoading ||
        creativityQuery.isLoading;

    const hasError =
        editionsQuery.isError ||
        showsQuery.isError ||
        articlesQuery.isError ||
        symposiaQuery.isError ||
        creativityQuery.isError;

    const shows = showsQuery.data ?? [];
    const articles = (articlesQuery.data ?? []).filter(a => a.festivalId === edition?.id);
    const symposia = (symposiaQuery.data ?? []).filter(s => s.festivalId === edition?.id);
    const creativity = (creativityQuery.data ?? []).filter(c => c.festivalId === edition?.id);
    const getAttachmentUrl = (attachments?: string[]) =>
        attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';

    if (isLoading) {
        return <LoadingState/>;
    }

    if (hasError) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.error')}</p>
            </div>
        );
    }

    if (!edition) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">
                    {t('common.noResults')}
                </h2>
            </div>
        );
    }

    const tabs: { key: Tab; label: string }[] = [
        {key: 'info', label: t('festival.info')},
        {key: 'shows', label: t('festival.shows')},
        {key: 'articles', label: t('festival.articles')},
        {key: 'symposia', label: t('festival.symposia')},
        {key: 'creativity', label: t('festival.creativity')},
    ];

    const localizedTitle = localizeDigitsInString(
        isRTL ? edition.titleAr : edition.titleEn,
        i18n.language
    );
    const localizedDescription = localizeDigitsInString(
        isRTL ? edition.descriptionAr : edition.descriptionEn,
        i18n.language
    );

    return (
        <div className="space-y-8">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-400 transition-colors"
            >
                <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''}/>
                {t('common.backToList')}
            </Link>

            <div
                className="bg-gradient-to-r from-accent-600 to-accent-700 dark:from-accent-700 dark:to-accent-800 rounded-2xl p-8 text-primary-50 shadow-2xl">
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">

                    <Calendar size={32} className="text-secondary-500"/>
                    <h1 className="text-3xl md:text-4xl font-bold">
                        {localizedTitle}
                    </h1>
                    <motion.button
                        onClick={() => {
                            const url = `${baseUrl}${festivalConfig.apiPrefix}/festivals/${edition.slug}/share`;
                            if (navigator.share) {
                                navigator.share({
                                    title: edition.titleAr,
                                    url,
                                });
                            } else {
                                navigator.clipboard.writeText(url);
                                alert(t('link_copied'));
                            }
                        }}
                        className="text-sm mx-2 hover:text-accent-500 text-secondary-500 font-medium underline text-center md:text-left"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                    >
                        <Share2 size={30}/>
                    </motion.button>
                </div>

                <p className="text-lg text-primary-100 dark:text-primary-200 mb-4">
                    {localizedDescription}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                    <Badge variant="gold">
                        {new Date(edition.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                            month: 'long',
                            day: 'numeric'
                        })} - {new Date(edition.endDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                    </Badge>
                    <Badge variant="default">
                        {formatLocalizedNumber(edition.totalShows, i18n.language)} {t('festival.numberOfShows')}
                    </Badge>
                    <Badge variant="default">
                        {formatLocalizedNumber(edition.totalArticles, i18n.language)} {t('festival.numberOfArticles')}
                    </Badge>
                </div>
            </div>

            <div className="border-b border-primary-300 dark:border-primary-700">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                px-6 py-3 font-medium transition-all duration-300
                border-b-2 whitespace-nowrap
                ${activeTab === tab.key
                                ? 'border-secondary-500 text-accent-600 dark:text-secondary-500'
                                : 'border-transparent text-primary-600 dark:text-primary-400 hover:text-accent-600 dark:hover:text-secondary-500'
                            }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'info' && (
                <FestivalInfoTab edition={edition}/>
            )}

            {activeTab === 'shows' && (
                <div className="space-y-6">


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shows.map(show => (
                            <ShowCard key={show.id} show={show}/>
                        ))}
                    </div>

                    {shows.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-primary-600 dark:text-primary-400">{t('common.noResults')}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'articles' && (
                <div className="space-y-6 w-full md:w-[85%] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {articles.map(article => {
                            const attachmentUrl = getAttachmentUrl(article.attachments);
                            const previewText = getArticlePreviewText(article, isRTL);
                            return (
                                <Link key={article.id} href={`/articles/${article.slug}`} className="block h-full">
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
                                                        {t(`articles.types.${article.type}`)}
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
                                                        {t('articles.author')}: <span
                                                        className="font-medium">{article.author}</span>
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
                                                    {t('articles.readMore')} →
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

            {activeTab === 'symposia' && (
                <div className="space-y-6 w-full md:w-[85%] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {symposia.map(symposium => {
                            const attachmentUrl = getAttachmentUrl(symposium.attachments);
                            const previewText = getArticlePreviewText(symposium, isRTL);
                            return (
                                <Link key={symposium.id} href={`/symposia/${symposium.slug}`} className="block h-full">
                                    <Card className="transition-all hover:shadow-2xl h-full">
                                        <div className="flex flex-col md:flex-row gap-4 h-full">
                                            {attachmentUrl && (
                                                <div
                                                    className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={attachmentUrl}
                                                        alt={isRTL ? symposium.titleAr : symposium.titleEn}
                                                        className="w-full h-48 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge variant="gold">
                                                        {t(`symposia.types.${symposium.type}`)}
                                                    </Badge>
                                                    <Badge variant="default">
                                                        {symposium.editionYear}
                                                    </Badge>
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                                                    {isRTL ? symposium.titleAr : symposium.titleEn}
                                                </h2>

                                                <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                                                    <span>
                                                        {t('symposia.author')}: <span
                                                        className="font-medium">{symposium.author}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(symposium.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
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
                                                    {t('symposia.readMore')} →
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {symposia.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-primary-600 dark:text-primary-400">{t('common.noResults')}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'creativity' && (
                <div className="space-y-6 w-full md:w-[85%] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {creativity.map(item => {
                            const localizedTitle = isRTL ? item.titleAr ?? item.title : item.titleEn ?? item.title;
                            const preview = isRTL ? item.contentAr ?? item.content : item.contentEn ?? item.content;
                            const attachmentUrl = item.attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';

                            return (
                                <Link key={item.id} href={`/creativity/${item.slug}`} className="block h-full">
                                    <Card className="transition-all hover:shadow-2xl h-full">
                                        <div className="flex flex-col md:flex-row gap-4 h-full">
                                            {attachmentUrl && (
                                                <div
                                                    className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={attachmentUrl}
                                                        alt={localizedTitle}
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
                                                    {localizedTitle}
                                                </h2>

                                                <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                                                    <span>
                                                        {t('creativity.by')} <span
                                                        className="font-medium">{item.author}</span>
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

                    {creativity.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-primary-600 dark:text-primary-400">{t('common.noResults')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
