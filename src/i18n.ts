import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import siCommon from './locales/si/common.json';
import taCommon from './locales/ta/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  si: {
    common: siCommon,
  },
  ta: {
    common: taCommon,
  },
};

// Initialize i18n
const initialized = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    // Fallback language
    fallbackLng: 'en',

    // Disable debug mode in development to prevent console spam
    debug: false,

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common'],

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false,
    },

    // Prevent reinitialization
    initImmediate: false,
  });

// Prevent multiple initializations (important for Vite HMR)
if (!initialized && i18n.isInitialized) {
  throw new Error('i18n already initialized');
}

export default i18n;
