import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import mwrTranslation from './locales/mwr.json'; // Marwadi
import taTranslation from './locales/ta.json'; // Tamil
import teTranslation from './locales/te.json'; // Telugu
import bnTranslation from './locales/bn.json'; // Bengali
import mrTranslation from './locales/mr.json'; // Marathi
import urTranslation from './locales/ur.json'; // Urdu

const resources = {
  en: enTranslation,
  hi: hiTranslation,
  mwr: mwrTranslation,
  ta: taTranslation,
  te: teTranslation,
  bn: bnTranslation,
  mr: mrTranslation,
  ur: urTranslation
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // default to saved language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
