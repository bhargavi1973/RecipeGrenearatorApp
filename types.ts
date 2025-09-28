
export interface UserIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface IngredientSubstitution {
  originalIngredient: string;
  suggestions: string[];
}

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl?: string;
  rating?: number;
  substitutions?: IngredientSubstitution[];
  nutrition?: NutritionInfo;
  leftoverSuggestions?: string[];
}