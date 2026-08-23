import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Calendar } from 'lucide-react';
import { Card, SectionHeader } from '../components/common';
import { getT } from '../i18n/getT';
import { serverApiFetch, apiPrefix } from '../api/server';
import { mapFestivalApiResultToEdition, type FestivalApiResponse } from '../api/hooks';
import { formatLocalizedNumber, localizeDigitsInString } from '../utils/numberUtils';

export const FestivalList = async () => {
  const [t, locale, response] = await Promise.all([
    getT(),
    getLocale(),
    serverApiFetch<FestivalApiResponse>(`${apiPrefix}/festivals`, 3600),
  ]);
  const isRTL = locale === 'ar';
  const editions = (response?.results ?? []).map(mapFestivalApiResultToEdition);
  const sortedEditions = [...editions].sort((a, b) => b.year - a.year);

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
            locale
          );
          const localizedDescription = localizeDigitsInString(
            isRTL ? edition.descriptionAr : edition.descriptionEn,
            locale
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
                  <span>{formatLocalizedNumber(edition.totalShows, locale)} {t('festival.numberOfShows')}</span>
                  <span>•</span>
                  <span>{formatLocalizedNumber(edition.totalArticles, locale)} {t('festival.numberOfArticles')}</span>
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
