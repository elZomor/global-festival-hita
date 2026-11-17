'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useT } from '../../i18n/useT';
import { festivalConfig } from '../../config/festival';
import { KilnMark } from './Wordmark';

// Cooled ground: the footer is the kiln after firing — carbon, hairlines,
// the festival record.
export const Footer = () => {
  const t = useT();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const currentYear = new Date().getFullYear();
  const title = isRTL ? festivalConfig.titleAr : festivalConfig.titleEn;

  const links = [
    { href: '/festival', label: t('nav.editions') },
    { href: '/articles', label: t('nav.articles') },
    { href: '/symposia', label: t('symposia.title') },
    { href: '/creativity', label: t('nav.creativity') },
    { href: '/about', label: t('nav.about') },
    ...(festivalConfig.applicationsEnabled ? [{ href: '/apply', label: t('nav.apply') }] : []),
  ];

  return (
    <footer className="relative z-10 mt-24 bg-primary-950 text-primary-300 border-t border-primary-800">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 text-primary-50">
              <KilnMark className="w-12 h-12" />
              <p className="font-display text-2xl">{title}</p>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-400">
              {isRTL ? festivalConfig.taglineAr : festivalConfig.taglineEn}
            </p>
          </div>

          <nav className="md:col-span-4" aria-label={t('nav.home')}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {links.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-primary-300 hover:text-ember-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3 text-sm">
            <p className="text-primary-50 font-medium">{t('about.contactTitle')}</p>
            <a href={`mailto:${festivalConfig.contactEmail}`} className="mt-3 inline-block text-primary-300 hover:text-ember-400 transition-colors" dir="ltr">
              {festivalConfig.contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-800 flex flex-col sm:flex-row gap-2 justify-between text-xs text-primary-500">
          <p>© <span className="tabular">{currentYear}</span> {title}</p>
          <p>{isRTL ? festivalConfig.subtitleAr : festivalConfig.subtitleEn}</p>
        </div>
      </div>
    </footer>
  );
};
