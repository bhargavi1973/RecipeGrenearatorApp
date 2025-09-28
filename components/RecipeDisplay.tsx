import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../hooks/useTranslation';

interface RecipeDisplayProps {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  onSave: (recipe: Recipe) => void;
  isSaved: boolean;
  onSetRating: (rating: number) => void;
  isFavorited: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, isLoading, error, onSave, isSaved, onSetRating, isFavorited, onToggleFavorite }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [hoverRating, setHoverRating] = useState(0);
  const { t } = useTranslation();

  // Reset the checklist whenever a new recipe is displayed
  useEffect(() => {
    if (recipe) {
      setCheckedIngredients(new Set());
    }
  }, [recipe]);

  const handleCheckIngredient = (ingredientName: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
        <strong className="font-bold">{t('recipe.errorTitle')} </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <p className="text-lg">{t('recipe.placeholderTitle')}</p>
        <p>{t('recipe.placeholderSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl animate-fade-in-up border border-gray-200 dark:border-gray-700">
      {recipe.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={recipe.imageUrl} 
            alt={t('recipe.imageAlt', { recipeName: recipe.recipeName })}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-3 gap-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400 flex-1">{recipe.recipeName}</h2>
        <div className="flex-shrink-0 flex items-center gap-2">
            <button
                onClick={() => onToggleFavorite(recipe)}
                className={`p-2.5 rounded-full transition-colors duration-200 ${
                    isFavorited 
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                }`}
                aria-label={isFavorited ? t('recipe.removeFromFavorites') : t('recipe.addToFavorites')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </button>
            <button
            onClick={() => onSave(recipe)}
            disabled={isSaved}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-green-500 hover:text-white dark:hover:bg-green-600 disabled:bg-green-100 disabled:text-green-700 dark:disabled:bg-green-900/50 dark:disabled:text-green-400 disabled:cursor-not-allowed transition-colors duration-300"
            aria-label={isSaved ? t('recipe.recipeSaved') : t('recipe.saveRecipe')}
            >
            {isSaved ? (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('recipe.saved')}</span>
                </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
                </svg>
                <span>{t('recipe.save')}</span>
                </>
            )}
            </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8 italic">{recipe.description}</p>
      
      <div className="my-8 py-6 border-y border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 text-center">
            <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.prepTime')}</h4>
                <p className="text-gray-600 dark:text-gray-400">{recipe.prepTime}</p>
            </div>
            <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 0110.014 1.014C24.5 5 22 8 22 10c2 1 2.657 1.657 2.657 1.657a8 8 0 01-11.314 11.314zM5 22s5-4 5-10H5a8 8 0 000 10z" />
                </svg>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.cookTime')}</h4>
                <p className="text-gray-600 dark:text-gray-400">{recipe.cookTime}</p>
            </div>
            {recipe.nutrition && (
                <>
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.calories')}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{recipe.nutrition.calories}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.protein')}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{recipe.nutrition.protein}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.carbs')}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{recipe.nutrition.carbs}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('recipe.fat')}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{recipe.nutrition.fat}</p>
                    </div>
                </>
            )}
        </div>
      </div>


      <div className="mb-8 flex flex-col items-center">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('recipe.rateThis')}</h4>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={index}
                onClick={() => onSetRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
                // FIX: The translation function `t` expects string values for replacements. Convert `starValue` to a string.
                aria-label={t('recipe.rateStars', { count: String(starValue) })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 transition-colors ${
                    starValue <= (hoverRating || recipe.rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-500 hover:text-yellow-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-green-500 dark:border-green-400 pb-2">{t('recipe.ingredients')}</h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, index) => {
              const isChecked = checkedIngredients.has(ing.name);
              return (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckIngredient(ing.name)}
                      className="h-5 w-5 bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 rounded text-green-500 focus:ring-green-500/50 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 transition-all"
                      aria-label={`${t('recipe.check')} ${ing.name}`}
                    />
                    <span className={`ml-3 transition-colors ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : 'group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>
                      <strong>{ing.amount}</strong> {ing.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b-2 border-green-500 dark:border-green-400 pb-2">{t('recipe.instructions')}</h3>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                {/* FIX: Explicitly convert number to string to satisfy TypeScript compiler. */}
                <span className="flex-shrink-0 bg-green-500 dark:bg-green-600 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4">{String(index + 1)}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
            {t('recipe.substitutionsTitle')}
          </h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6 -mt-4">{t('recipe.substitutionsSubtitle')}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipe.substitutions.map((sub, index) => (
              <div key={index} className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-l-4 border-gray-200 dark:border-gray-600 border-l-accent">
                <dt className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {t('recipe.for')} {sub.originalIngredient}
                </dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">
                  {t('recipe.try')}: {sub.suggestions.join(` ${t('recipe.or')} `)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {recipe.leftoverSuggestions && recipe.leftoverSuggestions.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
            {t('recipe.leftoversTitle')}
          </h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6 -mt-4">{t('recipe.leftoversSubtitle')}</p>
          <ul className="space-y-4">
            {recipe.leftoverSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;
