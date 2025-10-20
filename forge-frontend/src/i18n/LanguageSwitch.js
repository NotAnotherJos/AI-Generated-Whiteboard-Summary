import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './languages/en.json';
import zh from './languages/zh.json';
import ja from './languages/ja.json';
import it from './languages/it.json';
import es from './languages/es.json';
import fr from './languages/fr.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja },
    it: { translation: it },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
