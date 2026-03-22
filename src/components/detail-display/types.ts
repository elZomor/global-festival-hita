import type {DetailEntry} from '../../types';

/**
 * Variant types for detail display components
 * - text: Plain text display with no special styling
 * - default: Standard list item display
 * - role: Special styling for roles (cast, crew, organizing team)
 */
export type DetailVariant = 'text' | 'default' | 'role';

/**
 * Props for DetailSection component
 */
export type DetailSectionProps = {
    section: {
        title: string;
        items: DetailEntry[];
    };
    variant: DetailVariant;
};

/**
 * Props for DetailList component
 */
export type DetailListProps = {
    items: DetailEntry[];
    variant: DetailVariant;
    depth?: number;
};

/**
 * Props for DetailListItem component
 */
export type DetailListItemProps = {
    item: DetailEntry;
    variant: DetailVariant;
    depth: number;
};

/**
 * Options for renderValue utility function
 */
export type RenderValueOptions = {
    inline?: boolean;
};
