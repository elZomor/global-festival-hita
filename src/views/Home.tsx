'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button, LoadingState } from '../components/common';
import { festivalConfig } from '../config/festival';
import { useFestivalEditions, useLatestArticles } from '../api/hooks';

export const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const {
    data: editions = [],
    isLoading: isLoadingEditions,
    isError: hasEditionError,
  } = useFestivalEditions();
  const {
    // data: latestArticles = [],
    isLoading: isLoadingArticles,
    isError: hasArticleError,
  } = useLatestArticles();

  const sortedEditions = [...editions].sort((a, b) => b.year - a.year);
  const currentEdition = sortedEditions[0];

  if (isLoadingEditions || isLoadingArticles) {
    return <LoadingState />;
  }

  if (hasEditionError || hasArticleError) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.error')}</p>
      </div>
    );
  }

  if (!currentEdition) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-accent-600 to-primary-900 dark:from-primary-950 dark:via-accent-700 dark:to-primary-950 rounded-2xl shadow-2xl text-primary-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative px-8 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-block mb-4">
              <div className="text-7xl animate-pulse">🎭</div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-primary-50 mb-4">
              {isRTL ? festivalConfig.titleAr : festivalConfig.titleEn}
            </h1>

            <p className="text-xl md:text-2xl text-secondary-300 font-medium">
              {t('home.subtitle')}
            </p>

            <p className="text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
              {isRTL ? festivalConfig.taglineAr : festivalConfig.taglineEn}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href={`/festival`}>
                <Button variant="primary" className="group">
                  {t('home.editionsTitle')}
                  <ArrowRight className={`inline ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} size={20} />
                </Button>
              </Link>
              {/*<Link href="/articles">*/}
              {/*  <Button variant="secondary">*/}
              {/*    {t('home.browseArticles')}*/}
              {/*  </Button>*/}
              {/*</Link>*/}
            </div>
          </div>
        </div>
      </section>

      {/*<section>*/}
      {/*  <div className="flex items-center justify-between mb-8">*/}
      {/*    <SectionHeader>*/}
      {/*      <Calendar className={`inline ${isRTL ? 'ml-3' : 'mr-3'}`} size={32} />*/}
      {/*      {t('home.editionsTitle')}*/}
      {/*    </SectionHeader>*/}
      {/*  </div>*/}

      {/*  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">*/}
      {/*    {sortedEditions.map((edition) => (*/}
      {/*      <Link key={edition.slug} href={`/festival/${edition.slug}`}>*/}
      {/*        <Card className="h-full">*/}
      {/*          <div className="space-y-4">*/}
      {/*            <div className="flex items-start justify-between">*/}
      {/*              <h3 className="text-2xl font-bold text-accent-600 dark:text-secondary-500">*/}
      {/*                {isRTL ? edition.titleAr : edition.titleEn}*/}
      {/*              </h3>*/}
      {/*            </div>*/}

      {/*            <p className="text-primary-700 dark:text-primary-300 leading-relaxed">*/}
      {/*              {isRTL ? edition.descriptionAr : edition.descriptionEn}*/}
      {/*            </p>*/}

      {/*            <div className="flex gap-4 text-sm text-primary-600 dark:text-primary-400">*/}
      {/*              <span className="flex items-center gap-1">*/}
      {/*                <Calendar size={16} />*/}
      {/*                {new Date(edition.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {*/}
      {/*                  month: 'short',*/}
      {/*                  day: 'numeric'*/}
      {/*                })}*/}
      {/*              </span>*/}
      {/*              <span>•</span>*/}
      {/*              <span>{formatLocalizedNumber(edition.totalShows, i18n.language)} {t('festival.numberOfShows')}</span>*/}
      {/*              <span>•</span>*/}
      {/*              <span>{formatLocalizedNumber(edition.totalArticles, i18n.language)} {t('festival.numberOfArticles')}</span>*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*        </Card>*/}
      {/*      </Link>*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/*<section>*/}
      {/*  <div className="flex items-center justify-between mb-8">*/}
      {/*    <SectionHeader>*/}
      {/*      <FileText className={`inline ${isRTL ? 'ml-3' : 'mr-3'}`} size={32} />*/}
      {/*      {t('home.latestArticles')}*/}
      {/*    </SectionHeader>*/}
      {/*    <Link href="/articles">*/}
      {/*      <Button variant="ghost" className="hidden sm:block">*/}
      {/*        {t('common.viewDetails')}*/}
      {/*      </Button>*/}
      {/*    </Link>*/}
      {/*  </div>*/}

      {/*  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">*/}
      {/*    {latestArticles.map((article) => (*/}
      {/*      <Link key={article.id} href={`/articles/${article.slug}`}>*/}
      {/*        <Card className="h-full">*/}
      {/*          <div className="space-y-3">*/}
      {/*            <div className="flex items-start justify-between gap-2">*/}
      {/*              <Badge variant="gold">*/}
      {/*                {t(`articles.types.${article.type}`)}*/}
      {/*              </Badge>*/}
      {/*              <span className="text-xs text-primary-500 dark:text-primary-400">*/}
      {/*                {article.editionYear}*/}
      {/*              </span>*/}
      {/*            </div>*/}

      {/*            <h3 className="text-xl font-bold text-primary-900 dark:text-white line-clamp-2">*/}
      {/*              {isRTL ? article.titleAr : article.titleEn}*/}
      {/*            </h3>*/}

      {/*            <p className="text-sm text-primary-600 dark:text-primary-400">*/}
      {/*              {t('articles.author')}: {article.author}*/}
      {/*            </p>*/}

      {/*            <p className="text-primary-700 dark:text-primary-300 line-clamp-3 leading-relaxed">*/}
      {/*              {isRTL ? article.contentAr.substring(0, 150) : article.contentEn?.substring(0, 150)}...*/}
      {/*            </p>*/}
      {/*          </div>*/}
      {/*        </Card>*/}
      {/*      </Link>*/}
      {/*    ))}*/}
      {/*  </div>*/}

      {/*  <div className="text-center mt-8 sm:hidden">*/}
      {/*    <Link href="/articles">*/}
      {/*      <Button variant="ghost">*/}
      {/*        {t('common.viewDetails')}*/}
      {/*      </Button>*/}
      {/*    </Link>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/*<section className="bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-2xl p-8 md:p-12 text-center shadow-2xl">*/}
      {/*  <Sparkles className="inline-block mb-4 text-primary-950" size={48} />*/}
      {/*  <h2 className="text-3xl md:text-4xl font-bold text-primary-950 mb-4">*/}
      {/*    {t('home.creativityTitle')}*/}
      {/*  </h2>*/}
      {/*  <p className="text-lg text-primary-950/80 max-w-2xl mx-auto mb-8">*/}
      {/*    {t('home.creativityText')}*/}
      {/*  </p>*/}
      {/*  <Link href="/creativity">*/}
      {/*    <Button variant="primary">*/}
      {/*      {t('home.exploreCreativity')}*/}
      {/*    </Button>*/}
      {/*  </Link>*/}
      {/*</section>*/}
    </div>
  );
};
