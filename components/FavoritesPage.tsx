
import React from 'react';
import type { Recipe } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface FavoritesPageProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  onGoBack: () => void;
}

const StarRatingDisplay = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            })}
        </div>
    );
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({ recipes, onSelectRecipe, onToggleFavorite, onGoBack }) => {
  const { t } = useTranslation();
  return (
    <main className="flex-grow container mx-auto p-4 md:p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <button 
                    onClick={onGoBack} 
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-semibold text-sm p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
                    aria-label={t('common.back')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('common.back')}</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('favorites.title')}</h1>
            </div>

             {recipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                    <div key={recipe.recipeName} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden group transition-transform duration-300 hover:scale-105">
                        {recipe.imageUrl && (
                             <button onClick={() => onSelectRecipe(recipe)} className="block w-full h-40 overflow-hidden">
                                <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                             </button>
                        )}
                        <div className="p-4 flex flex-col flex-grow">
                             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 truncate">{recipe.recipeName}</h3>
                             <div className="flex-grow" />
                             <div className="flex items-center justify-between mt-4">
                                {recipe.rating ? <StarRatingDisplay rating={recipe.rating} /> : <div className="h-4" />}
                                <div className="flex items-center gap-2">
                                     <button
                                        onClick={() => onSelectRecipe(recipe)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                        aria-label={`${t('common.view')} ${recipe.recipeName}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onToggleFavorite(recipe)}
                                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                        aria-label={`${t('favorites.remove')} ${recipe.recipeName}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-lg">{t('favorites.emptyTitle')}</p>
                    <p>{t('favorites.emptySubtitle')}</p>
                </div>
                )}
        </div>
    </main>
  );
};

export default FavoritesPage;
