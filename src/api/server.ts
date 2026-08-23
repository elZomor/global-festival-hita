import 'server-only';
import { transformKeysToCamel } from './reactQueryClient';
import { festivalConfig } from '../config/festival';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const apiPrefix = festivalConfig.apiPrefix;

export async function serverApiFetch<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path), { next: { revalidate } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return transformKeysToCamel(JSON.parse(text)) as T;
  } catch {
    return null;
  }
}

export const withQueryParams = (
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
) => {
  if (!params) return path;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  if (!queryString) return path;
  return `${path}${path.includes('?') ? '&' : '?'}${queryString}`;
};
