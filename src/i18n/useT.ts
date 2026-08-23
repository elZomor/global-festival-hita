'use client';

import { useLocale, useTranslations } from 'next-intl';
import { convertDigitsToArabic } from '../utils/numberUtils';

type Translator = ReturnType<typeof useTranslations>;

export function useT(): Translator {
  const t = useTranslations();
  const locale = useLocale();

  if (locale !== 'ar') return t;

  return ((key: Parameters<Translator>[0], values?: Parameters<Translator>[1]) => {
    const result = t(key as never, values as never);
    return typeof result === 'string' ? convertDigitsToArabic(result) : result;
  }) as Translator;
}
