
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Feedback } from '../App';

interface SettingsPageProps {
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  dietaryPreference: string;
  setDietaryPreference: React.Dispatch<React.SetStateAction<string>>;
  skillLevel: string;
  setSkillLevel: React.Dispatch<React.SetStateAction<string>>;
  showFeedback: (feedback: Feedback, duration?: number) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    onClose, theme, onThemeToggle, dietaryPreference, setDietaryPreference, skillLevel, setSkillLevel, showFeedback 
}) => {
    const { t } = useTranslation();
    
    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const savedProfileRaw = localStorage.getItem('ingredai-user-profile');
            const savedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
            
            const updatedProfile = { 
                ...savedProfile, 
                dietaryPreference,
                skillLevel,
             };
            localStorage.setItem('ingredai-user-profile', JSON.stringify(updatedProfile));
            showFeedback({ message: t('feedback.preferencesSaved'), type: 'success' });
        } catch (error) {
            console.error("Failed to save preferences to local storage:", error);
            showFeedback({ message: t('feedback.saveFailed'), type: 'error' });
        }
    };
    
    const handleClearData = () => {
        if (window.confirm(t('settings.confirmClearData'))) {
             try {
                localStorage.removeItem('ingredai-user-profile');
                localStorage.removeItem('gemini-recipes');
                localStorage.removeItem('gemini-favorites');
                localStorage.removeItem('ingredai-2fa-enabled');
                showFeedback({ message: t('feedback.dataCleared'), type: 'info' });
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                 console.error("Failed to clear local storage:", error);
                 showFeedback({ message: t('feedback.clearFailed'), type: 'error' });
            }
        }
    };

  return (
    <main className="flex-grow container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
            <button 
                onClick={onClose} 
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-semibold text-sm p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
                aria-label={t('common.back')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('common.back')}</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('settings.title')}</h1>
        </div>

        <form onSubmit={handleSaveChanges}>
            {/* Preferences Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('settings.preferencesTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="dietary-preference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.dietaryPreference')}</label>
                        <select id="dietary-preference" value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)} className="appearance-none block w-full p-2.5 text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors">
                            <option>{t('settings.diets.none')}</option>
                            <option>{t('settings.diets.vegetarian')}</option>
                            <option>{t('settings.diets.vegan')}</option>
                            <option>{t('settings.diets.keto')}</option>
                            <option>{t('settings.diets.glutenPeanutFree')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.skillLevel')}</label>
                        <select id="skill-level" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="appearance-none block w-full p-2.5 text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors">
                            <option>{t('settings.skills.any')}</option>
                            <option>{t('settings.skills.beginner')}</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end mb-8">
                <button type="submit" className="bg-green-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20">
                    {t('settings.savePreferences')}
                </button>
            </div>
        </form>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('settings.appearanceTitle')}</h2>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('settings.theme')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.currentTheme')}: {theme === 'light' ? t('settings.light') : t('settings.dark')}</p>
                </div>
                <button onClick={onThemeToggle} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md">
                   {theme === 'light' ? t('settings.switchToDark') : t('settings.switchToLight')}
                </button>
            </div>
        </div>

        {/* Data Management Section */}
        <div className="mt-12 pt-8 border-t-2 border-dashed border-red-300 dark:border-red-800">
             <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">{t('settings.dataManagement')}</h2>
             <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('settings.clearData')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.clearDataSubtitle')}</p>
                </div>
                <button onClick={handleClearData} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300">
                    {t('settings.clearData')}
                </button>
             </div>
        </div>

      </div>
    </main>
  );
};

export default SettingsPage;
