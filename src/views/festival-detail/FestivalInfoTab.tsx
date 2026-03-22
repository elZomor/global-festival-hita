'use client';
import {useTranslation} from 'react-i18next';
import {Card, PosterImage} from '../../components/common';
import type {DetailEntry, FestivalEdition} from '../../types';
import {buildMediaUrl} from '../../utils/mediaUtils';
import {DetailSection, type DetailVariant} from '../../components/detail-display';

type FestivalInfoTabProps = {
    edition: FestivalEdition;
};

/**
 * FestivalInfoTab - Displays comprehensive festival edition information
 *
 * Presents festival details in two main sections:
 * 1. Basic Information Card: Organizer, dates, and festival poster
 * 2. Additional Sections Grid: Organizing team, jury, awards, and extra details
 *
 * Features:
 * - Bilingual date formatting (Arabic/English)
 * - Responsive layout (mobile-first)
 * - Error-resilient image loading
 * - ARIA-compliant for screen readers
 * - Empty state handling when no additional info exists
 * - Dark mode support
 *
 * @param props - Component props
 * @param props.edition - Festival edition data to display
 *
 * @example
 * ```tsx
 * <FestivalInfoTab edition={festivalEdition} />
 * ```
 */
export const FestivalInfoTab = ({edition}: FestivalInfoTabProps) => {
    const {t, i18n} = useTranslation();
    const isRTL = i18n.language === 'ar';

    const formattedStartDate = new Date(edition.startDate).toLocaleDateString(
        isRTL ? 'ar-EG' : 'en-US',
        {year: 'numeric', month: 'long', day: 'numeric'}
    );

    const formattedEndDate = new Date(edition.endDate).toLocaleDateString(
        isRTL ? 'ar-EG' : 'en-US',
        {year: 'numeric', month: 'long', day: 'numeric'}
    );

    const posterUrl = edition.logo ? buildMediaUrl(edition.logo) : null;

    const organizingTeamSection = edition.organizingTeam && edition.organizingTeam.length > 0
        ? {title: t('festival.organizingTeam'), items: edition.organizingTeam}
        : undefined;

    const jurySection = edition.juryList && edition.juryList.length > 0
        ? {
            title: t('festival.juryList'),
            items: edition.juryList.map(name => ({text: name}))
        }
        : undefined;

    const awardsSection = edition.awards && edition.awards.length > 0
        ? {title: t('festival.awards'), items: edition.awards}
        : undefined;

    const extraDetailsSection = edition.extraDetails && edition.extraDetails.length > 0
        ? {
            title: t('festival.additionalInfo'),
            items: edition.extraDetails.map(item =>
                typeof item === 'string' ? {text: item} : item
            )
        }
        : undefined;

    const sections = [
        {key: 'organizingTeam', section: organizingTeamSection, variant: 'role' as DetailVariant},
        {key: 'jury', section: jurySection, variant: 'default' as DetailVariant},
        {key: 'awards', section: awardsSection, variant: 'role' as DetailVariant},
        {key: 'extraDetails', section: extraDetailsSection, variant: 'text' as DetailVariant},
    ].filter(({section}) => section && section.items.length > 0) as {
        key: string;
        section: {title: string; items: DetailEntry[]};
        variant: DetailVariant;
    }[];

    return (
        <div className="space-y-6">
            <Card hover={false}>
                <h3
                    className="text-2xl font-semibold text-accent-600 dark:text-secondary-500 mb-6"
                    id="festival-basic-info"
                >
                    {t('festival.basicInfo')}
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4" role="list" aria-labelledby="festival-basic-info">
                        {edition.organizer && (
                            <div className="flex flex-col gap-1" role="listitem">
                                <span
                                    className="text-sm font-medium text-primary-600 dark:text-primary-400"
                                    id="festival-organizer-label"
                                >
                                    {t('festival.organizer')}
                                </span>
                                <span
                                    className="text-lg text-primary-900 dark:text-primary-50"
                                    aria-labelledby="festival-organizer-label"
                                >
                                    {edition.organizer}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col gap-1" role="listitem">
                            <span
                                className="text-sm font-medium text-primary-600 dark:text-primary-400"
                                id="festival-start-date-label"
                            >
                                {t('festival.startDate')}
                            </span>
                            <span
                                className="text-lg text-primary-900 dark:text-primary-50"
                                aria-labelledby="festival-start-date-label"
                            >
                                {formattedStartDate}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1" role="listitem">
                            <span
                                className="text-sm font-medium text-primary-600 dark:text-primary-400"
                                id="festival-end-date-label"
                            >
                                {t('festival.endDate')}
                            </span>
                            <span
                                className="text-lg text-primary-900 dark:text-primary-50"
                                aria-labelledby="festival-end-date-label"
                            >
                                {formattedEndDate}
                            </span>
                        </div>
                    </div>
                    {posterUrl && (
                        <div className="w-full md:w-64 lg:w-80">
                            <PosterImage
                                src={posterUrl}
                                alt={`${t('festival.poster')}: ${isRTL ? edition.titleAr : edition.titleEn}`}
                                className="w-full h-auto rounded-lg object-contain"
                            />
                        </div>
                    )}
                </div>
            </Card>

            {sections.length > 0 ? (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    role="region"
                    aria-label={t('festival.additionalSections')}
                >
                    {sections.map(({key, section, variant}) => (
                        <div key={key} className="h-full">
                            <DetailSection section={section} variant={variant}/>
                        </div>
                    ))}
                </div>
            ) : (
                <Card hover={false}>
                    <p className="text-center text-primary-600 dark:text-primary-400 py-8">
                        {t('festival.noAdditionalInfo')}
                    </p>
                </Card>
            )}
        </div>
    );
};
