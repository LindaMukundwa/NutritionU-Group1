import axios from 'axios';
import type { NutritionGoals } from '../../../shared/types/user.ts';

interface FatSecretConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiUrl: string;
}

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  servings: {
    serving: Array<{
      serving_id: string;
      serving_description: string;
      serving_url: string;
      metric_serving_amount?: string;
      metric_serving_unit?: string;
      calories: string;
      carbohydrate: string;
      protein: string;
      fat: string;
      fiber?: string;
      sugar?: string;
      sodium?: string;
    }>;
  };
}

interface FatSecretRecipe {
  recipe_id: string;
  recipe_name: string;
  recipe_description: string;
  recipe_url: string;
  recipe_image?: string;
  cooking_time_min?: string;
  number_of_servings: string;
  ingredients: {
    ingredient: Array<{
      food_id: string;
      food_name: string;
      serving_id: string;
      number_of_units: string;
      measurement_description: string;
    }>;
  };
  directions: {
    direction: Array<{
      direction_number: string;
      direction_description: string;
    }>;
  };
  recipe_nutrition?: {
    calories: string;
    carbohydrate: string;
    protein: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  };
}

function userPreferences(): NutritionGoals {
  const userPreferences: NutritionGoals = {
    "calories": 600,
    "protein": 120,
    "carbs": 250,
    "fats": 100,
    "goals": "Eat Healthier",
    "description": "User nutrition and lifestyle goals"
  }
  return userPreferences
}

const FatSecretService = new class FatSecretService {
  private config: FatSecretConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      clientId: process.env.FATSECRET_CLIENT_ID || '',
      clientSecret: process.env.FATSECRET_CLIENT_SECRET || '',
      authUrl: 'https://oauth.fatsecret.com/connect/token',
      apiUrl: 'https://platform.fatsecret.com/rest/server.api'
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      console.error('❌ FatSecret API credentials not found in environment variables');
    }
  }

  /**
   * Get OAuth 2.0 access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await axios.post<AccessTokenResponse>(
        this.config.authUrl,
        'grant_type=client_credentials&scope=basic',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('FatSecret authentication error:', error);
      throw new Error('Failed to authenticate with FatSecret API');
    }
  }

  /**
   * Make authenticated request to FatSecret API
   */
  private async makeRequest(method: string, params: Record<string, any>): Promise<any> {
    const token = await this.getAccessToken();

    const requestParams = new URLSearchParams({
      method,
      format: 'json',
      ...params
    });

    try {
      const response = await axios.post(
        this.config.apiUrl,
        requestParams.toString(),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`FatSecret API error (${method}):`, error.response?.data || error.message);
      throw new Error(`FatSecret API request failed: ${method}`);
    }
  }

  /**
   * Search for recipes
   */
  async searchRecipes(query: string, maxResults: number = 20): Promise<FatSecretRecipe[]> {
    // If credentials are missing, short-circuit and return an empty array so dev frontend doesn't get a 500
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('FatSecret credentials missing - searchRecipes will return empty results in dev');
      return [];
    }

    try {
      const response = await this.makeRequest('recipes.search.v3', {
        search_expression: query,
        max_results: maxResults,
        // TODO: Figure out why this isn't populating
        calories_from: userPreferences().calories
      });

      if (!response.recipes || !response.recipes.recipe) {
        return [];
      }

      // Ensure we return an array even if single result
      const recipes = Array.isArray(response.recipes.recipe)
        ? response.recipes.recipe
        : [response.recipes.recipe];

      return recipes;
    } catch (error) {
      console.error('Recipe search error:', error);
      return [];
    }
  }

  /**
   * Get detailed recipe information
   */
  async getRecipe(recipeId: string): Promise<FatSecretRecipe | null> {
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('FatSecret credentials missing - getRecipe will return null in dev');
      return null;
    }

    try {
      const response = await this.makeRequest('recipe.get.v2', {
        recipe_id: recipeId
      });

      return response.recipe || null;
    } catch (error) {
      console.error('Get recipe error:', error);
      return null;
    }
  }

  /**
   * Search for foods/ingredients
   */
  async searchFoods(query: string, maxResults: number = 20): Promise<any[]> {
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('FatSecret credentials missing - searchFoods will return empty results in dev');
      return [];
    }

    try {
      const response = await this.makeRequest('foods.search', {
        search_expression: query,
        max_results: maxResults
      });

      if (!response.foods || !response.foods.food) {
        return [];
      }

      const foods = Array.isArray(response.foods.food)
        ? response.foods.food
        : [response.foods.food];

      return foods;
    } catch (error) {
      console.error('Food search error:', error);
      return [];
    }
  }

  /**
   * Get detailed food information
   */
  async getFood(foodId: string): Promise<FatSecretFood | null> {
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('FatSecret credentials missing - getFood will return null in dev');
      return null;
    }

    try {
      const response = await this.makeRequest('food.get.v4', {
        food_id: foodId
      });

      return response.food || null;
    } catch (error) {
      console.error('Get food error:', error);
      return null;
    }
  }

  /**
   * Convert FatSecret recipe to our Recipe model format
   */
  convertToRecipeModel(fatSecretRecipe: FatSecretRecipe): any {
    // Defensive parsing: guard against missing nested fields and unexpected shapes
    const ingredientsArray = fatSecretRecipe.ingredients && fatSecretRecipe.ingredients.ingredient
      ? (Array.isArray(fatSecretRecipe.ingredients.ingredient)
        ? fatSecretRecipe.ingredients.ingredient
        : [fatSecretRecipe.ingredients.ingredient])
      : [];

    const directionsArray = fatSecretRecipe.directions && fatSecretRecipe.directions.direction
      ? (Array.isArray(fatSecretRecipe.directions.direction)
        ? fatSecretRecipe.directions.direction
        : [fatSecretRecipe.directions.direction])
      : [];

    const safeParseInt = (v: any, fallback = 0) => {
      const n = parseInt(String(v || ''));
      return Number.isNaN(n) ? fallback : n;
    };

    const safeParseFloat = (v: any, fallback = 0) => {
      const n = parseFloat(String(v || ''));
      return Number.isNaN(n) ? fallback : n;
    };

    const servings = safeParseInt(fatSecretRecipe.number_of_servings, 1);
    const cookingTime = safeParseInt(fatSecretRecipe.cooking_time_min, 30);

    return {
      _id: `fatsecret_${fatSecretRecipe.recipe_id}`,
      title: fatSecretRecipe.recipe_name || 'Untitled Recipe',
      description: fatSecretRecipe.recipe_description || undefined,
      imageUrl: fatSecretRecipe.recipe_image || undefined,
      cuisine: 'various', // FatSecret doesn't provide cuisine type
      mealType: 'dinner', // Default can be inferred or set by user
      difficulty: 'beginner', // Default
      prepTime: 0, // FatSecret doesn't provide prep time separately
      cookTime: cookingTime,
      totalTime: cookingTime,
      servings,
      ingredients: ingredientsArray.map((ing: any) => ({
        openFoodFactsId: ing.food_id || undefined,
        name: ing.food_name || 'Ingredient',
        amount: safeParseFloat(ing.number_of_units, 1),
        unit: {
          type: 'imperial',
          value: this.normalizeUnit(ing.measurement_description || '')
        },
        category: 'other', // Would need to categorize
        nutritionInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      })),
      instructions: directionsArray.map((dir: any) => ({
        stepNumber: safeParseInt(dir.direction_number, 0),
        instruction: dir.direction_description || '',
        equipment: []
      })),
      nutritionInfo: fatSecretRecipe.recipe_nutrition ? {
        calories: safeParseFloat(fatSecretRecipe.recipe_nutrition.calories, 0),
        protein: safeParseFloat(fatSecretRecipe.recipe_nutrition.protein, 0),
        carbs: safeParseFloat(fatSecretRecipe.recipe_nutrition.carbohydrate, 0),
        fat: safeParseFloat(fatSecretRecipe.recipe_nutrition.fat, 0),
        fiber: safeParseFloat(fatSecretRecipe.recipe_nutrition.fiber, 0),
        sugar: safeParseFloat(fatSecretRecipe.recipe_nutrition.sugar, 0),
        sodium: safeParseFloat(fatSecretRecipe.recipe_nutrition.sodium, 0)
      } : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      estimatedCostPerServing: 5, // Default estimate
      dietaryTags: [],
      source: 'fatsecret' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Normalize measurement units to our standard units
   */
  private normalizeUnit(measurement: string): string {
    const unitMap: Record<string, string> = {
      'cup': 'cups',
      'cups': 'cups',
      'tablespoon': 'tbsp',
      'tbsp': 'tbsp',
      'teaspoon': 'tsp',
      'tsp': 'tsp',
      'ounce': 'ounces',
      'oz': 'ounces',
      'pound': 'pounds',
      'lb': 'pounds',
      'gram': 'grams',
      'g': 'grams',
      'kilogram': 'kg',
      'kg': 'kg',
      'milliliter': 'ml',
      'ml': 'ml',
      'liter': 'liters',
      'l': 'liters'
    };

    const normalized = measurement.toLowerCase().trim();
    for (const [key, value] of Object.entries(unitMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    return 'pieces'; // Default fallback
  }
};

export default FatSecretService;