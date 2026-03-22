import type {DetailListItemProps} from './types';
import {renderValue, renderLinkedText, getRoleValue} from './utils';
import {DetailList} from './DetailList';

/**
 * DetailListItem - Renders a single list item with variant-specific formatting
 *
 * Rendering behavior by variant:
 * - 'role' (depth 0): Gold bold text with optional role value, displays children with default styling
 * - 'default': Standard list item with label and inline value
 * - 'text': Plain text with minimal styling
 *
 * Features:
 * - Supports nested children (recursive DetailList)
 * - Handles optional links (clickable text)
 * - Inline or block value rendering
 * - Dark mode support
 *
 * @param props - Component props
 * @param props.item - Detail entry data (text, value, children, link)
 * @param props.variant - Display variant ('text' | 'default' | 'role')
 * @param props.depth - Current nesting depth (affects role styling)
 *
 * @example
 * ```tsx
 * <DetailListItem
 *   item={{
 *     text: "Director",
 *     value: "John Doe",
 *     link: "https://example.com"
 *   }}
 *   variant="role"
 *   depth={0}
 * />
 * ```
 */
export const DetailListItem = ({item, variant, depth}: DetailListItemProps) => {
    // Role variant: Special styling for cast/crew/organizing team
    if (variant === 'role' && depth === 0) {
        const roleValue = getRoleValue(item);
        return (
            <li>
                <div className="flex gap-2 text-sm md:text-base">
                    {renderLinkedText(item, 'text-theatre-gold-500 font-semibold')}
                    {roleValue && <span className="text-primary-700 dark:text-primary-200">{roleValue}</span>}
                </div>
                {item.children && item.children.length > 0 && (
                    <div className="mt-2 ms-4">
                        <DetailList items={item.children} variant="default" depth={depth + 1}/>
                    </div>
                )}
            </li>
        );
    }

    // Default and text variants
    const isTextVariant = variant === 'text';
    const hasValue = item.value && (
        (typeof item.value === 'string' && item.value.trim()) ||
        (Array.isArray(item.value) && item.value.length > 0)
    );

    return (
        <li>
            <div className="flex flex-wrap items-baseline gap-2">
                {renderLinkedText(
                    item,
                    isTextVariant ? 'text-primary-800 dark:text-primary-100' : 'text-primary-500 dark:text-primary-200'
                )}
                {hasValue && renderValue(item.value, {inline: true})}
            </div>

            {item.children && item.children.length > 0 && (
                <div className="mt-2">
                    <DetailList items={item.children} variant="default" depth={depth + 1}/>
                </div>
            )}
        </li>
    );
};
