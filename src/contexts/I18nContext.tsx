"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/i18n/en.json';
import ta from '@/i18n/ta.json';

type Language = 'en' | 'ta';
type Dictionary = typeof en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Language, Dictionary> = {
  en,
  ta
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    // Load preference from localStorage on mount
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dictionaries[lang];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Missing translation key: ${path} for language: ${lang}`);
        return path;
      }
      current = current[key];
    }
    
    return current as string;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
