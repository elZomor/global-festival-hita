'use client';
import {useLocale} from 'next-intl';
import {useT} from '../i18n/useT';
import {Mail, MapPin} from 'lucide-react';
import {SectionHeader} from '../components/common';
import {festivalConfig} from '../config/festival';
import {KilnMark} from '../components/layout/Wordmark';

export const About = () => {
    const t = useT();
    const isAr = useLocale() === 'ar';
    const whatIsTitle = isAr ? festivalConfig.aboutWhatIsTitleAr : festivalConfig.aboutWhatIsTitleEn;
    const whatIsText = isAr ? festivalConfig.aboutWhatIsTextAr : festivalConfig.aboutWhatIsTextEn;
    const whyArchiveTitle = isAr ? festivalConfig.aboutWhyArchiveTitleAr : festivalConfig.aboutWhyArchiveTitleEn;
    const whyArchiveText = isAr ? festivalConfig.aboutWhyArchiveTextAr : festivalConfig.aboutWhyArchiveTextEn;

    return (
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="flex items-center gap-5">
                <KilnMark className="w-16 h-16 shrink-0 text-primary-950 dark:text-primary-50"/>
                <SectionHeader className="mb-0">{t('about.title')}</SectionHeader>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-primary-300 dark:border-primary-800 pt-10">
                <section>
                    <h2 className="font-display text-3xl text-primary-950 dark:text-primary-50 mb-4">{whatIsTitle}</h2>
                    <p className="text-lg leading-relaxed text-primary-700 dark:text-primary-300 max-w-[65ch]">{whatIsText}</p>
                </section>
                <section>
                    <h2 className="font-display text-3xl text-primary-950 dark:text-primary-50 mb-4">{whyArchiveTitle}</h2>
                    <p className="text-lg leading-relaxed text-primary-700 dark:text-primary-300 max-w-[65ch]">{whyArchiveText}</p>
                </section>
            </div>

            <section className="glaze rounded-[3px] border border-primary-200 dark:border-primary-800 p-8">
                <h2 className="font-display text-3xl text-primary-950 dark:text-primary-50 mb-8">{t('about.contactTitle')}</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <Mail size={22} strokeWidth={1.5} className="text-ember-600 dark:text-ember-400 mt-1 shrink-0"/>
                        <div>
                            <dt className="text-sm text-primary-600 dark:text-primary-400 mb-1">البريد الإلكتروني / Email</dt>
                            <dd>
                                <a
                                    href={`mailto:${festivalConfig.contactEmail}`}
                                    dir="ltr"
                                    className="text-primary-950 dark:text-primary-50 underline decoration-ember-500/60 hover:decoration-ember-500 font-medium"
                                >
                                    {festivalConfig.contactEmail}
                                </a>
                            </dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin size={22} strokeWidth={1.5} className="text-ember-600 dark:text-ember-400 mt-1 shrink-0"/>
                        <div>
                            <dt className="text-sm text-primary-600 dark:text-primary-400 mb-1">العنوان / Address</dt>
                            <dd className="text-primary-900 dark:text-primary-100 font-medium leading-relaxed" style={{whiteSpace: 'pre-line'}}>
                                {festivalConfig.addressAr}
                            </dd>
                        </div>
                    </div>
                </dl>
            </section>

            <section className="text-center py-6">
                <p className="brush text-[clamp(2rem,5vw,3.5rem)] text-primary-950 dark:text-primary-50">{festivalConfig.celebrationAr}</p>
                <span className="ember-swipe swipe-cool w-40 mx-auto my-5" aria-hidden="true"/>
                <p className="text-lg text-primary-600 dark:text-primary-400" dir="ltr">{festivalConfig.celebrationEn}</p>
            </section>
        </div>
    );
};
