import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { SectionHeader } from '../components/common';
import { getT } from '../i18n/getT';
import { serverApiFetch, apiPrefix } from '../api/server';
import { mapFestivalApiResultToEdition, type FestivalApiResponse } from '../api/hooks';
import { formatLocalizedNumber, localizeDigitsInString } from '../utils/numberUtils';

// The archive as a kiln shelf: newest edition first, each year carved large.
export const FestivalList = async () => {
  const [t, locale, response] = await Promise.all([
    getT(),
    getLocale(),
    serverApiFetch<FestivalApiResponse>(`${apiPrefix}/festivals`, 3600),
  ]);
  const isRTL = locale === 'ar';
  const editions = (response?.results ?? [])
    .map(mapFestivalApiResultToEdition)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!editions.length) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.noResults')}</p>
      </div>
    );
  }

  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <SectionHeader>{t('home.editionsTitle')}</SectionHeader>

      <ol className="border-t border-primary-300 dark:border-primary-800">
        {editions.map((edition, index) => {
          const title = localizeDigitsInString(isRTL ? edition.titleAr : edition.titleEn, locale);
          const description = localizeDigitsInString(isRTL ? edition.descriptionAr : edition.descriptionEn, locale);
          const newest = index === 0;

          return (
            <li key={edition.slug} className="border-b border-primary-300 dark:border-primary-800">
              <Link
                href={`/festival/${edition.slug}`}
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 md:items-center hover:bg-primary-100/70 dark:hover:bg-primary-900/70 transition-colors px-2"
              >
                <span
                  className={`md:col-span-3 font-display text-6xl md:text-7xl tabular leading-none transition-colors ${
                    newest
                      ? 'text-ember-600 dark:text-ember-400'
                      : 'text-primary-400 group-hover:text-primary-600 dark:text-primary-500 dark:group-hover:text-primary-300'
                  }`}
                >
                  {formatLocalizedNumber(edition.year, locale).replace(/[٬,]/g, '')}
                </span>
                <span className="md:col-span-6 space-y-2">
                  <span dir="auto" className="block text-2xl font-semibold text-primary-950 dark:text-primary-50">{title}</span>
                  {description && (
                    <span className="block text-primary-600 dark:text-primary-400 leading-relaxed">{description}</span>
                  )}
                </span>
                <span className="md:col-span-3 text-sm text-primary-600 dark:text-primary-400 space-y-1 md:text-end">
                  <span className="block">{dateFmt(edition.startDate)}</span>
                  <span className="block tabular">
                    {formatLocalizedNumber(edition.totalShows, locale)} {t('festival.numberOfShows')} · {formatLocalizedNumber(edition.totalArticles, locale)} {t('festival.numberOfArticles')}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
