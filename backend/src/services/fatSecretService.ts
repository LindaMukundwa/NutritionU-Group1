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
  recipe_ingredients: {
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
  private costCache: Map<string, number> = new Map();

  constructor() {
    this.config = {
      clientId: process.env.FATSECRET_CLIENT_ID || '4c1be385d956400192a18f193fdd6d02',
      clientSecret: process.env.FATSECRET_CLIENT_SECRET || '21930cf5d296421db9761d92b7d2b494',
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


  private estimateCostAsync(recipe: any, ingredients: any[], servings: number): Promise<void> {
    // Use the correct port - 3001 based on your earlier logs

    const apiUrl = `${process.env.VITE_API_BASE || 'http://localhost:3001'}/api/chatbot/estimate-recipe-cost`;

    console.log(`[FATSECRET] Attempting cost estimation for ${recipe.title}`);
    console.log(`[FATSECRET] API URL: ${apiUrl}`);
    console.log(`[FATSECRET] Ingredients count: ${ingredients.length}`);

    // Validate ingredients before sending
    if (!ingredients || ingredients.length === 0) {
      console.warn(`[FATSECRET] ⚠ No ingredients to estimate for ${recipe.title}`);
      return Promise.resolve();
    }

    const ingredientsPayload = ingredients.map(ing => ({
      name: ing.name || 'Unknown',
      amount: ing.amount || 1,
      unit: ing.unit?.value || ing.unit || 'unit'
    }));

    return axios.post(
      apiUrl,
      {
        ingredients: ingredientsPayload,
        servings
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(response => {
        if (response.data && response.data.costPerServing) {
          recipe.estimatedCostPerServing = response.data.costPerServing;
          console.log(`[FATSECRET] ✓ Cost estimation updated: $${recipe.estimatedCostPerServing} per serving for ${recipe.title}`);
        } else {
          console.warn(`[FATSECRET] ⚠ Unexpected response format for ${recipe.title}:`, response.data);
        }
      })
      .catch(error => {
        if (error.response) {
          console.error(`[FATSECRET] ✗ Cost estimation API error for ${recipe.title}:`, {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: apiUrl
          });
        } else if (error.request) {
          console.error(`[FATSECRET] ✗ No response from cost estimation API for ${recipe.title}:`, {
            url: apiUrl,
            message: error.message,
            code: error.code
          });
        } else {
          console.error(`[FATSECRET] ✗ Cost estimation request setup failed for ${recipe.title}:`, {
            message: error.message,
            stack: error.stack
          });
        }
      });
  }

  convertToRecipeModel(fatSecretRecipe: FatSecretRecipe): any {

    console.log("Recipe", fatSecretRecipe);

    // Defensive parsing: guard against missing nested fields and unexpected shapes
    const ingredientsArray = fatSecretRecipe.recipe_ingredients && fatSecretRecipe.recipe_ingredients.ingredient
      ? (Array.isArray(fatSecretRecipe.recipe_ingredients.ingredient)
        ? fatSecretRecipe.recipe_ingredients.ingredient
        : [fatSecretRecipe.recipe_ingredients.ingredient])
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

    // Map ingredients for the recipe model
    const ingredients = ingredientsArray.map((ing: any) => ({
      openFoodFactsId: ing.food_id || undefined,
      name: ing.food_name || 'Ingredient',
      amount: safeParseFloat(ing.number_of_units, 1),
      unit: {
        type: 'imperial',
        value: this.normalizeUnit(ing.measurement_description || '')
      },
      category: 'other',
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      }
    }));


    // Fire-and-forget cost estimation (non-blocking)
    const recipe = {
      _id: `fatsecret_${fatSecretRecipe.recipe_id}`,
      title: fatSecretRecipe.recipe_name || 'Untitled Recipe',
      description: fatSecretRecipe.recipe_description || undefined,
      imageUrl: fatSecretRecipe.recipe_image || undefined,
      cuisine: 'various',
      mealType: 'dinner',
      difficulty: 'beginner',
      prepTime: 0,
      cookTime: cookingTime,
      totalTime: cookingTime,
      servings,
      ingredients,
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
      estimatedCostPerServing: 5, // Default, will be updated if API succeeds
      dietaryTags: [],
      source: 'fatsecret' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Attempt cost estimation asynchronously without blocking
    const cacheKey = `${fatSecretRecipe.recipe_id}`;

    // Check cache first
    recipe.estimatedCostPerServing = this.costCache.get(cacheKey) || 5;

    // Update in background and cache result
    this.estimateCostAsync(recipe, ingredients, servings)
      .then(() => {
        this.costCache.set(cacheKey, recipe.estimatedCostPerServing);
      });
    
    return recipe;
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