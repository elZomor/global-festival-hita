import { getLocale, getTranslations } from 'next-intl/server';
import { convertDigitsToArabic } from '../utils/numberUtils';

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export async function getT(): Promise<Translator> {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  if (locale !== 'ar') return t;

  const wrapped = ((key: Parameters<Translator>[0], values?: Parameters<Translator>[1]) => {
    const result = t(key as never, values as never);
    return typeof result === 'string' ? convertDigitsToArabic(result) : result;
  }) as Translator;

  return wrapped;
}
