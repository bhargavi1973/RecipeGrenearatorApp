
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Feedback } from '../App';

interface SecurityPageProps {
  onClose: () => void;
  showFeedback: (feedback: Feedback, duration?: number) => void;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ onClose, showFeedback }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        try {
            const twoFactorStatus = localStorage.getItem('ingredai-2fa-enabled');
            setIs2FAEnabled(twoFactorStatus === 'true');
        } catch (error) {
            console.error("Failed to load 2FA status from local storage:", error);
        }
    }, []);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
             showFeedback({ message: t('feedback.fillAllFields'), type: 'error' });
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showFeedback({ message: t('feedback.passwordsNoMatch'), type: 'error' });
            return;
        }

        if (newPassword.length < 8) {
             showFeedback({ message: t('login.errors.passwordLength'), type: 'error' });
             return;
        }
        
        // In a real app, you would have an API call here.
        // For this demo, we'll just show success and clear fields.
        showFeedback({ message: t('feedback.passwordChanged'), type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handle2FAToggle = () => {
        const newStatus = !is2FAEnabled;
        setIs2FAEnabled(newStatus);
        try {
            localStorage.setItem('ingredai-2fa-enabled', String(newStatus));
            showFeedback({ 
                message: newStatus ? t('feedback.twoFAEnabled') : t('feedback.twoFADisabled'),
                type: 'info' 
            });
        } catch (error) {
            console.error("Failed to save 2FA status:", error);
            showFeedback({ message: t('feedback.twoFAUpdateFailed'), type: 'error' });
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('security.title')}</h1>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('security.changePassword')}</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('security.currentPassword')}</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="block w-full text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('security.newPassword')}</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('security.confirmNewPassword')}</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full text-base bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors p-2.5" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-green-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105">
                            {t('security.updatePassword')}
                        </button>
                    </div>
                </form>
            </div>

            {/* 2FA Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('security.twoFactorAuth')}</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('security.enable2FA')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('security.twoFactorSubtitle')}</p>
                    </div>
                    <button onClick={handle2FAToggle} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${is2FAEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Login History */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                 <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">{t('security.loginHistory')}</h2>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('security.loginHistorySubtitle')}</p>
                 <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Chrome on Windows</p>
                            <p className="text-gray-500 dark:text-gray-400">{t('security.location')}: New York, USA</p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{t('security.today')}</p>
                    </li>
                    <li className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Safari on macOS</p>
                            <p className="text-gray-500 dark:text-gray-400">{t('security.location')}: London, UK</p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{t('security.yesterday')}</p>
                    </li>
                 </ul>
            </div>

        </div>
    </main>
  );
};

export default SecurityPage;
