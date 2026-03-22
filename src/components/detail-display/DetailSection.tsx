import {Card} from '../common';
import type {DetailSectionProps} from './types';
import {DetailList} from './DetailList';

/**
 * DetailSection - Renders a titled card containing a list of detail entries
 *
 * Used to display structured information sections such as cast, crew,
 * organizing team, awards, and additional details in a consistent format.
 *
 * @param props - Component props
 * @param props.section - Section data containing title and items array
 * @param props.variant - Display variant determining item styling ('text' | 'default' | 'role')
 *
 * @example
 * ```tsx
 * <DetailSection
 *   section={{
 *     title: "Cast",
 *     items: [{text: "Actor Name", value: "Role"}]
 *   }}
 *   variant="role"
 * />
 * ```
 */
export const DetailSection = ({section, variant}: DetailSectionProps) => {
    return (
        <Card hover={false} className="h-full">
            <h3 className="text-xl font-semibold text-accent-600 dark:text-secondary-500 mb-4">
                {section.title}
            </h3>
            <DetailList items={section.items} variant={variant}/>
        </Card>
    );
};
