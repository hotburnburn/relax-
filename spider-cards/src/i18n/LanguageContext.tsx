import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations, type Translations } from './translations';

export type Language = 'en' | 'zh';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const STORAGE_KEY = 'spider_solitaire_lang';

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return 'zh';
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
