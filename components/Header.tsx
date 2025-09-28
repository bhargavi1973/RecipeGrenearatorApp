
import React from 'react';
import DropdownMenu from './DropdownMenu';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
  onLogout: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
  onShowSavedRecipes: () => void;
  onShowAccount: () => void;
  onShowFavorites: () => void;
  onShowSecurity: () => void;
  onShowSettings: () => void;
  isListening: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogout, onThemeToggle, theme, onShowSavedRecipes, onShowAccount, 
  onShowFavorites, onShowSecurity, onShowSettings, isListening 
}) => {
  const { t } = useTranslation();
  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm shadow-lg shadow-green-500/10 dark:shadow-green-900/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            IngredAI
          </h1>
          {isListening && (
            <div className="ml-2" title={t('header.listeningTitle')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 animate-pulse-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v2a3 3 0 01-3 3z" />
                </svg>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-green-500 transition-colors"
            aria-label={t('header.toggleDarkMode')}
          >
            {theme === 'light' ? (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <DropdownMenu 
            onLogout={onLogout} 
            onShowSavedRecipes={onShowSavedRecipes} 
            onShowAccount={onShowAccount} 
            onShowFavorites={onShowFavorites}
            onShowSecurity={onShowSecurity}
            onShowSettings={onShowSettings}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
