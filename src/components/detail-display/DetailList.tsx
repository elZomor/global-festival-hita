import type {DetailListProps} from './types';
import {DetailListItem} from './DetailListItem';
import {renderLinkedText, buildItemKey} from './utils';

/**
 * DetailList - Renders a list of detail entries with variant-based styling
 *
 * Supports three display variants:
 * - 'role': Gold text for highlighting roles (cast, crew, organizing team)
 * - 'default': Standard list display with bullets
 * - 'text': Plain text display without bullets
 *
 * Features:
 * - Nested list support with depth tracking
 * - Single item optimization (removes bullets for single unlabeled items)
 * - Responsive spacing and indentation
 * - Dark mode support
 *
 * @param props - Component props
 * @param props.items - Array of detail entries to display
 * @param props.variant - Display variant ('text' | 'default' | 'role')
 * @param props.depth - Nesting depth for recursive lists (default: 0)
 *
 * @example
 * ```tsx
 * <DetailList
 *   items={[
 *     {text: "Director", value: "John Doe"},
 *     {text: "Producer", value: "Jane Smith"}
 *   ]}
 *   variant="role"
 * />
 * ```
 */
export const DetailList = ({items, variant, depth = 0}: DetailListProps) => {
    const hasSingleUnlabeledItem = items.length === 1 && !items[0].value && !items[0].children;
    const listStyle = depth === 0 ? 'list-disc' : 'list-[circle]';
    const margin = depth === 0 ? 'ms-5' : 'ms-6';
    const isRoleRoot = variant === 'role' && depth === 0;

    // Single unlabeled item (except for role variant)
    if (hasSingleUnlabeledItem && variant !== 'role') {
        return (
            <div>
                {renderLinkedText(items[0], 'text-primary-800 dark:text-primary-100')}
            </div>
        );
    }

    return (
        <ul
            className={`${listStyle} ${margin} space-y-3 ${
                isRoleRoot ? 'text-theatre-gold-500' : 'text-primary-800 dark:text-primary-100'
            }`}
        >
            {items.map((item, index) => (
                <DetailListItem
                    key={buildItemKey(item, index)}
                    item={item}
                    variant={variant}
                    depth={depth}
                />
            ))}
        </ul>
    );
};
