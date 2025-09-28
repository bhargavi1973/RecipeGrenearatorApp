
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useTranslation = () => {
  const { translations } = useContext(LanguageContext);

  const t = (key: string, replacements: { [key: string]: string } = {}): string => {
    let translation = key.split('.').reduce((acc, currentKey) => {
      if (acc && typeof acc === 'object' && currentKey in acc) {
        return acc[currentKey];
      }
      return undefined;
    }, translations) as string | undefined;

    if (translation === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as a fallback
    }

    // Handle replacements
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      translation = (translation as string).replace(regex, replacements[placeholder]);
    });
    
    return translation;
  };

  return { t };
};
