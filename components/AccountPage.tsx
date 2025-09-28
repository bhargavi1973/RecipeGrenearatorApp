
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Feedback } from '../App';

interface AccountPageProps {
  onClose: () => void;
  onLogout: () => void;
  showFeedback: (feedback: Feedback, duration?: number) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onClose, onLogout, showFeedback }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const { t } = useTranslation();
    
    useEffect(() => {
        // Load user profile from local storage
        try {
            const savedProfile = localStorage.getItem('ingredai-user-profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setUsername(profile.username || '');
                setEmail(profile.email || '');
            }
        } catch (error) {
            console.error("Failed to load user profile from local storage:", error);
        }
    }, []);

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const savedProfileRaw = localStorage.getItem('ingredai-user-profile');
            const savedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
            
            const updatedProfile = { 
                ...savedProfile, 
                username, 
                email,
             };
            localStorage.setItem('ingredai-user-profile', JSON.stringify(updatedProfile));
            showFeedback({ message: t('feedback.profileUpdated'), type: 'success' });
        } catch (error) {
            console.error("Failed to save user profile to local storage:", error);
            showFeedback({ message: t('feedback.saveFailed'), type: 'error' });
        }
    };

    const handleDeleteAccount = () => {
        const confirmationText = t('account.deleteConfirmationText');
        if (deleteConfirmation !== confirmationText) {
            showFeedback({ message: t('feedback.confirmationMismatch'), type: 'error' });
            return;
        }

        try {
            localStorage.removeItem('ingredai-user-profile');
            localStorage.removeItem('gemini-recipes');
            localStorage.removeItem('gemini-favorites');
            showFeedback({ message: t('feedback.accountDeleted'), type: 'info' });
            onLogout();
        } catch (error) {
                console.error("Failed to delete account data from local storage:", error);
                showFeedback({ message: t('feedback.deleteFailed'), type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteConfirmation('');
        }
    }

  return (
    <>
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('account.title')}</h1>
            </div>

            <form onSubmit={handleSaveChanges}>
                {/* Profile Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('account.profileTitle')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.username')}</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="block w-full text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.email')}</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-green-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20">
                        {t('common.saveChanges')}
                    </button>
                </div>
            </form>
            
            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-red-300 dark:border-red-800">
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">{t('account.dangerZone')}</h2>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('account.deleteAccount')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.deleteAccountWarning')}</p>
                    </div>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300">
                        {t('account.deleteAccount')}
                    </button>
                </div>
            </div>

        </div>
        </main>

        {isDeleteModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400">{t('account.deleteConfirmTitle')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2" dangerouslySetInnerHTML={{ __html: t('account.deleteConfirmSubtitle', { text: `<strong class="text-gray-800 dark:text-gray-200">${t('account.deleteConfirmationText')}</strong>` }) }} />
                    <input 
                        type="text"
                        value={deleteConfirmation}
                        onChange={e => setDeleteConfirmation(e.target.value)}
                        className="block w-full mt-4 text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5"
                        placeholder={t('account.deleteConfirmationText')}
                    />
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== t('account.deleteConfirmationText')}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
             </div>
        )}
    </>
  );
};

export default AccountPage;
