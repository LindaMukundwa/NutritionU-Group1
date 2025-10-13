/**
 * Definining shared user types and interfaces to be used thhroughut application
 */
export interface DietaryRestrictions {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
  //kosher: boolean;
  halal: boolean;
  custom: string[];
}

export interface NutritionGoals {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface UserPreferences {
  cuisineTypes: string[];
  cookingTime: 'quick' | 'moderate' | 'lengthy';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  budgetRange: {
    min: number;
    max: number;
  };
  servingSize: number;
}
/*
// Notification settings for user defined but commented out till needed in future.
export interface NotificationSettings {
  mealReminders: boolean;
  groceryReminders: boolean;
  hydrationReminders: boolean;
  weeklyPlanReminders: boolean;
  preferredTime: string;
}
  */

export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  age?: number;
  height?: number;
  weight?: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  medicalRestrictions: MedicalRestrictions;
  nutritionGoals: NutritionGoals;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  lastLogin: Date;
  planGenerationCount: number;
  mealHistory: MealHistoryEntry[];
  favoriteRecipes: string[];
  bmr?: number;
  recommendedCalories?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealHistoryEntry {
  mealId: string;
  rating: number;
  cookedDate: Date;
  notes?: string;
}

export interface MedicalRestrictions {
  gluten: boolean;
  dairy: boolean;
  nuts: boolean;
  peanuts: boolean;
  soy: boolean;
  eggs: boolean;
  shellfish: boolean;
  wheat: boolean;
  sesame: boolean;
  corn: boolean;
  sulfites: boolean;
  fodmap: boolean;
  histamine: boolean;
  lowSodium: boolean;
  lowSugar: boolean;
  none: boolean;
  description: "Medical and health dietary restrictions"
}