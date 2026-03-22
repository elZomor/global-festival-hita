const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const formatLocalizedNumber = (value: number, language: string): string => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale).format(value);
};

export const convertDigitsToArabic = (value: string): string =>
  value.replace(/\d/g, digit => arabicDigits[Number(digit)]);

export const localizeDigitsInString = (value: string, language: string): string =>
  language === 'ar' ? convertDigitsToArabic(value) : value;
