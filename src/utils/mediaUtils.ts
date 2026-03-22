export const buildMediaUrl = (path?: string) => {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const fallbackBase = typeof window !== 'undefined' ? window.location.origin : '';
    const baseUrl = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : fallbackBase;

    if (!baseUrl) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    return `${normalizedBase}/${normalizedPath}`;
};
