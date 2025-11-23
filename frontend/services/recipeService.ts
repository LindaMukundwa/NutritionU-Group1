import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cuisine: string;
  mealType: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  estimatedCostPerServing: number;
  dietaryTags: string[];
}

class RecipeService {
  /**
   * Search recipes from FatSecret
   */
  async searchRecipes(query: string, maxResults: number = 20): Promise<Recipe[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/search`, {
        params: { query, maxResults }
      });
      return response.data.recipes;
    } catch (error) {
      console.error('Recipe search error:', error);
      throw new Error('Failed to search recipes');
    }
  }

  /**
   * Get recipe by their ID
   */
  async getRecipe(id: string): Promise<Recipe> {
    try {
  const response = await axios.get(`${API_BASE_URL}/api/recipes/${id}`);
      return response.data.recipe;
    } catch (error) {
      console.error('Get recipe error:', error);
      throw new Error('Failed to get recipe');
    }
  }

  /**
   * Search foods/ingredients
   */
  async searchFoods(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/foods/search`, {
        params: { query, maxResults }
      });
      return response.data.foods;
    } catch (error) {
      console.error('Food search error:', error);
      throw new Error('Failed to search foods');
    }
  }
}

export const recipeService = new RecipeService();