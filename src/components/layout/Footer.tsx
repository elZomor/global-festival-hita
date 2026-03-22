'use client';
import { useTranslation } from 'react-i18next';
import { festivalConfig } from '../../config/festival';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 border-t-2 border-secondary-500 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-secondary-500 font-bold text-lg mb-3">
              {isRTL ? festivalConfig.titleAr : festivalConfig.titleEn}
            </h3>
            <p className="text-primary-400 text-sm">
              {isRTL ? festivalConfig.taglineAr : festivalConfig.taglineEn}
            </p>
          </div>

          <div>
            <h4 className="text-secondary-500 font-semibold mb-3">
              {t('nav.home')}
            </h4>
            <ul className="space-y-2 text-sm text-primary-400">
              <li>
                <a href="/festival" className="hover:text-secondary-500 transition-colors duration-300">
                  {t('nav.editions')}
                </a>
              </li>
              <li>
                <a href="/articles" className="hover:text-secondary-500 transition-colors duration-300">
                  {t('nav.articles')}
                </a>
              </li>
              <li>
                <a href="/creativity" className="hover:text-secondary-500 transition-colors duration-300">
                  {t('nav.creativity')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-secondary-500 font-semibold mb-3">
              {t('about.contactTitle')}
            </h4>
            <p className="text-primary-400 text-sm">
              {festivalConfig.contactEmail}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-primary-500 text-sm">
          <p>
            © {currentYear} {isRTL ? festivalConfig.titleAr : festivalConfig.titleEn} - {isRTL ? festivalConfig.subtitleAr : festivalConfig.subtitleEn}
          </p>
        </div>
      </div>
    </footer>
  );
};
