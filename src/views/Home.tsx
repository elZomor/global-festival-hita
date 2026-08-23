import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/common';
import { getT } from '../i18n/getT';
import { festivalConfig } from '../config/festival';
import { serverApiFetch, apiPrefix } from '../api/server';
import { mapFestivalApiResultToEdition, type FestivalApiResponse } from '../api/hooks';

export const Home = async () => {
  const [t, locale, response] = await Promise.all([
    getT(),
    getLocale(),
    serverApiFetch<FestivalApiResponse>(`${apiPrefix}/festivals`, 300),
  ]);
  const isRTL = locale === 'ar';
  const editions = (response?.results ?? []).map(mapFestivalApiResultToEdition);
  const sortedEditions = [...editions].sort((a, b) => b.year - a.year);
  const currentEdition = sortedEditions[0];

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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
