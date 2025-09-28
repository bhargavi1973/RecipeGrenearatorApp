
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500 dark:border-green-400"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">{t('loading.message')}</p>
    </div>
  );
};

export default LoadingSpinner;
