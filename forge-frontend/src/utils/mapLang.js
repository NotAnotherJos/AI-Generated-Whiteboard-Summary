// Language mapping for backend API
const mapLanguageToBackend = (i18nLang) => {
  const languageMap = {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    it: 'Italiano',
    fr: 'Français',
    es: 'Español',
  };
  return languageMap[i18nLang] || 'English'; 
};

export default mapLanguageToBackend;