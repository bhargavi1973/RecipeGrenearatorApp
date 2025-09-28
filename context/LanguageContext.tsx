
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Translations = { [key: string]: any };

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: Translations;
}

const availableLanguages = ['en', 'es', 'fr', 'ja', 'zh', 'hi', 'bn', 'ta', 'te', 'mr'];

const getInitialLanguage = (): string => {
    try {
        const savedProfile = localStorage.getItem('ingredai-user-profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            const savedLang = profile.language;
            if (savedLang && availableLanguages.includes(savedLang)) {
                return savedLang;
            }
        }
    } catch (error) {
        console.error("Could not access local storage for language preference:", error);
    }
    // Default to browser language or 'en'
    const browserLang = navigator.language.split('-')[0];
    return availableLanguages.includes(browserLang) ? browserLang : 'en';
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: {},
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(getInitialLanguage);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const fetchTranslations = async (lang: string) => {
      try {
        // Fetch the translation file from the public 'locales' directory.
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Could not load translation file for language: ${lang}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        // Fallback to English if the selected language fails to load
        if (lang !== 'en') {
          try {
            const response = await fetch('./locales/en.json');
            const data = await response.json();
            setTranslations(data);
          } catch (fallbackError) {
            console.error('Failed to load fallback English translations:', fallbackError);
            setTranslations({}); // Set to empty if English also fails
          }
        } else {
            setTranslations({});
        }
      }
    };

    fetchTranslations(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};
