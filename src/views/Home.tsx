import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowRight, PenLine } from 'lucide-react';
import { Button } from '../components/common';
import { getT } from '../i18n/getT';
import { festivalConfig } from '../config/festival';
import { serverApiFetch, apiPrefix } from '../api/server';
import { mapFestivalApiResultToEdition, type ApplicationStatusData, type FestivalApiResponse } from '../api/hooks';

export const Home = async () => {
  const [t, locale, response, applicationStatus] = await Promise.all([
    getT(),
    getLocale(),
    serverApiFetch<FestivalApiResponse>(`${apiPrefix}/festivals`, 300),
    festivalConfig.applicationsEnabled
      ? serverApiFetch<{ data: ApplicationStatusData }>(`${apiPrefix}/applications/status`, 60)
      : Promise.resolve(null),
  ]);
  const isRTL = locale === 'ar';
  const editions = (response?.results ?? []).map(mapFestivalApiResultToEdition);
  const sortedEditions = [...editions].sort((a, b) => b.year - a.year);
  const currentEdition = sortedEditions[0];
  const openApplication = applicationStatus?.data?.open ? applicationStatus.data : null;
  const arrowClass = `inline ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`;

  const applyHero = openApplication && (
    <section className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-secondary-600 via-accent-600 to-primary-900 dark:from-secondary-800 dark:via-accent-700 dark:to-primary-950 text-primary-50">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      <div className="relative px-8 py-14 md:py-20 text-center max-w-3xl mx-auto space-y-5">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50/15 text-sm font-medium">
          <PenLine size={16} />
          {t('home.applyHero.badge')}
        </span>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          {t('home.applyHero.title', {
            festival: openApplication.festivalName || (isRTL ? festivalConfig.titleAr : festivalConfig.titleEn),
          })}
        </h2>
        <p className="text-lg text-primary-100">{t('home.applyHero.subtitle')}</p>
        <div className="pt-4">
          <Link href="/apply">
            <Button variant="secondary" className="group">
              {t('home.applyHero.cta')}
              <ArrowRight className={arrowClass} size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );

  if (!currentEdition) {
    return applyHero ? (
      <div className="space-y-16">{applyHero}</div>
    ) : (
      <div className="text-center py-16">
        <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {applyHero}
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
                  <ArrowRight className={arrowClass} size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
