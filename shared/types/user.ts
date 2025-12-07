import type { Recipe } from "./recipe";

/**
 * Definining shared user types and interfaces to be used thhroughut application
 */
export interface User {
  gender: any;
  // Generally static
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;

  // Gathered from onboarding
  age?: number;
  height?: number;
  weight?: number;
  units: 'imperial' | 'metric';
  bmi?: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  medicalRestrictions: MedicalRestrictions;
  nutritionGoals: NutritionGoals;
  lifestyleDiets: LifestyleDiets;
  culturalDiets: CulturalDiets;
  budget: Budget;
  goals: string;
  cookingLevel: string;

  // Update on action
  onboardingCompleted: boolean;
  lastLogin: Date;
  planGenerationCount: number;
  favoriteRecipes?: string[]; // string of recipe ids
  mealPlans?: Recipe[];
  createdAt: Date;
  updatedAt: Date;

  // Meals
  recipe?: string[]; // string of recipe ids
  // free-form onboarding/profile data
  profile?: any;
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
  description: "Medical and health dietary restrictions";
}

export interface LifestyleDiets {
  vegeterian: boolean;
  pescetarian: boolean;
  flexiterian: boolean;
  mediterranean: boolean;
  paleo: boolean;
  keto: boolean;
  whole30: boolean;
  none: boolean;
  description: "Lifestyle and ethical dietary choices";
}

export interface CulturalDiets {
  halal: boolean;
  kosher: boolean;
  jain: boolean;
  hindu: boolean;
  buddhist: boolean;
  none: boolean;
  description: "Cultural and religious dietary preferences";
}

export interface Budget {
  value?: number;
  step: 25; // Increment
  default: 100; // Value if budget is not set
  description: "Weekly food budget in dollars";
}

export interface NutritionGoals {
  goals?: "Save Money" | "Eat Healthier" | "Save Time" | "Learn to Cook" | "Lose Weight" | "Gain Muscle" | "None";
  calories?: number;
  protein?: number; // In grams
  carbs?: number; // In grams
  fats?: number; // In grams
  description: "User nutrition and lifestyle goals";
}