
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LoginPageProps {
  onLogin: () => void;
}

const getInitialMode = (): 'signup' | 'login' => {
  try {
    const savedProfile = localStorage.getItem('ingredai-user-profile');
    return savedProfile ? 'login' : 'signup';
  } catch (error) {
    console.error("Could not access local storage:", error);
    return 'signup';
  }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signup' | 'login'>(getInitialMode);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [nation, setNation] = useState('');
  const [language, setLanguage] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation();
  
  // Load user profile from local storage on initial render
  useEffect(() => {
    try {
        const savedProfile = localStorage.getItem('ingredai-user-profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setUsername(profile.username || '');
            setAge(profile.age || '');
            setGender(profile.gender || '');
            setNation(profile.nation || '');
            setLanguage(profile.language || '');
        }
    } catch (error) {
        console.error("Failed to load user profile from local storage:", error);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Username validation
    if (!username) {
        newErrors.username = t('login.errors.usernameRequired');
    } else if (username.length < 3) {
      newErrors.username = t('login.errors.usernameLength');
    } else if (!/^\w+$/.test(username)) {
      newErrors.username = t('login.errors.usernameInvalid');
    }

    // Age validation
    if (!age) {
        newErrors.age = t('login.errors.ageRequired');
    } else {
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          newErrors.age = t('login.errors.ageInvalid');
        }
    }

    // Password validation
    if (!password) {
        newErrors.password = t('login.errors.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('login.errors.passwordLength');
    } else {
        const passwordErrors = [];
        if (!/[A-Z]/.test(password)) passwordErrors.push(t('login.errors.passwordUppercase'));
        if (!/[a-z]/.test(password)) passwordErrors.push(t('login.errors.passwordLowercase'));
        if (!/[0-9]/.test(password)) passwordErrors.push(t('login.errors.passwordNumber'));
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) passwordErrors.push(t('login.errors.passwordSpecial'));

        if (passwordErrors.length > 0) {
            newErrors.password = `${t('login.errors.passwordMustContain')} ${passwordErrors.join(', ')}.`;
        }
    }
    
    // Other required fields for signup
    if (!gender) newErrors.gender = t('login.errors.genderRequired');
    if (!nation) newErrors.nation = t('login.errors.nationRequired');
    if (!language) newErrors.language = t('login.errors.languageRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (mode === 'signup') {
      if (validate()) {
        // Save user profile to local storage on successful signup
        try {
            const userProfile = { username, age, gender, nation, language };
            localStorage.setItem('ingredai-user-profile', JSON.stringify(userProfile));
            window.location.reload(); // Reload to apply language
        } catch (error) {
            console.error("Failed to save user profile to local storage:", error);
        }
      }
    } else {
      // Basic login validation
      const newErrors: { [key: string]: string } = {};
      if (!username) newErrors.username = t('login.errors.usernameRequired');
      if (!password) newErrors.password = t('login.errors.passwordRequired');
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      } else {
        // On successful login, update the stored profile with the current username
         try {
            const savedProfileRaw = localStorage.getItem('ingredai-user-profile');
            const savedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
            const updatedProfile = { ...savedProfile, username };
            localStorage.setItem('ingredai-user-profile', JSON.stringify(updatedProfile));
        } catch (error) {
             console.error("Failed to update profile in local storage:", error);
        }
        onLogin();
      }
    }
  };
  
  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'signup' ? 'login' : 'signup'));
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      IngredAI
                  </h1>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {mode === 'signup' ? t('login.signupSubtitle') : t('login.loginSubtitle')}
              </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.username')}</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required={mode === 'login'}
                          className="block w-full pl-10 pr-4 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                        />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.age')}</label>
                           <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                               </div>
                                <input
                                  type="number"
                                  value={age}
                                  onChange={(e) => setAge(e.target.value)}
                                  className="block w-full pl-10 pr-4 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                                />
                           </div>
                          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.gender')}</label>
                          <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                               </div>
                                <select 
                                    value={gender} 
                                    onChange={e => setGender(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-10 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                                >
                                    <option value="" disabled>{t('login.select')}</option>
                                    <option value="male">{t('login.genders.male')}</option>
                                    <option value="female">{t('login.genders.female')}</option>
                                    <option value="other">{t('login.genders.other')}</option>
                                    <option value="prefer_not_to_say">{t('login.genders.preferNotToSay')}</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                          </div>
                          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.nation')}</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </div>
                            <input
                              type="text"
                              value={nation}
                              onChange={(e) => setNation(e.target.value)}
                              className="block w-full pl-10 pr-4 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                            />
                        </div>
                        {errors.nation && <p className="text-red-500 text-xs mt-1">{errors.nation}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.language')}</label>
                         <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 9a9 9 0 019-9m-9 9a9 9 0 00-9 9" />
                                </svg>
                            </div>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="appearance-none block w-full pl-10 pr-10 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                            >
                              <option value="" disabled>{t('login.select')}</option>
                              <option value="en">English</option>
                              <option value="fr">French</option>
                              <option value="es">Spanish</option>
                              <option value="ja">Japanese</option>
                              <option value="zh">Chinese</option>
                              <option value="hi">Hindi</option>
                              <option value="bn">Bengali</option>
                              <option value="ta">Tamil</option>
                              <option value="te">Telugu</option>
                              <option value="mr">Marathi</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
                    </div>
                  </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login.password')}</label>
                     <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={mode === 'login'}
                          className="block w-full pl-10 pr-4 py-2.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg text-gray-900 dark:text-gray-200 transition-colors"
                        />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
            </div>

            <div className="pt-4">
               <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
              >
                {mode === 'signup' ? t('login.signUpButton') : t('login.loginButton')}
              </button>
            </div>
          </form>
           <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signup' ? t('login.alreadyHaveAccount') : t('login.dontHaveAccount')}{' '}
            <button onClick={toggleMode} className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 focus:outline-none">
              {mode === 'signup' ? t('login.loginButton') : t('login.signUpButton')}
            </button>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
        <div className="text-center text-white p-12">
            <h2 className="text-4xl font-bold mb-4">{t('login.promoTitle')}</h2>
            <p className="text-lg text-green-100">{t('login.promoSubtitle')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
