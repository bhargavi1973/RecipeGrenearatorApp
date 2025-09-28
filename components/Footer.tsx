
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400">
        <p>{t('footer.poweredBy')}</p>
        <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
