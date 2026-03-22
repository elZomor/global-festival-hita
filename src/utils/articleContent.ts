import type {Article} from '../types';

/**
 * Returns localized article content string depending on the current layout direction.
 * Falls back to Arabic content when English is unavailable.
 */
export const getLocalizedArticleContent = (article: Article, isRTL: boolean) => {
    const localized = isRTL ? article.contentAr : article.contentEn ?? article.contentAr;
    return localized?.trim() ?? '';
};

/**
 * Builds a short preview string for cards/lists, falling back to sections when content is missing.
 */
export const getArticlePreviewText = (article: Article, isRTL: boolean, length = 250) => {
    const localizedContent = getLocalizedArticleContent(article, isRTL);
    if (localizedContent.length > 0) {
        return localizedContent.substring(0, length);
    }

    if (article.sections && article.sections.length > 0) {
        const joinedSections = article.sections.join(' ').trim();
        return joinedSections.substring(0, length);
    }

    return '';
};
