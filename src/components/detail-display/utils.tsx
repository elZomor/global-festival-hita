import type {DetailEntry} from '../../types';
import type {RenderValueOptions} from './types';

/**
 * Renders a value with optional formatting for inline or block display
 * @param value - The value to render (string or array of strings)
 * @param options - Rendering options
 * @returns JSX element or null
 */
export const renderValue = (value?: string | string[], options: RenderValueOptions = {}) => {
    if (!value) {
        return null;
    }

    if (Array.isArray(value)) {
        const filtered = value.filter(Boolean);
        if (filtered.length === 0) {
            return null;
        }

        if (!options.inline) {
            return (
                <ul className="list-disc ms-5 space-y-1 mt-2">
                    {filtered.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                    ))}
                </ul>
            );
        }

        // Award value rendering: rank in gold, show in italics
        // Formats: [rank, (show)], [rank], ['', (show)]
        if (filtered.length === 2) {
            const [rank, show] = filtered;
            return (
                <span className="text-primary-800 dark:text-primary-100">
                    {rank && <span className="text-secondary-500 dark:text-secondary-400">{rank}</span>}
                    {rank && show && ' '}
                    {show && <em>{show}</em>}
                </span>
            );
        }

        // Single element array: rank in gold, or show in italics
        if (filtered.length === 1) {
            const [value] = filtered;
            if (value.startsWith('(')) {
                return (
                    <span className="text-primary-800 dark:text-primary-100">
                        <em>{value}</em>
                    </span>
                );
            }
            return (
                <span className="text-secondary-500 dark:text-secondary-400">
                    {value}
                </span>
            );
        }

        return <span className="text-primary-800 dark:text-primary-100">{filtered.join(', ')}</span>;
    }

    if (options.inline) {
        return <span className="text-primary-800 dark:text-primary-100">{value}</span>;
    }

    return <p className="mt-1 text-primary-800 dark:text-primary-100">{value}</p>;
};

/**
 * Renders text with optional link support
 * @param item - The detail entry item
 * @param className - Optional CSS classes to apply
 * @returns JSX element (anchor or span)
 */
export const renderLinkedText = (item: DetailEntry, className?: string) => {
    const link = item.link?.trim();
    const linkClasses =
        'text-secondary-600 dark:text-secondary-400 underline hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors';

    if (link) {
        const combinedClasses = `${className ? `${className} ` : ''}${linkClasses}`;
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={combinedClasses}
            >
                {item.text}
            </a>
        );
    }

    return <span className={className}>{item.text}</span>;
};

/**
 * Extracts and formats role value from a detail entry
 * @param item - The detail entry item
 * @returns Formatted role value or undefined
 */
export const getRoleValue = (item: DetailEntry): string | undefined => {
    if (Array.isArray(item.value)) {
        const values = item.value.filter(Boolean);
        if (values.length > 0) {
            return values.join(', ');
        }
    }

    if (typeof item.value === 'string' && item.value.trim()) {
        return item.value;
    }

    return undefined;
};

/**
 * Builds a unique key for a detail entry item
 * @param item - The detail entry item
 * @param index - The index of the item in the list
 * @returns Unique string key
 */
export const buildItemKey = (item: DetailEntry, index: number) =>
    `${item.text}-${Array.isArray(item.value) ? item.value.join('-') : item.value ?? 'value'}-${item.link ?? 'nolink'}-${index}`;

/**
 * Type guard to check if an item is a DetailEntry
 * @param item - The item to check
 * @returns True if the item is a DetailEntry
 */
export const isDetailEntry = (item: unknown): item is DetailEntry => {
    return (
        typeof item === 'object' &&
        item !== null &&
        'text' in item &&
        typeof (item as DetailEntry).text === 'string'
    );
};
