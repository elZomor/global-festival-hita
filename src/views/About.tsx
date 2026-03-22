'use client';
import {useTranslation} from 'react-i18next';
import {Mail, MapPin} from 'lucide-react';
import {Card, SectionHeader} from '../components/common';
import {festivalConfig} from '../config/festival';

export const About = () => {
    const {t, i18n} = useTranslation();
    const isAr = i18n.language === 'ar';
    const whatIsTitle = isAr ? festivalConfig.aboutWhatIsTitleAr : festivalConfig.aboutWhatIsTitleEn;
    const whatIsText = isAr ? festivalConfig.aboutWhatIsTextAr : festivalConfig.aboutWhatIsTextEn;
    const whyArchiveTitle = isAr ? festivalConfig.aboutWhyArchiveTitleAr : festivalConfig.aboutWhyArchiveTitleEn;
    const whyArchiveText = isAr ? festivalConfig.aboutWhyArchiveTextAr : festivalConfig.aboutWhyArchiveTextEn;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <div className="text-7xl mb-4">{festivalConfig.logo}</div>
                <SectionHeader>{t('about.title')}</SectionHeader>
            </div>

            <Card className="bg-gradient-to-br from-accent-600/10 to-secondary-500/10" hover={false}>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500 mb-4">
                            {whatIsTitle}
                        </h2>
                        <p className="text-primary-800 dark:text-primary-200 leading-relaxed text-lg">
                            {whatIsText}
                        </p>
                    </div>

                    <div className="border-t border-primary-300 dark:border-primary-700 pt-6">
                        <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500 mb-4">
                            {whyArchiveTitle}
                        </h2>
                        <p className="text-primary-800 dark:text-primary-200 leading-relaxed text-lg">
                            {whyArchiveText}
                        </p>
                    </div>
                </div>
            </Card>

            <Card hover={false}>
                <h2 className="text-2xl font-bold text-accent-600 dark:text-secondary-500 mb-6">
                    {t('about.contactTitle')}
                </h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Mail size={24} className="text-secondary-500 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                                البريد الإلكتروني / Email
                            </p>
                            <a
                                href={`mailto:${festivalConfig.contactEmail}`}
                                className="text-secondary-500 hover:text-secondary-400 font-medium"
                            >
                                {festivalConfig.contactEmail}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <MapPin size={24} className="text-secondary-500 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                                العنوان / Address
                            </p>
                            <p className="text-primary-800 dark:text-primary-200 font-medium leading-relaxed" style={{whiteSpace: 'pre-line'}}>
                                {festivalConfig.addressAr}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-gradient-to-r from-primary-950 to-accent-700 rounded-2xl p-8 text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-secondary-500 mb-4">
                    {festivalConfig.celebrationAr}
                </h3>
                <p className="text-primary-300 text-lg">
                    {festivalConfig.celebrationEn}
                </p>
            </div>
        </div>
    );
};
