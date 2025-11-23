/**
 * Service for managing meal plans with backend persistence
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';

export interface MealPlanItem {
  id?: number;
  recipeId: number;
  date: string; // YYYY-MM-DD format
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  recipe?: any; // Recipe object when included
}

export interface MealPlan {
  id?: number;
  userId?: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  items: MealPlanItem[];
  createdAt?: string;
  updatedAt?: string;
}

class MealPlanService {
  /**
   * Create a new meal plan for a user or update if one exists for the week
   */
  async saveMealPlan(
    userId: string,
    startDate: string,
    endDate: string,
    items: Omit<MealPlanItem, 'id'>[]
  ): Promise<MealPlan> {
    console.log('[mealPlanService] saveMealPlan called:', { userId, startDate, endDate, items });
    
    const url = `${API_BASE}/api/users/${userId}/meal-plans`;
    console.log('[mealPlanService] Request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, items }),
    });

    console.log('[mealPlanService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[mealPlanService] ❌ Save failed:', { status: response.status, error: errorText });
      throw new Error('Failed to save meal plan');
    }

    const result = await response.json();
    console.log('[mealPlanService] ✅ Save successful:', result);
    return result;
  }

  /**
   * Get all meal plans for a user
   */
  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/meal-plans`);

    if (!response.ok) {
      throw new Error('Failed to fetch meal plans');
    }

    return response.json();
  }

  /**
   * Get meal plans for a specific date range
   */
  async getMealPlansByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MealPlan[]> {
    const url = `${API_BASE}/api/users/${userId}/meal-plans/range?startDate=${startDate}&endDate=${endDate}`;
    console.log('[mealPlanService] getMealPlansByDateRange called:', { userId, startDate, endDate });
    console.log('[mealPlanService] Request URL:', url);
    
    const response = await fetch(url);

    console.log('[mealPlanService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[mealPlanService] ❌ Load failed:', { status: response.status, error: errorText });
      throw new Error('Failed to fetch meal plans');
    }

    const result = await response.json();
    console.log('[mealPlanService] ✅ Load successful:', result);
    return result;
  }

  /**
   * Get the current week's meal plan
   */
  async getCurrentWeekMealPlan(userId: string): Promise<MealPlan | null> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/meal-plans/current`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch current meal plan');
    }

    return response.json();
  }

  /**
   * Get a specific meal plan by ID
   */
  async getMealPlan(mealPlanId: number): Promise<MealPlan> {
    const response = await fetch(`${API_BASE}/api/meal-plans/${mealPlanId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch meal plan');
    }

    return response.json();
  }

  /**
   * Update an existing meal plan
   */
  async updateMealPlan(
    mealPlanId: number,
    startDate: string,
    endDate: string,
    items: Omit<MealPlanItem, 'id'>[]
  ): Promise<MealPlan> {
    const response = await fetch(`${API_BASE}/api/meal-plans/${mealPlanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, items }),
    });

    if (!response.ok) {
      throw new Error('Failed to update meal plan');
    }

    return response.json();
  }

  /**
   * Delete a meal plan
   */
  async deleteMealPlan(mealPlanId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/meal-plans/${mealPlanId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete meal plan');
    }
  }

  /**
   * Add a single item to a meal plan
   */
  async addMealPlanItem(
    mealPlanId: number,
    item: Omit<MealPlanItem, 'id'>
  ): Promise<MealPlanItem> {
    const response = await fetch(`${API_BASE}/api/meal-plans/${mealPlanId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error('Failed to add meal plan item');
    }

    return response.json();
  }

  /**
   * Remove a single item from a meal plan
   */
  async removeMealPlanItem(itemId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/meal-plans/items/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove meal plan item');
    }
  }
}

export const mealPlanService = new MealPlanService();
