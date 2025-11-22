import { useState, useEffect, useCallback } from 'react';
import { mealPlanService, type MealPlan, type MealPlanItem } from '../../services/mealPlanService';

interface Meal {
  id?: number;
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

interface DayMealPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

interface WeeklyMealPlan {
  [dateString: string]: DayMealPlan;
}

/**
 * Custom hook to manage weekly meal plans with backend persistence
 */
export function useMealPlan(userId: string | undefined) {
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({});
  const [currentMealPlanId, setCurrentMealPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load meal plan from backend on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadMealPlan = async () => {
      try {
        setLoading(true);
        const mealPlan = await mealPlanService.getCurrentWeekMealPlan(userId);
        
        if (mealPlan) {
          setCurrentMealPlanId(mealPlan.id);
          // Convert backend format to component format
          const convertedPlan = convertBackendToFrontend(mealPlan);
          setWeeklyMealPlan(convertedPlan);
        }
      } catch (err) {
        console.error('Error loading meal plan:', err);
        setError('Failed to load meal plan');
      } finally {
        setLoading(false);
      }
    };

    loadMealPlan();
  }, [userId]);

  // Save meal plan to backend
  const saveMealPlan = useCallback(async (plan: WeeklyMealPlan) => {
    if (!userId) return;

    try {
      const items = convertFrontendToBackend(plan);
      
      if (currentMealPlanId) {
        // Update existing meal plan
        await mealPlanService.updateMealPlan(currentMealPlanId, items);
      } else {
        // Create new meal plan
        const newMealPlan = await mealPlanService.createMealPlan(userId, items);
        setCurrentMealPlanId(newMealPlan.id);
      }
    } catch (err) {
      console.error('Error saving meal plan:', err);
      setError('Failed to save meal plan');
    }
  }, [userId, currentMealPlanId]);

  // Debounced save function - saves after changes stop for 2 seconds
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (plan: WeeklyMealPlan) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          saveMealPlan(plan);
        }, 2000); // Save 2 seconds after last change
      };
    })(),
    [saveMealPlan]
  );

  // Update meal plan with automatic save
  const updateWeeklyMealPlan = useCallback((plan: WeeklyMealPlan) => {
    setWeeklyMealPlan(plan);
    debouncedSave(plan);
  }, [debouncedSave]);

  return {
    weeklyMealPlan,
    setWeeklyMealPlan: updateWeeklyMealPlan,
    loading,
    error,
    saveMealPlan: () => saveMealPlan(weeklyMealPlan), // Manual save option
  };
}

/**
 * Convert backend MealPlan format to frontend WeeklyMealPlan format
 */
function convertBackendToFrontend(mealPlan: MealPlan): WeeklyMealPlan {
  const plan: WeeklyMealPlan = {};
  
  // Group items by date
  mealPlan.items.forEach((item) => {
    if (!item.recipe) return;
    
    // Calculate date string from dayOfWeek
    const date = getDateForDayOfWeek(item.dayOfWeek);
    const dateString = date.toISOString().split('T')[0];
    
    if (!plan[dateString]) {
      plan[dateString] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };
    }
    
    const meal: Meal = {
      id: item.id,
      name: item.recipe.title,
      calories: item.recipe.nutritionInfo?.calories || 0,
      time: `${item.recipe.totalTime || 0} min`,
      cost: `$${item.recipe.estimatedCostPerServing?.toFixed(2) || '0.00'}`,
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
    
    plan[dateString][item.mealType as keyof DayMealPlan].push(meal);
  });
  
  return plan;
}

/**
 * Convert frontend WeeklyMealPlan format to backend MealPlanItem format
 */
function convertFrontendToBackend(plan: WeeklyMealPlan): Omit<MealPlanItem, 'id'>[] {
  const items: Omit<MealPlanItem, 'id'>[] = [];
  
  Object.entries(plan).forEach(([dateString, dayPlan]) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    
    (['breakfast', 'lunch', 'dinner', 'snacks'] as const).forEach((mealType) => {
      dayPlan[mealType].forEach((meal) => {
        // For now, we'll need to store/retrieve recipe IDs
        // This is a placeholder - you'll need to handle recipe creation/retrieval
        if (meal.id) {
          items.push({
            recipeId: meal.id, // Assuming meal.id is the recipe ID
            dayOfWeek,
            mealType,
          });
        }
      });
    });
  });
  
  return items;
}

/**
 * Get date for a specific day of week in the current week
 */
function getDateForDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = dayOfWeek - currentDay;
  const date = new Date(today);
  date.setDate(date.getDate() + diff);
  return date;
}
