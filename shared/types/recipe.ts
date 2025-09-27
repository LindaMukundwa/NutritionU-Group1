/**
 * Definining shared recipe types and interfaces to be used thhroughut application
 */
export interface Ingredient {
  openFoodFactsId?: string;
  name: string;
  amount: number;
  unit: 'grams' | 'kg' | 'ml' | 'liters' | 'cups' | 'tbsp' | 'tsp' | 'pieces' | 'slices';
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'spice' | 'condiment' | 'other';
  nutrition: NutritionInfo;
  estimatedCost: number;    // Cost if we end up deciding to track this as a feature
}

export interface InstructionStep {
  stepNumber: number;
  instruction: string;
  estimatedTime?: number;
  temperature?: string;
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
  totalNutrition: NutritionInfo;
  estimatedCostPerServing: number;
  dietaryTags: string[];
  source: 'openai_generated' | 'user_created' | 'imported' | 'curated';
  openaiPrompt?: string;
  averageRating: number;
  ratingCount: number;
  createdBy?: string;
  isPublic: boolean;
  nutritionPerServing?: NutritionInfo;
  createdAt: Date;
  updatedAt: Date;
}