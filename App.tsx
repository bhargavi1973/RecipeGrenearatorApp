
import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import type { Recipe, UserIngredient } from './types';
import { generateRecipe, analyzeImage } from './services/geminiService';
import Header from './components/Header';
import IngredientInput from './components/IngredientInput';
import RecipeDisplay from './components/RecipeDisplay';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import SavedRecipesPage from './components/SavedRecipesPage';
import FavoritesPage from './components/FavoritesPage';
import SecurityPage from './components/SecurityPage';
import SettingsPage from './components/SettingsPage';
import { LanguageContext } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';

// Fix: Add TypeScript definitions for the Web Speech API (SpeechRecognition).
// This is necessary because these types are not included in standard DOM typings.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type Feedback = {
    message: string;
    type: 'success' | 'info' | 'error';
}

type CurrentPage = 'main' | 'account' | 'saved' | 'favorites' | 'security' | 'settings';

const checkAuthStatus = (): boolean => {
    try {
        return !!localStorage.getItem('ingredai-user-profile');
    } catch (e) {
        console.error("Could not access local storage for auth check:", e);
        return false;
    }
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAuthStatus());
  const [currentPage, setCurrentPage] = useState<CurrentPage>('main');
  const [ingredients, setIngredients] = useState<UserIngredient[]>([
    { name: 'Tomatoes', quantity: '2', unit: '' },
    { name: 'Onion', quantity: '1', unit: '' },
    { name: 'Garlic', quantity: '3', unit: 'cloves' },
    { name: 'Chicken Breast', quantity: '1', unit: 'lb' },
  ]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [skillLevel, setSkillLevel] = useState<string>('Any');
  const [dietaryPreference, setDietaryPreference] = useState<string>('None');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Voice and Image command state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  
  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();

  // Load saved data from local storage on initial render
  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem('gemini-recipes');
      if (storedRecipes) setSavedRecipes(JSON.parse(storedRecipes));

      const storedFavorites = localStorage.getItem('gemini-favorites');
      if (storedFavorites) setFavoriteRecipes(JSON.parse(storedFavorites));

       const storedTheme = localStorage.getItem('ingredai-theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch (e) {
      console.error("Failed to load from local storage:", e);
    }
  }, []);

  // Effect to apply class to <html> tag and save theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
        localStorage.setItem('ingredai-theme', theme);
    } catch(e) {
        console.error("Failed to save theme to local storage:", e);
    }
  }, [theme]);
  
  const isCurrentRecipeSaved = recipe ? savedRecipes.some(r => r.recipeName === recipe.recipeName) : false;
  const isCurrentRecipeFavorited = recipe ? favoriteRecipes.some(r => r.recipeName === recipe.recipeName) : false;

  const handleLogout = () => {
    try {
        localStorage.removeItem('ingredai-user-profile');
    } catch (e) {
        console.error("Failed to clear user profile on logout:", e);
    }
    setIsAuthenticated(false);
    setCurrentPage('main');
  };
  
  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  const showFeedback = useCallback((newFeedback: Feedback | null, duration: number = 4000) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedback(newFeedback);
    if (newFeedback) {
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback(null);
      }, duration);
    }
  }, []);

  const handleGenerateRecipe = useCallback(async () => {
    if (ingredients.length === 0) {
      setError(t('error.addOneIngredient'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const generatedRecipe = await generateRecipe(ingredients, skillLevel, dietaryPreference);
      setRecipe(generatedRecipe);
    } catch (e) {
      console.error(e);
      setError(t('error.recipeGenerationFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, skillLevel, dietaryPreference, t]);
  
  // Utility to convert file to base64
  const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const data = result.split(',')[1];
        if (!data) {
            reject(new Error("Could not read file data."));
            return;
        }
        resolve({ data, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    setIsAnalyzingImage(true);
    setError(null);
    showFeedback({ message: t('feedback.analyzingImage'), type: 'info' }, 15000);

    try {
      const { data, mimeType } = await fileToBase64(file);
      const identifiedIngredients = await analyzeImage(data, mimeType);

      if (identifiedIngredients.length > 0) {
        const newIngredients: UserIngredient[] = identifiedIngredients.map(ing => ({
            name: ing.charAt(0).toUpperCase() + ing.slice(1),
            quantity: '',
            unit: ''
        }));
        
        setIngredients(prev => {
            const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
            const uniqueNewIngredients = newIngredients.filter(i => !existingNames.has(i.name.toLowerCase()));
            return [...prev, ...uniqueNewIngredients];
        });

        showFeedback({ message: `${t('feedback.addedIngredients')}: ${newIngredients.map(i => i.name).join(', ')}`, type: 'success' });
      } else {
        showFeedback({ message: t('feedback.noIngredientsFound'), type: 'info' });
      }
    } catch (e) {
      console.error(e);
      setError(t('error.imageAnalysisFailed'));
      showFeedback(null);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSaveRecipe = (recipeToSave: Recipe) => {
    if (savedRecipes.some(r => r.recipeName === recipeToSave.recipeName)) {
      return;
    }
    const newSavedRecipes = [...savedRecipes, recipeToSave];
    setSavedRecipes(newSavedRecipes);
    try {
      localStorage.setItem('gemini-recipes', JSON.stringify(newSavedRecipes));
    } catch (e) {
      console.error("Failed to save recipes to local storage:", e);
    }
  };
  
   const handleToggleFavorite = (recipeToToggle: Recipe) => {
    let newFavorites: Recipe[];
    if (favoriteRecipes.some(r => r.recipeName === recipeToToggle.recipeName)) {
        newFavorites = favoriteRecipes.filter(r => r.recipeName !== recipeToToggle.recipeName);
    } else {
        newFavorites = [...favoriteRecipes, recipeToToggle];
    }
    setFavoriteRecipes(newFavorites);
    try {
        localStorage.setItem('gemini-favorites', JSON.stringify(newFavorites));
    } catch (e) {
        console.error("Failed to save favorites to local storage:", e);
    }
  };

  const handleSetRating = (newRating: number) => {
    if (!recipe) return;

    // Update the currently displayed recipe
    const updatedRecipe = { ...recipe, rating: newRating };
    setRecipe(updatedRecipe);

    // If this recipe is already in the cookbook or favorites, update it there too
    const updateInList = (list: Recipe[]) => {
        const index = list.findIndex(r => r.recipeName === recipe.recipeName);
        if (index > -1) {
            const newList = [...list];
            newList[index] = updatedRecipe;
            return newList;
        }
        return list;
    };
    
    const newSavedRecipes = updateInList(savedRecipes);
    setSavedRecipes(newSavedRecipes);
    try {
        localStorage.setItem('gemini-recipes', JSON.stringify(newSavedRecipes));
    } catch (e) {
        console.error("Failed to update recipe rating in saved recipes:", e);
    }
    
    const newFavoriteRecipes = updateInList(favoriteRecipes);
    setFavoriteRecipes(newFavoriteRecipes);
     try {
        localStorage.setItem('gemini-favorites', JSON.stringify(newFavoriteRecipes));
    } catch (e) {
        console.error("Failed to update recipe rating in favorites:", e);
    }
  };

    // Voice Command Processing
  const processTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim().replace(/\.$/, '');
    let feedbackMessage: Feedback = { message: `Command: "${transcript}"`, type: 'info' };
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    if (lowerTranscript.startsWith('add ')) {
        const ingredientsToAdd = lowerTranscript.substring(4).split(' and ').map(i => i.trim()).filter(Boolean);
        if (ingredientsToAdd.length > 0) {
            const newIngredients: UserIngredient[] = ingredientsToAdd.map(name => ({
                name: capitalize(name),
                quantity: '',
                unit: ''
            }));
            setIngredients(prev => {
                const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
                const uniqueNewIngredients = newIngredients.filter(i => !existingNames.has(i.name.toLowerCase()));
                return [...prev, ...uniqueNewIngredients];
            });
            feedbackMessage = { message: `Added: ${newIngredients.map(i => i.name).join(', ')}`, type: 'success' };
        } else {
            feedbackMessage = { message: 'Could not find ingredients to add.', type: 'error' };
        }
    } else if (lowerTranscript.startsWith('remove ') || lowerTranscript.startsWith('delete ')) {
        const keyword = lowerTranscript.startsWith('remove ') ? 'remove ' : 'delete ';
        const ingredientsToRemove = lowerTranscript.substring(keyword.length).split(' and ').map(i => i.trim().toLowerCase()).filter(Boolean);
        if(ingredientsToRemove.length > 0) {
            setIngredients(prev => prev.filter(ing => !ingredientsToRemove.includes(ing.name.toLowerCase())));
            feedbackMessage = { message: `Removed: ${ingredientsToRemove.map(capitalize).join(', ')}`, type: 'success' };
        } else {
            feedbackMessage = { message: 'Could not find ingredients to remove.', type: 'error' };
        }
    } else if (lowerTranscript === 'clear ingredients' || lowerTranscript === 'remove all ingredients') {
        setIngredients([]);
        feedbackMessage = { message: 'Cleared all ingredients.', type: 'success' };
    } else if (['generate recipe', 'get recipe', 'make something', 'cook something'].some(cmd => lowerTranscript.includes(cmd))) {
        handleGenerateRecipe();
        feedbackMessage = { message: 'Generating your recipe!', type: 'info' };
    } else if (lowerTranscript.includes('dark mode')) {
        if(theme === 'light') handleThemeToggle();
        feedbackMessage = { message: 'Switched to dark mode.', type: 'info' };
    } else if (lowerTranscript.includes('light mode')) {
        if(theme === 'dark') handleThemeToggle();
        feedbackMessage = { message: 'Switched to light mode.', type: 'info' };
    } else if (lowerTranscript.includes('save recipe')) {
        if (recipe && !isCurrentRecipeSaved) {
            handleSaveRecipe(recipe);
            feedbackMessage = { message: `Saved "${recipe.recipeName}" to your cookbook.`, type: 'success' };
        } else if (isCurrentRecipeSaved) {
            feedbackMessage = { message: 'This recipe is already saved.', type: 'info' };
        } else {
            feedbackMessage = { message: 'No recipe to save.', type: 'error' };
        }
    } else if (lowerTranscript.includes('log out') || lowerTranscript.includes('sign out')) {
        handleLogout();
        feedbackMessage = { message: 'Logging you out.', type: 'info' };
    } else {
        feedbackMessage = { message: `Sorry, I didn't understand "${transcript}". Try "add tomatoes" or "generate recipe".`, type: 'error' };
    }

    showFeedback(feedbackMessage);
  }, [recipe, isCurrentRecipeSaved, theme, handleGenerateRecipe, showFeedback]);

  // Effect to initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        setIsVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = language;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            showFeedback({ message: t('feedback.listening'), type: 'info' });
        };

        recognition.onend = () => {
            setIsListening(false);
            if (feedback?.message === t('feedback.listening')) {
              showFeedback(null, 1);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            showFeedback({ message: `${t('error.generic')}: ${event.error}`, type: 'error' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processTranscript(transcript);
        };

        recognitionRef.current = recognition;
    } else {
        setIsVoiceSupported(false);
    }
  }, [processTranscript, feedback, showFeedback, t, language]);

  const handleToggleListening = () => {
    if (!isVoiceSupported || !recognitionRef.current) return;
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };

  const handleDeleteRecipe = (recipeNameToDelete: string) => {
    const newSavedRecipes = savedRecipes.filter(r => r.recipeName !== recipeNameToDelete);
    setSavedRecipes(newSavedRecipes);
    try {
      localStorage.setItem('gemini-recipes', JSON.stringify(newSavedRecipes));
    } catch (e) {
      console.error("Failed to update recipes in local storage:", e);
    }
  };

  const handleSelectRecipe = (recipeToSelect: Recipe) => {
    setRecipe(recipeToSelect);
    setError(null);
    setCurrentPage('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const feedbackColorClasses = {
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
    error: 'bg-red-500 text-white',
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
        case 'account':
            return <AccountPage
                onClose={() => setCurrentPage('main')}
                onLogout={handleLogout}
                showFeedback={showFeedback}
            />;
        case 'saved':
            return <SavedRecipesPage
                recipes={savedRecipes}
                onSelectRecipe={handleSelectRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                onGoBack={() => setCurrentPage('main')}
            />;
        case 'favorites':
            return <FavoritesPage
                recipes={favoriteRecipes}
                onSelectRecipe={handleSelectRecipe}
                onToggleFavorite={handleToggleFavorite}
                onGoBack={() => setCurrentPage('main')}
            />;
        case 'security':
            return <SecurityPage
                onClose={() => setCurrentPage('main')}
                showFeedback={showFeedback}
            />;
        case 'settings':
            return <SettingsPage
                onClose={() => setCurrentPage('main')}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                dietaryPreference={dietaryPreference}
                setDietaryPreference={setDietaryPreference}
                skillLevel={skillLevel}
                setSkillLevel={setSkillLevel}
                showFeedback={showFeedback}
            />;
        case 'main':
        default:
            return (
                 <main className="flex-grow container mx-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                    <section id="ingredient-section" className="mb-12 bg-green-50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600 dark:text-green-400">{t('main.title')}</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{t('main.subtitle')}</p>
                        <IngredientInput
                        ingredients={ingredients}
                        setIngredients={setIngredients}
                        isListening={isListening}
                        isVoiceSupported={isVoiceSupported}
                        onToggleListening={handleToggleListening}
                        isAnalyzingImage={isAnalyzingImage}
                        onImageUpload={handleImageUpload}
                        />

                        <div className="mt-8 text-center">
                        <button
                            onClick={handleGenerateRecipe}
                            disabled={isLoading || ingredients.length === 0}
                            className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-green-500/20"
                        >
                            {isLoading ? t('main.generatingButton') : t('main.generateButton')}
                        </button>
                        </div>
                    </section>

                    <section id="recipe-section">
                        <RecipeDisplay
                        recipe={recipe}
                        isLoading={isLoading}
                        error={error}
                        onSave={handleSaveRecipe}
                        isSaved={isCurrentRecipeSaved}
                        onSetRating={handleSetRating}
                        isFavorited={isCurrentRecipeFavorited}
                        onToggleFavorite={handleToggleFavorite}
                        />
                    </section>
                    </div>
                </main>
            );
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 font-sans">
      <Header
        onLogout={handleLogout}
        onThemeToggle={handleThemeToggle}
        theme={theme}
        onShowSavedRecipes={() => setCurrentPage('saved')}
        onShowAccount={() => setCurrentPage('account')}
        onShowFavorites={() => setCurrentPage('favorites')}
        onShowSecurity={() => setCurrentPage('security')}
        onShowSettings={() => setCurrentPage('settings')}
        isListening={isListening}
      />
      
      {renderPage()}

      <Footer />

      {feedback && (
        <div className={`fixed bottom-4 right-4 py-2 px-4 rounded-lg shadow-lg z-20 animate-fade-in-up ${feedbackColorClasses[feedback.type] || 'bg-gray-800 text-white'}`}>
            {feedback.message}
        </div>
      )}
    </div>
  );
};

export default App;
