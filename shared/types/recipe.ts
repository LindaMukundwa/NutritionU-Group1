/**
 * Definining shared recipe types and interfaces to be used thhroughut application
 */
export interface Ingredient {
  openFoodFactsId?: string;
  name: string;
  amount: number; // The quantity of the ingredient required for the recipe
  unit: 
    | { type: 'metric'; value: 'grams' | 'kg' | 'ml' | 'liters' }
    | { type: 'imperial'; value: 'pounds' | 'cups' | 'ounces' | 'tbsp' | 'tsp' | 'pieces' | 'slices' };
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'spice' | 'condiment' | 'other';
  nutritionInfo: NutritionInfo;
}

export interface InstructionStep {
  stepNumber: number;
  instruction: string; // Instruction text (ie. what to do, how to do it, temperature, time, etc)
  equipment: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Main interface 
export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  nutritionInfo: NutritionInfo;
  estimatedCostPerServing: number;
  dietaryTags: string[];
  source: 'openai_generated' | 'user_created' | 'imported' | 'curated';
  openaiPrompt?: string;
  createdBy?: string;
  nutritionPerServing?: NutritionInfo;
  createdAt: Date;
  updatedAt: Date;
}