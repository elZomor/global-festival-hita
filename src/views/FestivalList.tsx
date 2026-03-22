'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Card, SectionHeader, LoadingState } from '../components/common';
import { useFestivalEditions } from '../api/hooks';
import { formatLocalizedNumber, localizeDigitsInString } from '../utils/numberUtils';

export const FestivalList = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const {
    data: editions = [],
    isLoading,
    isError,
  } = useFestivalEditions();
  const sortedEditions = [...editions].sort((a, b) => b.year - a.year);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.error')}</p>
      </div>
    );
  }

  if (!editions.length) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Calendar size={40} className="text-accent-600 dark:text-secondary-500" />
        <SectionHeader className="mb-0">{t('home.editionsTitle')}</SectionHeader>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEditions.map((edition) => {
          const localizedTitle = localizeDigitsInString(
            isRTL ? edition.titleAr : edition.titleEn,
            i18n.language
          );
          const localizedDescription = localizeDigitsInString(
            isRTL ? edition.descriptionAr : edition.descriptionEn,
            i18n.language
          );

          return (
            <Link key={edition.slug} href={`/festival/${edition.slug}`}>
              <Card className="h-full">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-bold text-accent-600 dark:text-secondary-500">
                      {localizedTitle}
                    </h3>
                  </div>

                  <p className="text-primary-700 dark:text-primary-300 leading-relaxed">
                    {localizedDescription}
                  </p>

                <div className="flex gap-4 text-sm text-primary-600 dark:text-primary-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(edition.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span>{formatLocalizedNumber(edition.totalShows, i18n.language)} {t('festival.numberOfShows')}</span>
                  <span>•</span>
                  <span>{formatLocalizedNumber(edition.totalArticles, i18n.language)} {t('festival.numberOfArticles')}</span>
                </div>
              </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
