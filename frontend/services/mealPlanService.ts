/**
 * Service for managing meal plans with backend persistence
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';

export interface MealPlanItem {
  id?: number;
  recipeId: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  recipe?: any; // Recipe object when included
}

export interface MealPlan {
  id: number;
  userId: number;
  items: MealPlanItem[];
  createdAt: string;
  updatedAt: string;
}

class MealPlanService {
  /**
   * Create a new meal plan for a user
   */
  async createMealPlan(userId: string, items: Omit<MealPlanItem, 'id'>[]): Promise<MealPlan> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/meal-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to create meal plan');
    }

    return response.json();
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
  async updateMealPlan(mealPlanId: number, items: Omit<MealPlanItem, 'id'>[]): Promise<MealPlan> {
    const response = await fetch(`${API_BASE}/api/meal-plans/${mealPlanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
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
