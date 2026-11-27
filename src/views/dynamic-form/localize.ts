/** Form text is authored in Arabic with optional English; English falls back to Arabic when empty. */
export const pickText = (locale: string, ar: string, en?: string | null): string =>
  locale === 'en' && en?.trim() ? en : ar;
