'use client';
import type {DetailEntry} from '../../types';
import {DetailSection, type DetailVariant} from '../../components/detail-display';

export type ShowDetailSection = {
    title: string;
    items: DetailEntry[];
};

type ShowInfoTabProps = {
    descriptionSection?: ShowDetailSection;
    actorsSection?: ShowDetailSection;
    crewSection?: ShowDetailSection;
    additionalSection?: ShowDetailSection;
};

/**
 * ShowInfoTab - Displays show information in organized sections
 *
 * Presents show details in a responsive 2-column grid layout with
 * sections for cast, crew, synopsis, and additional information.
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 2 columns desktop)
 * - Conditional rendering (only shows sections with data)
 * - Variant-based styling for different section types
 * - Dark mode support
 * - Null-safe (returns null if no sections have data)
 *
 * Section variants:
 * - actors/crew: 'role' variant (gold highlighting)
 * - description/additional: 'text' variant (plain text)
 *
 * @param props - Component props
 * @param props.descriptionSection - Show synopsis/description
 * @param props.actorsSection - Cast members and roles
 * @param props.crewSection - Production crew and roles
 * @param props.additionalSection - Additional notes and information
 *
 * @example
 * ```tsx
 * <ShowInfoTab
 *   descriptionSection={{title: "Synopsis", items: [...]}}
 *   actorsSection={{title: "Cast", items: [...]}}
 *   crewSection={{title: "Crew", items: [...]}}
 * />
 * ```
 */
export const ShowInfoTab = ({descriptionSection, actorsSection, crewSection, additionalSection}: ShowInfoTabProps) => {
    const sections = [
        {key: 'actors', section: actorsSection, variant: 'role' as DetailVariant},
        {key: 'crew', section: crewSection, variant: 'role' as DetailVariant},
        {key: 'description', section: descriptionSection, variant: 'text' as DetailVariant},
        {key: 'additional', section: additionalSection, variant: 'text' as DetailVariant},
    ].filter(({section}) => section && section.items.length > 0) as {
        key: string;
        section: ShowDetailSection;
        variant: DetailVariant;
    }[];

    if (sections.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(({key, section, variant}) => (
                <div key={key} className="h-full">
                    <DetailSection section={section} variant={variant}/>
                </div>
            ))}
        </div>
    );
};
