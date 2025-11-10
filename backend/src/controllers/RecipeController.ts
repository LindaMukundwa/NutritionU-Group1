/*import type { Request, Response } from 'express';
//import openai from '../openai.ts'
import fatSecretService from '../services/fatSecretService';
import Recipe from '../models/RecipeModel';

// Route to generate recipes from open ai
 export const generateRecipeFromOpenAI = async (req: Request, res: Response) => {
    const user = req.body;

    if (!user) {
        return res.status(400).json({ message: 'Invalid user data provided' });
    }

    const userRecipePreferences = {
        nutritionInfo: user.nutritionInfo || {},
        medicalRestrictions: user.medicalRestrictions || {},
        lifestyleDiets: user.lifestyleDiets || {},
        budget: user.budget || { minimum: 0, maximum: 0 },
        units: user.units || "metric"
    }

    const recipeStructure = {
        title: "", // Recipe title
        description: "", // Short description of the recipe
        imageUrl: "", // URL for the recipe image
        cuisine: "", // Type of cuisine (e.g., "Italian", "Mexican")
        mealType: "", // Type of meal (e.g., "Breakfast", "Lunch")
        difficulty: "", // Difficulty level (e.g., "Easy", "Medium", "Hard")
        prepTime: 0, // Preparation time in minutes
        cookTime: 0, // Cooking time in minutes
        totalTime: 0, // Total time in minutes
        servings: 0, // Number of servings
        ingredients: [
            {
                name: "", // Name of the ingredient
                amount: 0, // Quantity of the ingredient
                unit: "", // Unit of measurement (e.g., "grams", "cups")
                category: "", // Category of the ingredient (e.g., "protein", "vegetable")
                nutritionInfo: {
                    calories: 0, // Calories per serving
                    protein: 0, // Protein content in grams
                    carbs: 0, // Carbohydrate content in grams
                    fat: 0, // Fat content in grams
                    fiber: 0, // Fiber content in grams
                    sugar: 0, // Sugar content in grams
                    sodium: 0, // Sodium content in milligrams
                },
            },
        ],
        instructions: [
            {
                stepNumber: 0, // Step number in the recipe
                instruction: "", // Instruction text
                equipment: [""], // List of equipment needed for the step
            },
        ],
        nutritionInfo: {
            calories: 0, // Total calories in the recipe
            protein: 0, // Total protein in grams
            carbs: 0, // Total carbohydrates in grams
            fat: 0, // Total fat in grams
            fiber: 0, // Total fiber in grams
            sugar: 0, // Total sugar in grams
            sodium: 0, // Total sodium in milligrams
        },
        estimatedCostPerServing: 0, // Estimated cost per serving in dollars
        dietaryTags: [""], // Array of dietary tags (e.g., "vegan", "gluten-free")
        source: "", // Source of the recipe (e.g., "openai_generated", "user_created")
        openaiPrompt: "", // The OpenAI prompt used to generate the recipe (if applicable)
        createdBy: "", // ID or name of the user who created the recipe
        nutritionPerServing: {
            calories: 0, // Calories per serving
            protein: 0, // Protein per serving in grams
            carbs: 0, // Carbohydrates per serving in grams
            fat: 0, // Fat per serving in grams
            fiber: 0, // Fiber per serving in grams
            sugar: 0, // Sugar per serving in grams
            sodium: 0, // Sodium per serving in milligrams
        },
        createdAt: new Date(), // Date when the recipe was created
        updatedAt: new Date(), // Date when the recipe was last updated
    }

    const recipePrompt = `Generate a recipe based on the following user preferences: ${JSON.stringify(
        userRecipePreferences
    )}. The recipe should match this JSON structure ${JSON.stringify(recipeStructure)}, including nutrition information, nutrition per serving, ingredients, instructions, and all other fields`;


    try {
        const recipeResponse = openai.responses.create({
            model: "gpt-5-nano",
            input: recipePrompt,
            store: true,
        });
        recipeResponse.then((result) => {
            const generatedRecipe = JSON.parse(result.output_text);
            console.log(generatedRecipe);
            res.status(201).json({ message: 'Recipe generated successfully', recipe: generatedRecipe });
        });
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ message: 'Failed to generate recipe', error });
    }
} */
import type { Request, Response } from 'express';
import fatSecretService from '../services/fatSecretService.ts';
import Recipe from '../models/RecipeModel.ts';

/**
 * Search recipes from FatSecret API
 */
export const searchRecipes = async (req: Request, res: Response) => {
  try {
    const { query, maxResults = 1 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter is required' 
      });
    }

    const recipes = await fatSecretService.searchRecipes(
      query, 
      parseInt(maxResults as string)
    );

    // Convert FatSecret recipes to our format
    const convertedRecipes: any[] = [];
    for (const r of recipes) {
      try {
        console.log(r);
        const converted = fatSecretService.convertToRecipeModel(r);
        if (converted) convertedRecipes.push(converted);
      } catch (convErr) {
        console.warn('Failed to convert a recipe item, skipping it:', convErr);
        // continue with next recipe
      }
    }

    res.json({
      success: true,
      count: convertedRecipes.length,
      recipes: convertedRecipes
    });
  } catch (error) {
    console.error('Recipe search error:', error);
    res.status(500).json({ 
      error: 'Failed to search recipes' 
    });
  }
};

/**
 * Get detailed recipe from FatSecret
 */
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if it's a FatSecret ID (starts with fatsecret_)
    if (id.startsWith('fatsecret_')) {
      const fatSecretId = id.replace('fatsecret_', '');
      const recipe = await fatSecretService.getRecipe(fatSecretId);

      if (!recipe) {
        return res.status(404).json({ 
          error: 'Recipe not found' 
        });
      }

      const convertedRecipe = fatSecretService.convertToRecipeModel(recipe);
      return res.json({
        success: true,
        recipe: convertedRecipe
      });
    }

    // Otherwise, check our database
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found' 
      });
    }

    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to get recipe' 
    });
  }
};

/**
 * Search foods/ingredients from FatSecret
 */
export const searchFoods = async (req: Request, res: Response) => {
  try {
    const { query, maxResults = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter is required' 
      });
    }

    const foods = await fatSecretService.searchFoods(
      query, 
      parseInt(maxResults as string)
    );

    res.json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ 
      error: 'Failed to search foods' 
    });
  }
};

/**
 * Get detailed food/ingredient nutrition info
 */
export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const food = await fatSecretService.getFood(id);

    if (!food) {
      return res.status(404).json({ 
        error: 'Food not found' 
      });
    }

    res.json({
      success: true,
      food
    });
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ 
      error: 'Failed to get food details' 
    });
  }
};

// Keep your existing OpenAI controller
export const generateRecipeFromOpenAI = async (_req: Request, res: Response) => {
  // Your existing OpenAI implementation
  res.json({ message: 'OpenAI recipe generation - to be implemented' });
};