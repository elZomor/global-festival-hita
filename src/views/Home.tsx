import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { getT } from '../i18n/getT';
import { festivalConfig } from '../config/festival';
import { serverApiFetch, apiPrefix, withQueryParams } from '../api/server';
import {
  mapFestivalApiResultToEdition,
  mapShowApiResultToShow,
  type ApplicationStatusData,
  type FestivalApiResponse,
  type PaginatedResponse,
  type ShowApiResult,
} from '../api/hooks';
import { formatLocalizedNumber, localizeDigitsInString } from '../utils/numberUtils';
import type { FestivalEdition } from '../types';

type EditionState = 'soon' | 'running' | 'finished';

const editionState = (edition: FestivalEdition): EditionState => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(edition.startDate);
  const end = new Date(edition.endDate);
  if (today < start) return 'soon';
  if (today <= end) return 'running';
  return 'finished';
};

const formatDay = (date: string, locale: string, withYear = false) =>
  new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  });

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
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const editions = (response?.results ?? [])
    .map(mapFestivalApiResultToEdition)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const current = editions[0];
  const archive = editions.slice(1);
  const openApplication = applicationStatus?.data?.open ? applicationStatus.data : null;
  const festivalTitle = isRTL ? festivalConfig.titleAr : festivalConfig.titleEn;

  const showsResponse = current
    ? await serverApiFetch<PaginatedResponse<ShowApiResult>>(
        withQueryParams(`${apiPrefix}/shows`, { festival: current.id, page_size: 12 }),
        300,
      )
    : null;
  const posters = (showsResponse?.results ?? [])
    .map(mapShowApiResultToShow)
    .filter(show => Boolean(show.poster))
    .slice(0, 3);

  const state = current ? editionState(current) : null;
  const currentTitle = current
    ? localizeDigitsInString(isRTL ? current.titleAr : current.titleEn, locale)
    : festivalTitle;

  // Ember marks the one thing that is live now.
  const liveStage: 'apply' | 'shows' | 'archive' = openApplication
    ? 'apply'
    : state && state !== 'finished'
      ? 'shows'
      : 'archive';

  const stages = [
    ...(festivalConfig.applicationsEnabled
      ? [{ key: 'apply' as const, href: '/apply', title: t('home.stages.apply.title'), text: t('home.stages.apply.text') }]
      : []),
    {
      key: 'shows' as const,
      href: current ? `/festival/${current.slug}?tab=shows` : '/festival',
      title: t('home.stages.shows.title'),
      text: t('home.stages.shows.text'),
    },
    { key: 'writing' as const, href: '/articles', title: t('home.stages.writing.title'), text: t('home.stages.writing.text') },
    { key: 'symposia' as const, href: '/symposia', title: t('home.stages.symposia.title'), text: t('home.stages.symposia.text') },
    { key: 'archive' as const, href: '/festival', title: t('home.stages.archive.title'), text: t('home.stages.archive.text') },
  ];

  return (
    <div className="space-y-24">
      {/* First viewport: the edition, still hot. */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pt-2 lg:pt-8">
        <div className="lg:col-span-7 space-y-8">
          <h1 className="brush fired-text fired-live animate-fire text-[clamp(3rem,9vw,6rem)]">
            {openApplication?.festivalName
              ? localizeDigitsInString(openApplication.festivalName, locale)
              : currentTitle}
          </h1>
          <span className="ember-swipe w-48 md:w-72 -mt-4" aria-hidden="true" />
          <p className="max-w-xl text-lg leading-relaxed text-primary-700 dark:text-primary-300">
            {openApplication
              ? t('home.applyHero.subtitle')
              : isRTL ? festivalConfig.taglineAr : festivalConfig.taglineEn}
          </p>

          <div className="flex flex-wrap gap-3">
            {openApplication ? (
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-[3px] bg-ember-500 text-primary-950 font-semibold hover:bg-ember-400 hover:shadow-[0_12px_32px_-10px] hover:shadow-ember-500/70 transition-[background-color,box-shadow]"
              >
                {t('home.applyHero.cta')}
                <Arrow size={18} strokeWidth={1.75} />
              </Link>
            ) : current && state !== 'finished' ? (
              <Link
                href={`/festival/${current.slug}?tab=shows`}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-[3px] bg-ember-500 text-primary-950 font-semibold hover:bg-ember-400 hover:shadow-[0_12px_32px_-10px] hover:shadow-ember-500/70 transition-[background-color,box-shadow]"
              >
                {t('home.viewShows')}
                <Arrow size={18} strokeWidth={1.75} />
              </Link>
            ) : null}
            {current && (
              <Link
                href={`/festival/${current.slug}`}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-[3px] border border-primary-400 dark:border-primary-600 text-primary-900 dark:text-primary-100 font-medium hover:border-ember-500 transition-colors"
              >
                {t('home.currentEdition')}
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {posters.length > 0 && (
            <div className="relative h-[22rem] sm:h-[26rem]" aria-hidden="true">
              {posters.map((show, index) => (
                <div
                  key={show.id}
                  className={`absolute top-0 w-[58%] aspect-[3/4] overflow-hidden rounded-[3px] border border-primary-300 dark:border-primary-700 shadow-kiln ${
                    index === 0
                      ? 'start-[21%] z-30'
                      : index === 1
                        ? 'start-0 top-8 z-20 -rotate-3'
                        : 'end-0 top-12 z-10 rotate-3'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={show.poster}
                    alt=""
                    className={`h-full w-full object-cover ${index === 0 ? '' : 'grayscale contrast-125 brightness-75'}`}
                  />
                  {index !== 0 && <div className="absolute inset-0 bg-primary-950/30" />}
                </div>
              ))}
              <div className="absolute inset-x-6 -bottom-2 h-16 bg-ember-500/40 blur-3xl rounded-full" />
            </div>
          )}

          {current && state && (
            <dl className="kiln-frame relative z-40 bg-primary-50/90 dark:bg-primary-950/90 backdrop-blur p-5 grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2 flex items-center justify-between gap-3">
                <dt className="sr-only">{t('home.status.label')}</dt>
                <dd className="flex items-center gap-2 font-semibold text-primary-950 dark:text-primary-50">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      openApplication || state === 'running'
                        ? 'bg-ember-500 shadow-[0_0_12px] shadow-ember-500'
                        : state === 'soon'
                          ? 'bg-ember-700'
                          : 'bg-primary-500'
                    }`}
                    aria-hidden="true"
                  />
                  {openApplication ? t('home.applyHero.badge') : t(`home.status.${state}`)}
                </dd>
              </div>
              <div>
                <dt className="label">{t('home.dates')}</dt>
                <dd className="mt-1 text-sm text-primary-900 dark:text-primary-100">
                  {formatDay(current.startDate, locale)} – {formatDay(current.endDate, locale, true)}
                </dd>
              </div>
              <div className="flex gap-6">
                <div>
                  <dt className="label">{t('festival.shows')}</dt>
                  <dd className="mt-1 font-display text-3xl tabular text-primary-950 dark:text-primary-50">
                    {formatLocalizedNumber(current.totalShows, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="label">{t('festival.articles')}</dt>
                  <dd className="mt-1 font-display text-3xl tabular text-primary-950 dark:text-primary-50">
                    {formatLocalizedNumber(current.totalArticles, locale)}
                  </dd>
                </div>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* The festival's stages: whatever is live glows ember. */}
      <section aria-labelledby="stages-title">
        <h2 id="stages-title" className="sr-only">{t('home.stages.title')}</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-primary-300 dark:border-primary-800">
          {stages.map((stage, index) => {
            const live = stage.key === liveStage;
            return (
              <li
                key={stage.key}
                className={`border-b lg:border-b-0 border-primary-300 dark:border-primary-800 ${
                  index > 0 ? 'lg:border-s' : ''
                } ${live ? 'bg-ember-500/[0.07] shadow-[inset_0_2px_0] shadow-ember-500' : ''}`}
              >
                <Link
                  href={stage.href}
                  aria-current={live ? 'step' : undefined}
                  className="group block h-full p-6 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                >
                  {live && (
                    <span className="flex items-center gap-2 text-sm font-medium text-ember-600 dark:text-ember-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-ember-500 shadow-[0_0_10px] shadow-ember-500" aria-hidden="true" />
                      {t('home.stages.live')}
                    </span>
                  )}
                  <span
                    className={`mt-3 block text-2xl font-display ${
                      live ? 'text-ember-600 dark:text-ember-400' : 'text-primary-950 dark:text-primary-50'
                    }`}
                  >
                    {stage.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-primary-600 dark:text-primary-400">
                    {stage.text}
                  </span>
                  <Arrow
                    size={18}
                    strokeWidth={1.5}
                    className="mt-5 text-primary-400 group-hover:text-ember-500 transition-colors"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Cooled editions: the archive, soot and glaze. */}
      {archive.length > 0 && (
        <section className="space-y-8" aria-labelledby="archive-title">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 id="archive-title" className="brush text-4xl md:text-5xl text-primary-950 dark:text-primary-50">
                {t('home.editionsTitle')}
              </h2>
              <span className="ember-swipe swipe-cool mt-3 w-28" aria-hidden="true" />
            </div>
            <Link href="/festival" className="shrink-0 text-sm font-medium text-primary-700 dark:text-primary-300 underline decoration-ember-500/60 hover:decoration-ember-500">
              {t('home.allEditions')}
            </Link>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archive.slice(0, 6).map(edition => (
              <li key={edition.slug} className={archive.length === 1 ? 'md:col-span-2 lg:col-span-3' : ''}>
                <Link
                  href={`/festival/${edition.slug}`}
                  className={`${archive.length === 1 ? 'bg-primary-100/60 dark:bg-primary-900/60 flex-col md:flex-row-reverse md:items-end' : 'glaze flex-col'} group flex h-full justify-between gap-8 rounded-[3px] border border-primary-200 dark:border-primary-800 p-6 hover:border-ember-500/70 transition-colors`}
                >
                  <span className="font-display text-5xl md:text-6xl tabular text-primary-500 group-hover:text-primary-700 dark:text-primary-500 dark:group-hover:text-primary-300 transition-colors">
                    {formatLocalizedNumber(edition.year, locale).replace(/[٬,]/g, '')}
                  </span>
                  <span>
                    <span className="block text-xl font-semibold text-primary-950 dark:text-primary-50">
                      {localizeDigitsInString(isRTL ? edition.titleAr : edition.titleEn, locale)}
                    </span>
                    <span className="mt-2 block text-sm text-primary-600 dark:text-primary-400 tabular">
                      {formatLocalizedNumber(edition.totalShows, locale)} {t('festival.numberOfShows')} · {formatLocalizedNumber(edition.totalArticles, locale)} {t('festival.numberOfArticles')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!current && (
        <p className="text-center py-16 text-lg text-primary-600 dark:text-primary-300">{t('common.noResults')}</p>
      )}
    </div>
  );
};
