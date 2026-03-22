import {useMemo} from 'react';
import {buildQueryKey, useApiMutation, useApiQuery, withQueryParams} from './reactQueryClient';
import type {Article, Comment, CreativitySubmission, DetailEntry, FestivalEdition, MyReservation, Show} from '../types';
import {festivalConfig} from '../config/festival';

const api = festivalConfig.apiPrefix;

const emptyArray: never[] = [];

/**
 * API response type for Festival data from backend
 *
 * API Field Mappings (snake_case → camelCase):
 * - start_date → startDate
 * - end_date → endDate
 * - extra_details → extraDetails
 * - total_shows → totalShows
 * - organizing_team → organizingTeam
 * - jury_list → juryList
 */
type FestivalApiResult = {
    id: number;
    name: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    extraDetails?: (string | ShowDetailFieldApi)[] | string | null;
    logo?: string | null;
    totalShows: number;
    totalArticles: number;
    organizer?: string | null;
    organizingTeam?: ShowDetailFieldApi[] | null;
    juryList?: string[] | null;
    awards?: ShowDetailFieldApi[] | null;
};

type FestivalApiResponse = {
    count: number;
    totalPages: number;
    currentPage: number;
    next: string | null;
    previous: string | null;
    results: FestivalApiResult[];
};

/**
 * Structured field from API representing a detail entry
 *
 * Used for complex fields like cast, crew, organizing team, awards, etc.
 * Can contain nested structures through the children property.
 *
 * @example
 * {
 *   text: "المخرج",
 *   value: "أحمد السيد",
 *   link: "https://example.com"
 * }
 */
type ShowDetailFieldApi = {
    text: string;
    value?: string | null;
    children?: Array<ShowDetailFieldApi | string> | null;
    link?: string | null;
};

/**
 * API response type for Show data from backend
 *
 * API Field Mappings (snake_case → camelCase):
 * - created_at → createdAt
 * - updated_at → updatedAt
 * - cast_word → castWord
 * - show_description → showDescription
 * - festival_slug → festivalSlug
 * - festival_name → festivalName
 * - venue_name → venueName
 * - venue_location → venueLocation
 * - is_open_for_reservation → isOpenForReservation
 * - reserved_seats → reservedSeats
 * - allowed_seats → allowedSeats
 * - allowed_waiting → allowedWaiting
 */
type ShowApiResult = {
    id: number;
    name?: string | null;
    slug?: string | null;
    link?: string | null;
    poster?: string | null;
    author?: string | null;
    director?: string | null;
    reservedSeats?: number | null;
    status?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    notes?: ShowDetailFieldApi[] | string | string[] | Record<string, string> | null;
    cast?: ShowDetailFieldApi[] | string | string[] | Record<string, string> | null;
    crew?: ShowDetailFieldApi[] | string | Record<string, string> | null;
    castWord?: string | null;
    showDescription?: string | string[] | null;
    date?: string | null;
    time?: string | null;
    festivalSlug?: number | string | null;
    festivalName?: string | null;
    festival?: number | null;
    venueName?: string | null;
    venueLocation?: string | null;
    isOpenForReservation: string;
    allowedSeats?: number | null;
    allowedWaiting?: number | null;
    openForComments?: boolean | null;
};

type PaginatedResponse<T> = {
    count: number;
    totalPages: number;
    currentPage: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

/**
 * API response type for Article/Symposium/Creativity data from backend
 *
 * API Field Mappings (snake_case → camelCase):
 * - title_ar → titleAr
 * - title_en → titleEn
 * - content_ar → contentAr
 * - content_en → contentEn
 * - created_at → createdAt
 * - updated_at → updatedAt
 * - festival_year → festivalYear
 * - article_attachments_list → articleAttachmentsList
 */
type ArticleApiResult = {
    id: number;
    slug?: string | null;
    title?: string | null;
    titleAr?: string | null;
    titleEn?: string | null;
    content?: string | null;
    contentAr?: string | null;
    contentEn?: string | null;
    sectionOne?: string | null;
    sectionTwo?: string | null;
    sectionThree?: string | null;
    author?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    tag?: string | null | string[];
    show?: number | null;
    festival?: number | null;
    festivalYear?: number | null;
    articleAttachmentsList?: string[] | null;
};

/**
 * Maps extra details from API format to frontend format
 *
 * Handles three possible input formats from the API:
 * 1. JSON string containing an array: "[...]" → parsed array
 * 2. Array of mixed strings and objects → mapped array
 * 3. Plain string → single-item array
 *
 * @param extraDetails - Extra details from API (string, array, or null)
 * @returns Array of strings or DetailEntry objects, or undefined if no data
 *
 * @example
 * // JSON string input
 * mapExtraDetails('[{"text": "Note 1"}, "Note 2"]')
 * // Returns: [{text: "Note 1"}, "Note 2"]
 *
 * @example
 * // Array input
 * mapExtraDetails([{text: "Award", value: "Best Director"}, "Special mention"])
 * // Returns: [{text: "Award", value: "Best Director"}, "Special mention"]
 */
const mapExtraDetails = (
    extraDetails?: (string | ShowDetailFieldApi)[] | string | null
): (string | DetailEntry)[] | undefined => {
    if (!extraDetails) {
        return undefined;
    }

    // Handle JSON string input
    if (typeof extraDetails === 'string') {
        try {
            const parsed = JSON.parse(extraDetails);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(item => {
                        if (typeof item === 'string') {
                            return item;
                        }
                        return mapStructuredItem(item);
                    })
                    .filter((item): item is string | DetailEntry => Boolean(item));
            }
        } catch {
            // If parsing fails, treat as plain string
            return [extraDetails];
        }
        return [extraDetails];
    }

    // Handle array input
    if (Array.isArray(extraDetails)) {
        return extraDetails
            .map(item => {
                if (typeof item === 'string') {
                    return item;
                }
                return mapStructuredItem(item);
            })
            .filter((item): item is string | DetailEntry => Boolean(item));
    }

    return undefined;
};

/**
 * Maps Festival API result to FestivalEdition frontend type
 *
 * Transforms the API response format to the frontend FestivalEdition type,
 * handling field name conversions, nested structures, and data normalization.
 *
 * Key transformations:
 * - Uses festival ID as slug (converted to string)
 * - Falls back to alternative date if one is missing
 * - Extracts year from startDate or current date
 * - Maps complex fields (organizingTeam, awards, extraDetails) using helper functions
 *
 * @param festival - Festival data from API
 * @returns Formatted FestivalEdition object
 */
const mapFestivalApiResultToEdition = (festival: FestivalApiResult): FestivalEdition => {
    const startDate = festival.startDate ?? festival.endDate ?? '';
    const endDate = festival.endDate ?? festival.startDate ?? '';
    const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();

    return {
        id: String(festival.id),
        year,
        slug: String(festival.id),
        titleAr: festival.name,
        titleEn: festival.name,
        descriptionAr: festival.description ?? '',
        descriptionEn: festival.description ?? '',
        startDate,
        endDate,
        totalShows: festival.totalShows,
        totalArticles: festival.totalArticles,
        numberOfArticles: 0,
        organizer: festival.organizer ?? undefined,
        logo: festival.logo ?? undefined,
        organizingTeam: mapStructuredField(festival.organizingTeam, undefined),
        juryList: festival.juryList ?? undefined,
        awards: mapStructuredField(festival.awards, undefined),
        extraDetails: mapExtraDetails(festival.extraDetails),
    };
};

/**
 * Parses a structured field from API, handling multiple formats
 *
 * @param field - Structured field data (array, object, JSON string, or null)
 * @returns Parsed array of ShowDetailFieldApi objects, or undefined
 *
 * @example
 * parseStructuredField('[{"text": "Director", "value": "John"}]')
 * // Returns: [{text: "Director", value: "John"}]
 *
 * parseStructuredField({"Director": "John Doe", "Producer": "Jane Smith"})
 * // Returns: [{text: "Director", value: "John Doe"}, {text: "Producer", value: "Jane Smith"}]
 *
 * parseStructuredField(["Note 1", "Note 2"])
 * // Returns: [{text: "Note 1"}, {text: "Note 2"}]
 */
const parseStructuredField = (field?: ShowDetailFieldApi[] | string | string[] | Record<string, string> | null): ShowDetailFieldApi[] | undefined => {
    if (!field) {
        return undefined;
    }

    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : undefined;
        } catch {
            return undefined;
        }
    }

    if (Array.isArray(field)) {
        // Check if it's already in the correct format (array of ShowDetailFieldApi)
        if (field.length > 0 && typeof field[0] === 'object' && field[0] !== null && 'text' in field[0]) {
            return field as ShowDetailFieldApi[];
        }
        // Convert simple string array to ShowDetailFieldApi format
        if (field.length > 0 && typeof field[0] === 'string') {
            return (field as string[]).map(text => ({text}));
        }
        return undefined;
    }

    // Handle object/record format (e.g., {"Director": "John", "Producer": "Jane"})
    if (typeof field === 'object' && field !== null) {
        return Object.entries(field).map(([text, value]) => ({
            text,
            value: value || undefined,
        }));
    }

    return undefined;
};

/**
 * Maps a single structured item from API format to DetailEntry
 *
 * Validates and transforms a ShowDetailFieldApi object into a DetailEntry,
 * including all nested children and optional fields.
 *
 * @param item - Structured item from API
 * @returns DetailEntry object or null if invalid
 *
 * @example
 * mapStructuredItem({text: "Director", value: "John Doe", link: "https://..."})
 * // Returns: {text: "Director", value: "John Doe", link: "https://..."}
 */
const mapStructuredItem = (item?: ShowDetailFieldApi | null): DetailEntry | null => {
    if (!item || typeof item.text !== 'string' || item.text.trim() === '') {
        return null;
    }

    const children = mapChildren(item.children);

    const baseEntry: DetailEntry = {
        text: item.text,
        ...(item.value ? {value: mapItemValue(item.value)} : {}),
        ...(children && children.length > 0 ? {children} : {}),
        ...(item.link ? {link: item.link} : {}),
    };

    return baseEntry;
};

/**
 * Maps an item value from API format, handling JSON strings and arrays
 *
 * Attempts to parse JSON strings. If successful, returns the parsed value.
 * If parsing fails, returns the raw string.
 *
 * @param value - Value from API (string or null)
 * @returns Parsed value (string or string array) or undefined
 *
 * @example
 * mapItemValue('["Role 1", "Role 2"]')
 * // Returns: ["Role 1", "Role 2"]
 *
 * @example
 * mapItemValue('"Simple string"')
 * // Returns: "Simple string"
 */
const mapItemValue = (value?: string | null): string | string[] | undefined => {
    if (!value) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'string') {
            return parsed;
        }
        if (Array.isArray(parsed)) {
            const strings = parsed.filter(item => typeof item === 'string');
            return strings.length > 0 ? strings : undefined;
        }
    } catch {
        // If parsing fails, fallback to raw string
    }

    return value;
};

/**
 * Award child format from API (used in awards section)
 */
type AwardChildApi = {
    name: string;
    rank?: string;
    show?: string;
};

/**
 * Maps children array from API format to DetailEntry array
 *
 * Handles multiple child formats:
 * - String children
 * - Structured object children with {text, value, ...}
 * - Award children with {name, rank, show}
 *
 * @param children - Array of children (strings or objects)
 * @returns Array of DetailEntry objects, or undefined if no valid children
 *
 * @example
 * mapChildren(["Child 1", {text: "Child 2", value: "Value"}])
 * // Returns: [{text: "Child 1"}, {text: "Child 2", value: "Value"}]
 *
 * @example
 * mapChildren([{name: "Winner", rank: "1st", show: "Show Name"}])
 * // Returns: [{text: "Winner", value: "1st - Show Name"}]
 */
const mapChildren = (children?: Array<ShowDetailFieldApi | AwardChildApi | string> | null): DetailEntry[] | undefined => {
    if (!children) {
        return undefined;
    }

    const mapped = children
        .map(child => {
            if (typeof child === 'string') {
                return {text: child};
            }
            // Handle award child format: {name, rank, show}
            // Output format: name - rank (show) where rank is gold, (show) is italic
            // Uses array value for special rendering
            if ('name' in child && typeof child.name === 'string') {
                const awardChild = child as AwardChildApi;
                let value: string | string[] | undefined;
                if (awardChild.rank && awardChild.show) {
                    value = [awardChild.rank, `(${awardChild.show})`];
                } else if (awardChild.rank) {
                    value = [awardChild.rank];
                } else if (awardChild.show) {
                    value = ['', `(${awardChild.show})`];
                }
                return {
                    text: awardChild.name,
                    value,
                };
            }
            return mapStructuredItem(child as ShowDetailFieldApi);
        })
        .filter((child): child is DetailEntry => Boolean(child));

    return mapped.length > 0 ? mapped : undefined;
};

/**
 * Maps a structured field from API to DetailEntry array
 *
 * Handles multiple input formats:
 * - JSON string → parses and maps to DetailEntry array
 * - Array of objects → maps each to DetailEntry
 * - Plain string with fallbackLabel → creates single-item array
 *
 * @param field - Structured field data (array, string, or null)
 * @param fallbackLabel - Optional label to use when field is a plain string
 * @returns Array of DetailEntry objects, or undefined
 *
 * @example
 * // With structured objects
 * mapStructuredField([{text: "Actor", value: "John Doe"}])
 * // Returns: [{text: "Actor", value: "John Doe"}]
 *
 * @example
 * // With plain string and fallbackLabel
 * mapStructuredField("John Doe, Jane Smith", "Cast")
 * // Returns: [{text: "Cast", value: "John Doe, Jane Smith"}]
 */
const mapStructuredField = (
    field?: ShowDetailFieldApi[] | string | null | string[] | Record<string, string>,
    fallbackLabel?: string,
): DetailEntry[] | undefined => {
    if (typeof field === 'string') {
        const mappedValue = mapItemValue(field);
        if (mappedValue) {
            return [
                {
                    text: fallbackLabel ?? '',
                    value: mappedValue,
                },
            ];
        }
    }

    const rawItems = parseStructuredField(field);
    if (!rawItems) {
        return undefined;
    }

    const mapped = rawItems
        .map(mapStructuredItem)
        .filter((item): item is DetailEntry => Boolean(item));

    return mapped.length > 0 ? mapped : undefined;
};

/**
 * Parses description field from API, handling JSON strings and arrays
 *
 * @param description - Description from API (string, array, or null)
 * @returns Parsed description as string or string array, empty string if null
 *
 * @example
 * parseDescriptionField('["Paragraph 1", "Paragraph 2"]')
 * // Returns: ["Paragraph 1", "Paragraph 2"]
 *
 * @example
 * parseDescriptionField("Simple description")
 * // Returns: "Simple description"
 */
const parseDescriptionField = (description?: string | string[] | null): string | string[] => {
    if (!description) {
        return '';
    }

    if (Array.isArray(description)) {
        return description;
    }

    try {
        const parsed = JSON.parse(description);
        if (typeof parsed === 'string' || Array.isArray(parsed)) {
            return parsed;
        }
    } catch {
        // If parsing fails, fallback to raw string
    }

    return description;
};

/**
 * Maps Show API result to Show frontend type
 *
 * Transforms the API response format to the frontend Show type,
 * handling field conversions, fallbacks, and data normalization.
 *
 * Key transformations:
 * - Generates slug from ID if missing
 * - Extracts edition year from createdAt or date field
 * - Provides default values for required fields (name, director, venueName)
 * - Maps complex fields (cast, crew, notes) with optional castWord label
 * - Parses showDescription which can be string or array
 *
 * @param show - Show data from API
 * @returns Formatted Show object
 */
const mapShowApiResultToShow = (show: ShowApiResult): Show => {
    const datePart = show.date ?? '';
    const timePart = show.time ?? '';
    const fallbackYearSource = datePart || show.createdAt;
    const editionYear = fallbackYearSource
        ? new Date(fallbackYearSource).getFullYear()
        : new Date().getFullYear();
    const title = show.name ?? 'عرض مسرحي';

    return {
        id: String(show.id),
        slug: show.slug ?? `show-${show.id}`,
        name: title,
        editionYear,
        festivalId: show.festival ? String(show.festival) : undefined,
        festivalSlug: show.festivalSlug ? String(show.festivalSlug) : undefined,
        festivalName: show.festivalName ?? undefined,
        director: show.director ?? 'غير معروف',
        author: show.author ?? undefined,
        status: show.status ?? undefined,
        createdAt: show.createdAt ?? undefined,
        updatedAt: show.updatedAt ?? undefined,
        cast: mapStructuredField(show.cast, show.castWord ?? undefined),
        crew: mapStructuredField(show.crew, undefined),
        notes: mapStructuredField(show.notes, undefined),
        date: datePart,
        time: timePart,
        venueName: show.venueName ?? '',
        showDescription: parseDescriptionField(show.showDescription),
        poster: show.poster ?? undefined,
        bookingUrl: show.link ?? undefined,
        venueLocation: show.venueLocation,
        reservedSeats: show.reservedSeats ?? undefined,
        allowedSeats: show.allowedSeats ?? undefined,
        allowedWaiting: show.allowedWaiting ?? undefined,
        isOpenForReservation: show.isOpenForReservation ?? 'CLOSED',
        castWord: show.castWord && show.castWord.trim() !== '' ? show.castWord : undefined,
        openForComments: show.openForComments ?? undefined,
    };
};

/**
 * Maps article tag from API to ArticleType
 *
 * Converts string tags to typed article categories.
 *
 * @param tag - Tag string from API
 * @returns ArticleType enum value
 */
// const mapArticleTagToType = (tag?: string | null): ArticleType => {
//     if (!tag) {
//         return 'general';
//     }
//
//     switch (tag.toUpperCase()) {
//         case 'SHOW':
//             return 'review';
//         case 'SYMPOSIUM':
//             return 'symposium_coverage';
//         case 'ANALYSIS':
//             return 'analysis';
//         default:
//             return 'general';
//     }
// };

/**
 * Maps Article API result to Article frontend type
 *
 * Transforms the API response to frontend Article format,
 * handling bilingual content and metadata.
 *
 * Key transformations:
 * - Generates slug from ID if missing
 * - Extracts edition year from festivalYear or createdAt
 * - Maps tag to ArticleType using mapArticleTagToType
 * - Handles bilingual titles and content with fallbacks
 * - Filters and validates attachments list
 *
 * @param article - Article data from API
 * @returns Formatted Article object
 */
const mapArticleApiResultToArticle = (article: ArticleApiResult): Article => {
    const createdAt = article.createdAt ?? new Date().toISOString();
    const editionYear =
        article.festivalYear ??
        (article.createdAt ? new Date(article.createdAt).getFullYear() : new Date().getFullYear());

    const baseTitle = article.title ?? 'مقال نقدي';

    const sections = [article.sectionOne, article.sectionTwo, article.sectionThree]
        .map(section => (typeof section === 'string' ? section.trim() : ''))
        .filter((section): section is string => section.length > 0);

    return {
        id: String(article.id),
        slug: article.slug ?? `article-${article.id}`,
        titleAr: article.titleAr ?? baseTitle,
        titleEn: article.titleEn ?? baseTitle,
        author: article.author ?? 'غير معروف',
        editionYear,
        // type: mapArticleTagToType(article.tag),
        type: 'general',
        ...(article.show ? {showId: String(article.show)} : {}),
        ...(article.festival ? {festivalId: String(article.festival)} : {}),
        createdAt,
        contentAr: article.contentAr ?? article.content ?? '',
        contentEn: article.contentEn ?? article.content ?? article.contentAr ?? undefined,
        ...(sections.length > 0 ? {sections} : {}),
        attachments: Array.isArray(article.articleAttachmentsList)
            ? article.articleAttachmentsList.filter((path): path is string => typeof path === 'string' && path.trim() !== '')
            : undefined,
    };
};

/**
 * Maps creativity tag from API to CreativitySubmission type
 *
 * Converts string tags to typed creativity categories.
 *
 * @param tag - Tag string from API
 * @returns CreativitySubmission type value
 */
// const mapCreativityTagToType = (tag?: string | null): CreativitySubmission['type'] => {
//     if (!tag) {
//         return 'other';
//     }
//
//     switch (tag.toUpperCase()) {
//         case 'STORY':
//             return 'story';
//         case 'ESSAY':
//             return 'essay';
//         case 'POEM':
//             return 'poem';
//         default:
//             return 'other';
//     }
// };

/**
 * Maps Article API result to CreativitySubmission frontend type
 *
 * Reuses ArticleApiResult to create CreativitySubmission objects,
 * as they share the same API structure but different semantic meaning.
 *
 * Key transformations:
 * - Generates slug with 'creativity-' prefix
 * - Maps tag to creativity type using mapCreativityTagToType
 * - Handles bilingual titles and content
 * - Filters and validates attachments
 *
 * @param article - Article data from API (used for creativity submissions)
 * @returns Formatted CreativitySubmission object
 */
const mapArticleApiResultToCreativity = (article: ArticleApiResult): CreativitySubmission => {
    const baseTitleAr = article.titleAr ?? article.title ?? 'عمل إبداعي';
    const baseTitleEn = article.titleEn ?? article.title ?? 'Creative Work';
    const attachments = Array.isArray(article.articleAttachmentsList)
        ? article.articleAttachmentsList.filter((path): path is string => typeof path === 'string' && path.trim() !== '')
        : undefined;

    return {
        id: String(article.id),
        slug: article.slug ?? `creativity-${article.id}`,
        title: baseTitleAr,
        titleAr: baseTitleAr,
        titleEn: baseTitleEn,
        author: article.author ?? 'غير معروف',
        // type: mapCreativityTagToType(article.tag),
        type: 'other',
        editionYear:
            article.festivalYear ??
            (article.createdAt ? new Date(article.createdAt).getFullYear() : undefined),
        ...(article.show ? {showId: String(article.show)} : {}),
        ...(article.festival ? {festivalId: String(article.festival)} : {}),
        createdAt: article.createdAt ?? new Date().toISOString(),
        content: article.contentAr ?? article.contentEn ?? article.content ?? '',
        contentAr: article.contentAr ?? article.content ?? '',
        contentEn: article.contentEn ?? article.content ?? undefined,
        attachments,
    };
};

const emptyArticleResponse: PaginatedResponse<ArticleApiResult> = {
    count: 0,
    totalPages: 0,
    currentPage: 1,
    next: null,
    previous: null,
    results: [],
};

export const useFestivalEditions = () =>
    useApiQuery<FestivalApiResponse, FestivalEdition[]>({
        queryKey: buildQueryKey('festival-editions'),
        path: `${api}/festivals`,
        select: data => (data.results ?? []).map(mapFestivalApiResultToEdition),
    });

export const useFestivalEditionById = (festivalId?: string | number, options?: UseSingleEntityOptions) =>
    useApiQuery<FestivalApiResult, FestivalEdition>({
        queryKey: buildQueryKey('festival-edition', festivalId ?? 'detail'),
        path: () => `${api}/festivals/${festivalId}`,
        select: data => mapFestivalApiResultToEdition(data),
        enabled: Boolean(festivalId) && (options?.enabled ?? true),
    });

type UseShowsOptions = {
    enabled?: boolean;
};
type UseSingleEntityOptions = {
    enabled?: boolean;
};

export const useShows = (festivalId?: string | number, options?: UseShowsOptions) =>
    useApiQuery<PaginatedResponse<ShowApiResult>, Show[]>({
        queryKey: buildQueryKey('shows', festivalId ?? 'all'),
        path: festivalId
            ? withQueryParams(`${api}/shows`, {festival: festivalId, page_size: 50})
            : `${api}/shows`,
        select: data => (data.results ?? []).map(mapShowApiResultToShow),
        enabled: options?.enabled,
    });

export const useShow = (showId?: string | number, options?: UseSingleEntityOptions) =>
    useApiQuery<ShowApiResult, Show>({
        queryKey: buildQueryKey('show', showId ?? 'detail'),
        path: () => `${api}/shows/${showId}`,
        select: data => mapShowApiResultToShow(data),
        enabled: Boolean(showId) && (options?.enabled ?? true),
    });

type ArticleQueryType = 'ARTICLE' | 'SYMPOSIA' | 'CREATIVITY';

const buildArticlesPath = (contentType: ArticleQueryType) =>
    withQueryParams(`${api}/articles`, {type: contentType, page_size: 50});

export const useArticles = (contentType: ArticleQueryType = 'ARTICLE') =>
    useApiQuery<PaginatedResponse<ArticleApiResult>, Article[]>({
        queryKey: buildQueryKey('articles', contentType.toLowerCase()),
        path: () => buildArticlesPath(contentType),
        select: data => (data.results ?? []).map(mapArticleApiResultToArticle),
        placeholderData: emptyArticleResponse,
    });

export const useArticle = (articleId?: string | number, options?: UseSingleEntityOptions) =>
    useApiQuery<ArticleApiResult, Article>({
        queryKey: buildQueryKey('article', articleId ?? 'detail'),
        path: () => `${api}/articles/${articleId}`,
        select: data => mapArticleApiResultToArticle(data),
        enabled: Boolean(articleId) && (options?.enabled ?? true),
    });

export const useSymposia = () => useArticles('SYMPOSIA');

export const useCreativityEntries = () =>
    useApiQuery<PaginatedResponse<ArticleApiResult>, CreativitySubmission[]>({
        queryKey: buildQueryKey('creativity'),
        path: () => buildArticlesPath('CREATIVITY'),
        select: data => (data.results ?? []).map(mapArticleApiResultToCreativity),
        placeholderData: emptyArticleResponse,
    });

export const useLatestArticles = (limit = 3) => {
    const query = useArticles();
    const data = useMemo(
        () =>
            (query.data ?? emptyArray)
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit),
        [query.data, limit],
    );

    return {...query, data};
};

type MyShowReservationApiResult = {
    data?: { seatNumber?: string | null; reservationNumber?: number; status?: string } | null;
    message?: string;
};

export const useMyShowReservation = (showId?: string, userId?: string, enabled = true) =>
    useApiQuery<MyShowReservationApiResult>({
        queryKey: buildQueryKey('my-show-reservation', showId, userId),
        path: `${api}/shows/${showId}/my_reservation`,
        enabled: Boolean(showId) && Boolean(userId) && enabled,
        expectedStatus: [200, 404],
    });

type ReserveShowVariables = {
    showId: string;
    seatNumber?: string;
    token?: string;
};

export type ReserveShowResponse = {
    id: number;
    name: string;
    reservationNumber: number | string;
    reservationStatus: string;
    seatNumber: string | null;
};

export type ReserveShowResponseData = {
    data: ReserveShowResponse;
};

export const useIsHitaMember = (enabled = true) =>
    useApiQuery<{ data: { isMember: boolean } }, boolean>({
        queryKey: buildQueryKey('is-hita-member'),
        path: `${api}/shows/is_hita_member`,
        select: data => data.data.isMember,
        enabled,
    });

export const useShowSeats = (showId?: string) =>
    useApiQuery<{ data: { taken: string[] } }, { taken: string[] }>({
        queryKey: buildQueryKey('show-seats', showId),
        path: `${api}/shows/${showId}/seats`,
        enabled: Boolean(showId),
        select: (data) => data.data,
    });

export const useReserveShow = () =>
    useApiMutation<ReserveShowResponseData, ReserveShowVariables>({
        path: ({showId}) => `${api}/shows/${showId}/reserve`,
        method: 'POST',
        expectedStatus: 201,
        bodySerializer: ({seatNumber, token}) =>
            JSON.stringify({
                ...(seatNumber ? {seat_number: seatNumber} : {}),
                ...(token ? {access_token: token} : {}),
            }),
    });

/**
 * API response type for Comment data from backend
 *
 * API Field Mappings (snake_case → camelCase):
 * - created_at → createdAt
 * - is_approved → isApproved
 */
type CommentApiResult = {
    id: number;
    content?: string | null;
    author?: string | null;
    createdAt?: string | null;
    show?: number | null;
    isApproved?: boolean | null;
};

/**
 * Maps Comment API result to Comment frontend type
 *
 * Transforms the API response to frontend Comment format,
 * handling default values and type conversions.
 *
 * Key transformations:
 * - Converts IDs to strings
 * - Provides default values (empty content, current date, approval status)
 * - Converts show ID to string for frontend use
 *
 * @param comment - Comment data from API
 * @returns Formatted Comment object
 */
const mapCommentApiResultToComment = (comment: CommentApiResult): Comment => ({
    id: String(comment.id),
    content: comment.content ?? '',
    author: comment.author ?? undefined,
    createdAt: comment.createdAt ?? new Date().toISOString(),
    showId: comment.show ? String(comment.show) : '',
    isApproved: comment.isApproved ?? false,
});

export const useComments = (showId?: string | number) =>
    useApiQuery<PaginatedResponse<CommentApiResult>, Comment[]>({
        queryKey: buildQueryKey('comments', showId ?? 'all'),
        path: showId
            ? withQueryParams(`${api}/comments`, {show: showId, page_size: 1000})
            : `${api}/comments`,
        select: data => (data.results ?? []).map(mapCommentApiResultToComment),
        enabled: Boolean(showId),
    });

type SubmitCommentVariables = {
    content: string;
    show: string;
};

export type SubmitCommentResponse = {
    id: number;
    content: string;
    show: number;
    createdAt: string;
};

export const useSubmitComment = () =>
    useApiMutation<SubmitCommentResponse, SubmitCommentVariables>({
        path: `${api}/comments`,
        method: 'POST',
        expectedStatus: 201,
        bodySerializer: ({content, show}) =>
            JSON.stringify({
                content,
                show,
            }),
    });

export const useMyReservations = () =>
    useApiQuery<{results: MyReservation[]}, MyReservation[]>({
        queryKey: buildQueryKey('my-reservations'),
        path: `${api}/reservations/my`,
        select: data => data.results ?? [],
    });
