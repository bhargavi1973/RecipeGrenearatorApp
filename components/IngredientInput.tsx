
import React, { useState, useRef } from 'react';
import type { UserIngredient } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface IngredientInputProps {
  ingredients: UserIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<UserIngredient[]>>;
  isListening: boolean;
  isVoiceSupported: boolean;
  onToggleListening: () => void;
  isAnalyzingImage: boolean;
  onImageUpload: (file: File) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients, isListening, isVoiceSupported, onToggleListening, isAnalyzingImage, onImageUpload }) => {
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleAddIngredient = () => {
    if (name.trim()) {
        const newIngredient: UserIngredient = {
          quantity: quantity.trim(),
          unit: unit.trim(),
          name: name.trim(),
        };
        setIngredients([...ingredients, newIngredient]);
        setQuantity('');
        setUnit('');
        setName('');
        nameInputRef.current?.focus();
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    e.target.value = '';
  };


  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-grow flex gap-2">
            <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('ingredient.qty')}
                aria-label={t('ingredient.qtyLabel')}
                className="w-16 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t('ingredient.unit')}
                aria-label={t('ingredient.unitLabel')}
                list="common-units"
                className="w-24 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <datalist id="common-units">
                <option value="tsp" />
                <option value="tbsp" />
                <option value="cup" />
                <option value="oz" />
                <option value="lb" />
                <option value="g" />
                <option value="kg" />
                <option value="mL" />
                <option value="L" />
                <option value="clove" />
                <option value="pinch" />
            </datalist>
            <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ingredient.namePlaceholder')}
                aria-label={t('ingredient.nameLabel')}
                className="flex-grow bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleAddIngredient}
              className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400"
              disabled={!name.trim()}
            >
              {t('ingredient.addButton')}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-hidden="true"
            />
            <button
                onClick={handleCameraClick}
                disabled={isAnalyzingImage}
                className={`p-2.5 rounded-full transition-colors duration-300 relative ${
                    isAnalyzingImage
                    ? 'bg-green-500 text-white cursor-wait'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                } disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed`}
                title={t('ingredient.analyzeImageTitle')}
                aria-label={t('ingredient.analyzeImageLabel')}
            >
                {isAnalyzingImage ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>
            <button
                onClick={onToggleListening}
                disabled={!isVoiceSupported || isListening}
                className={`p-2.5 rounded-full transition-colors duration-300 relative ${
                    isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                } disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed`}
                title={isVoiceSupported ? (isListening ? t('ingredient.stopListening') : t('ingredient.useVoice')) : t('ingredient.voiceNotSupported')}
                aria-label={isVoiceSupported ? (isListening ? t('ingredient.stopListening') : t('ingredient.useVoice')) : t('ingredient.voiceNotSupported')}
            >
                {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v2a3 3 0 01-3 3z" />
                </svg>
            </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <span
            key={index}
            className="flex items-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-full animate-fade-in"
          >
            {`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`.trim().replace(/\s+/g, ' ')}
            <button
              onClick={() => handleRemoveIngredient(index)}
              className="ml-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label={`${t('ingredient.remove')} ${ingredient.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default IngredientInput;
