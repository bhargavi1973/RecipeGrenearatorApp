
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, IngredientSubstitution, UserIngredient } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "The creative name of the recipe."
    },
    description: {
      type: Type.STRING,
      description: "A short, enticing description of the dish."
    },
    prepTime: {
      type: Type.STRING,
      description: "The estimated time required for preparation (e.g., '15 minutes')."
    },
    cookTime: {
      type: Type.STRING,
      description: "The estimated time required for cooking (e.g., '30 minutes')."
    },
    nutrition: {
      type: Type.OBJECT,
      description: "Estimated nutritional information per serving.",
      properties: {
        calories: { type: Type.STRING, description: "Estimated calories (e.g., '350 kcal')." },
        protein: { type: Type.STRING, description: "Estimated protein in grams (e.g., '20g')." },
        carbs: { type: Type.STRING, description: "Estimated carbohydrates in grams (e.g., '30g')." },
        fat: { type: Type.STRING, description: "Estimated fat in grams (e.g., '15g')." },
      },
      required: ["calories", "protein", "carbs", "fat"]
    },
    ingredients: {
      type: Type.ARRAY,
      description: "A list of all ingredients required for the recipe, including amounts.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the ingredient."
          },
          amount: {
            type: Type.STRING,
            description: "The quantity of the ingredient (e.g., '1 cup', '2 tbsp')."
          },
        },
        required: ["name", "amount"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      description: "The step-by-step instructions for preparing the recipe.",
      items: {
        type: Type.STRING
      }
    },
    leftoverSuggestions: {
        type: Type.ARRAY,
        description: "1-2 creative ideas for using any potential leftovers from this recipe.",
        items: {
            type: Type.STRING
        }
    }
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "nutrition", "ingredients", "instructions"],
};

const substitutionSchema = {
  type: Type.OBJECT,
  properties: {
    substitutions: {
      type: Type.ARRAY,
      description: "A list of ingredient substitution suggestions.",
      items: {
        type: Type.OBJECT,
        properties: {
          originalIngredient: {
            type: Type.STRING,
            description: "The original ingredient name."
          },
          suggestions: {
            type: Type.ARRAY,
            description: "A list of suggested substitute ingredients.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["originalIngredient", "suggestions"]
      }
    }
  },
  required: ["substitutions"]
};

const imageAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      description: "An array of food ingredients identified in the image.",
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["ingredients"]
};

export const analyzeImage = async (base64ImageData: string, mimeType: string): Promise<string[]> => {
  const prompt = "Analyze this image and identify all the food ingredients visible. Return your response as a JSON object with a single key 'ingredients' which is an array of strings. For example: {\"ingredients\": [\"tomato\", \"onion\"]}. If no food items are found, return an empty array.";

  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: imageAnalysisSchema,
      },
    });

    const text = response.text.trim();
    const result: { ingredients: string[] } = JSON.parse(text);
    return result.ingredients || [];
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};


export const generateRecipe = async (ingredients: UserIngredient[], skillLevel: string, dietaryPreference: string): Promise<Recipe> => {
  const formattedIngredients = ingredients
    .map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`.trim().replace(/\s+/g, ' '))
    .join(', ');
  
  let prompt = `You are an expert chef who specializes in creating delicious, zero-waste recipes from a limited set of ingredients. Your primary goal is to create a single, creative recipe that utilizes as many of the provided ingredients as possible, ideally all of them. The available ingredients are: ${formattedIngredients}. Feel free to include common pantry staples if necessary (like salt, pepper, oil, water, flour).`;

  if (dietaryPreference === 'Vegan') {
    prompt += " The recipe must strictly adhere to a Vegan diet. If any provided ingredients are not vegan (e.g., milk, eggs, honey), you must substitute them with a common plant-based alternative (e.g., almond milk for milk, flax egg for egg). You must document the substitution in the final instruction step, like 'Note: [Original Ingredient] was substituted with [Vegan Substitute] to adhere to the vegan diet.'";
  } else if (dietaryPreference === 'Vegetarian') {
    prompt += " The recipe must strictly adhere to a Vegetarian diet. This means no meat, poultry, or fish. Dairy and eggs are acceptable. If any provided ingredients are not vegetarian, you must substitute them with a common vegetarian alternative and note the substitution.";
  } else if (dietaryPreference === 'Keto') {
    prompt += " The recipe must be strictly ketogenic (keto-friendly), meaning it must be very low in carbohydrates and high in healthy fats. Avoid sugars, grains, and high-carb vegetables. Focus on ingredients like meats, healthy oils, avocados, and low-carb vegetables.";
  } else if (dietaryPreference === 'Gluten-Free & Peanut-Free') {
    prompt = `You are a food safety expert and chef specializing in allergen-free cooking. Generate a single, creative recipe using the following ingredients: ${formattedIngredients}. The recipe MUST be 100% gluten-free and peanut-free.
- Critically verify that every single ingredient, including common pantry staples (like sauces, spices, oils), is certified gluten-free and produced in a peanut-free facility.
- Explicitly exclude any ingredients that contain gluten (wheat, barley, rye, malt) or peanuts. Do not allow for cross-contamination.
- If a provided ingredient is unsafe, do not use it.`;
  }

  if (skillLevel === 'Beginner') {
    prompt += " The recipe must be optimized for a beginner cook. The instructions must have a maximum of 5 simple, easy-to-follow, non-technical steps.";
  }

  prompt += " Provide a unique name for the recipe, a brief, enticing description, an estimated preparation time, an estimated cooking time, estimated nutritional information per serving (calories, protein, carbs, and fat), a list of all ingredients with specific amounts, and clear, step-by-step instructions. Also, include 1-2 creative suggestions for using any potential leftovers. Structure your response strictly in the defined JSON format.";

  try {
    // 1. Generate the recipe text
    const recipeResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = recipeResponse.text.trim();
    const recipeData: Recipe = JSON.parse(text);

    // 2. Generate substitutions for the ingredients
    try {
      const ingredientNames = recipeData.ingredients.map(ing => ing.name);
      if (ingredientNames.length > 0) {
        const substitutionPrompt = `For the following ingredients from a recipe, provide 1-2 common culinary substitutions for each. If an ingredient is a very common staple that doesn't have a good substitute (like water, salt, pepper), you can omit it from the list. The ingredients are: ${ingredientNames.join(', ')}. Structure your response strictly in the defined JSON format.`;

        const substitutionResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: substitutionPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: substitutionSchema,
          },
        });
        
        const subText = substitutionResponse.text.trim();
        const substitutionData: { substitutions: IngredientSubstitution[] } = JSON.parse(subText);

        if (substitutionData.substitutions && substitutionData.substitutions.length > 0) {
          recipeData.substitutions = substitutionData.substitutions;
        }
      }
    } catch (subError) {
      console.error("Could not generate ingredient substitutions, but continuing with the recipe:", subError);
      // Fail gracefully - the recipe will just not have substitutions.
    }

    // 3. Generate an image for the recipe
    const imagePrompt = `A delicious, mouth-watering, professional food photograph of "${recipeData.recipeName}". ${recipeData.description}`;
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        recipeData.imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    return recipeData;
  } catch (error) {
    console.error("Error generating recipe from Gemini:", error);
    throw new Error("Failed to parse recipe from AI response.");
  }
};
