/**
 * Utility functions for meal plan management
 * These helpers convert between frontend and backend data formats
 */

import type { MealPlanItem } from '../../services/mealPlanService';

export interface Meal {
  recipeId?: number;  // Added for backend persistence
  name: string;
  calories: number;
  time: string;
  cost: string;
  recipe: {
    ingredients: string[];
    instructions: string[];
    nutrition: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

export interface DayMealPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

export interface WeeklyMealPlan {
  [dateString: string]: DayMealPlan;
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return getDateString(d);
}

/**
 * Get end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  return getDateString(d);
}

/**
 * Get or create empty day plan for a specific date
 */
export function getOrCreateDayPlan(plan: WeeklyMealPlan, dateString: string): DayMealPlan {
  if (!plan[dateString]) {
    plan[dateString] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }
  return plan[dateString];
}

/**
 * Convert frontend WeeklyMealPlan to backend MealPlanItem array
 */
export function convertFrontendToBackendItems(plan: WeeklyMealPlan): Omit<MealPlanItem, 'id'>[] {
  console.log('[convertFrontendToBackendItems] Input plan:', plan);
  const items: Omit<MealPlanItem, 'id'>[] = [];

  Object.entries(plan).forEach(([dateString, dayPlan]) => {
    console.log('[convertFrontendToBackendItems] Processing date:', dateString, 'dayPlan:', dayPlan);
    
    (['breakfast', 'lunch', 'dinner', 'snacks'] as const).forEach((mealType) => {
      console.log(`[convertFrontendToBackendItems] Processing ${mealType}:`, dayPlan[mealType]);
      
      dayPlan[mealType].forEach((meal: Meal, index: number) => {
        console.log(`[convertFrontendToBackendItems] Meal ${index}:`, meal);
        console.log(`[convertFrontendToBackendItems] Meal recipeId:`, meal.recipeId);
        
        if (meal.recipeId) {
          const item = {
            recipeId: meal.recipeId,
            date: dateString,
            mealType,
          };
          console.log('[convertFrontendToBackendItems] ✅ Adding item:', item);
          items.push(item);
        } else {
          console.warn('[convertFrontendToBackendItems] ⚠️ Skipping meal without recipeId:', meal);
        }
      });
    });
  });
  
  console.log('[convertFrontendToBackendItems] Final items array:', items);
  return items;
}

/**
 * Convert backend MealPlan array to frontend WeeklyMealPlan format
 */
export function convertBackendPlansToFrontend(plans: any[]): WeeklyMealPlan {
  const result: WeeklyMealPlan = {};

  plans.forEach((plan) => {
    plan.items.forEach((item: any) => {
      const dateStr = item.date.split('T')[0]; // Ensure YYYY-MM-DD format
      
      if (!result[dateStr]) {
        result[dateStr] = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        };
      }

      if (item.recipe) {
        const meal: Meal = {
          recipeId: item.recipeId,
          name: item.recipe.title,
          calories: item.recipe.nutritionInfo?.calories || 0,
          time: `${item.recipe.totalTime || 0} min`,
          cost: `$${(item.recipe.estimatedCostPerServing || 0).toFixed(2)}`,
          recipe: {
            ingredients: Array.isArray(item.recipe.ingredients)
              ? item.recipe.ingredients.map((ing: any) =>
                  typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit?.value || ''} ${ing.name}`
                )
              : [],
            instructions: Array.isArray(item.recipe.instructions)
              ? item.recipe.instructions.map((step: any) =>
                  typeof step === 'string' ? step : step.instruction
                )
              : [],
            nutrition: {
              protein: item.recipe.nutritionInfo?.protein || 0,
              carbs: item.recipe.nutritionInfo?.carbs || 0,
              fat: item.recipe.nutritionInfo?.fat || 0,
              fiber: item.recipe.nutritionInfo?.fiber || 0,
            },
          },
        };

        result[dateStr][item.mealType as keyof DayMealPlan].push(meal);
      }
    });
  });

  return result;
}

/**
 * Format a date string for display
 */
export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get day name from date string
 */
export function getDayName(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getDateString(new Date());
}

/**
 * Get dates for the entire week containing the given date
 */
export function getWeekDates(date: Date): string[] {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    dates.push(getDateString(currentDate));
  }

  return dates;
}

/**
 * Calculate total nutrition for a day
 */
export function calculateDailyNutrition(dayPlan: DayMealPlan) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalCost = 0;

  (['breakfast', 'lunch', 'dinner', 'snacks'] as const).forEach((mealType) => {
    dayPlan[mealType].forEach((meal) => {
      totalCalories += meal.calories;
      totalProtein += meal.recipe.nutrition.protein;
      totalCarbs += meal.recipe.nutrition.carbs;
      totalFat += meal.recipe.nutrition.fat;
      totalFiber += meal.recipe.nutrition.fiber;
      totalCost += parseFloat(meal.cost.replace('$', '')) || 0;
    });
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    cost: totalCost,
  };
}

/**
 * Calculate weekly nutrition totals
 */
export function calculateWeeklyNutrition(weeklyPlan: WeeklyMealPlan) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalCost = 0;
  let daysWithMeals = 0;

  Object.values(weeklyPlan).forEach((dayPlan) => {
    const dayNutrition = calculateDailyNutrition(dayPlan);
    if (dayNutrition.calories > 0) {
      totalCalories += dayNutrition.calories;
      totalProtein += dayNutrition.protein;
      totalCarbs += dayNutrition.carbs;
      totalFat += dayNutrition.fat;
      totalFiber += dayNutrition.fiber;
      totalCost += dayNutrition.cost;
      daysWithMeals++;
    }
  });

  return {
    total: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      fiber: Math.round(totalFiber),
      cost: totalCost,
    },
    average: {
      calories: daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0,
      protein: daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0,
      carbs: daysWithMeals > 0 ? Math.round(totalCarbs / daysWithMeals) : 0,
      fat: daysWithMeals > 0 ? Math.round(totalFat / daysWithMeals) : 0,
      fiber: daysWithMeals > 0 ? Math.round(totalFiber / daysWithMeals) : 0,
      cost: daysWithMeals > 0 ? totalCost / daysWithMeals : 0,
    },
    daysWithMeals,
  };
}
