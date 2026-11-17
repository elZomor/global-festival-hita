'use client';
import Link from 'next/link';
import { useT } from '../i18n/useT';

// The kiln is still heating.
export const ComingSoon = () => {
  const t = useT();

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="max-w-3xl space-y-6">
        <h1 dir="auto" className="brush fired-text text-[clamp(3rem,9vw,6rem)]">
          {t('common.comingSoon')}
        </h1>
        <span className="ember-swipe swipe-cool w-56" aria-hidden="true" />
        <p className="text-lg max-w-2xl leading-relaxed text-primary-700 dark:text-primary-300">
          {t('common.comingSoonMessage')}
        </p>
        <div className="h-0.5 w-64 bg-primary-200 dark:bg-primary-800 overflow-hidden" aria-hidden="true">
          <div className="h-full w-1/3 bg-ember-500 animate-pulse" />
        </div>
        <Link
          href="/"
          className="inline-flex items-center min-h-12 px-7 rounded-[3px] border border-primary-400 dark:border-primary-600 text-primary-900 dark:text-primary-100 font-medium hover:border-ember-500 transition-colors"
        >
          {t('common.backHome')}
        </Link>
      </div>
    </div>
  );
};
