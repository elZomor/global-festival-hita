import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'ar';

const messagesByLocale = { ar, en };

export const resolveLocale = (value?: string | null): SupportedLocale =>
  SUPPORTED_LOCALES.includes(value as SupportedLocale) ? (value as SupportedLocale) : DEFAULT_LOCALE;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
