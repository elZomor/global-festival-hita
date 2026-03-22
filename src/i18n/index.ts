import i18n, { type PostProcessorModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { convertDigitsToArabic } from '../utils/numberUtils';

const numbersPostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'numbers',
  process(value, _key, options, translator) {
    const language = options?.lng || translator?.language || i18n.language;
    if (language === 'ar' && typeof value === 'string') {
      return convertDigitsToArabic(value);
    }
    return value;
  },
};

i18n
  .use(numbersPostProcessor)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    postProcess: ['numbers'],
  });

export default i18n;
