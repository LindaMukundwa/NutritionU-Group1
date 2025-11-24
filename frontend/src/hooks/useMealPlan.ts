import { useState, useEffect, useCallback, useRef } from 'react';
import { mealPlanService } from '../../services/mealPlanService';
import {
  getWeekStart,
  getWeekEnd,
  convertBackendPlansToFrontend,
  convertFrontendToBackendItems,
  type WeeklyMealPlan,
} from '../utils/mealPlanUtils';

/**
 * Custom hook to manage weekly meal plans with backend persistence
 * Implements auto-save with 2-second debounce
 */
export function useMealPlan(userId: string | undefined) {
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load meal plans from backend on mount
  useEffect(() => {
    if (!userId) {
      console.log('[useMealPlan] No userId provided, skipping load');
      setLoading(false);
      return;
    }

    const loadMealPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const startDate = getWeekStart(today);
        const endDate = getWeekEnd(today);

        console.log('[useMealPlan] Loading meal plans for user:', userId);
        console.log('[useMealPlan] Date range:', { startDate, endDate });

        const plans = await mealPlanService.getMealPlansByDateRange(
          userId,
          startDate,
          endDate
        );

        console.log('[useMealPlan] Received plans from backend:', plans);

        const converted = convertBackendPlansToFrontend(plans);
        console.log('[useMealPlan] Converted to frontend format:', converted);
        
        setWeeklyMealPlan(converted);
      } catch (err) {
        console.error('[useMealPlan] Failed to load meal plans:', err);
        setError('Failed to load meal plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMealPlans();
  }, [userId]);

  // Auto-save meal plan when it changes - debounced
  useEffect(() => {
    if (!userId || loading) {
      console.log('[useMealPlan] Skipping auto-save:', { userId, loading });
      return;
    }

    if (saveTimeoutRef.current) {
      console.log('[useMealPlan] Clearing existing save timeout');
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('[useMealPlan] Auto-saving meal plan...');
        console.log('[useMealPlan] Current weeklyMealPlan state:', weeklyMealPlan);
        
        const items = convertFrontendToBackendItems(weeklyMealPlan);
        console.log('[useMealPlan] Converted to backend items:', items);
        
        if (items.length > 0) {
          const result = await mealPlanService.saveMealPlan(
            userId,
            getWeekStart(new Date()),
            getWeekEnd(new Date()),
            items
          );
          console.log('[useMealPlan] ✅ Save result:', result);
        } else {
          console.log('[useMealPlan] No items to save, skipping');
        }
      } catch (err) {
        console.error('[useMealPlan] ❌ Auto-save failed:', err);
        setError('Failed to save changes. Please try again.');
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [weeklyMealPlan, userId, loading]);

  // Manual save function
  const saveMealPlan = useCallback(async () => {
    if (!userId) return;

    try {
      const items = convertFrontendToBackendItems(weeklyMealPlan);
      
      if (items.length > 0) {
        await mealPlanService.saveMealPlan(
          userId,
          getWeekStart(new Date()),
          getWeekEnd(new Date()),
          items
        );
      }
    } catch (err) {
      console.error('Failed to save meal plan:', err);
      setError('Failed to save meal plan');
    }
  }, [userId, weeklyMealPlan]);

  return {
    weeklyMealPlan,
    setWeeklyMealPlan,
    loading,
    error,
    saveMealPlan,
  };
}
