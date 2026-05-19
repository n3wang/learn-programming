import { useCallback, useEffect, useState } from 'react';

export const SITE_LANGUAGE_STORAGE_KEY = 'site-lang';
export const SITE_LANGUAGE_CHANGE_EVENT = 'site-language-change';

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
  return saved === 'zh' ? 'zh' : 'en';
}

export function useSiteLanguage() {
  const [lang, setLangState] = useState(getInitialLanguage);

  const setLang = useCallback((nextLang) => {
    const normalized = nextLang === 'zh' ? 'zh' : 'en';
    setLangState(normalized);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, normalized);
      window.dispatchEvent(
        new CustomEvent(SITE_LANGUAGE_CHANGE_EVENT, { detail: { lang: normalized } }),
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onLanguageChange = (event) => {
      const nextLang = event?.detail?.lang === 'zh' ? 'zh' : 'en';
      setLangState(nextLang);
    };

    window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, onLanguageChange);
    return () => window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, onLanguageChange);
  }, []);

  return { lang, setLang };
}
