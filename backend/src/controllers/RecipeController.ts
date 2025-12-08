import type { Request, Response } from 'express';
import fatSecretService from '../services/fatSecretService.ts';
import Recipe from '../models/RecipeModel.ts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new recipe in the database
 */
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      imageUrl,
      mealType,
      totalTime,
      estimatedCostPerServing,
      nutritionInfo,
      ingredients,
      instructions,
      dietaryTags = [],
      externalId,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check if externalId already exists (prevent duplicates from FatSecret)
    if (externalId) {
      const existing = await prisma.recipe.findUnique({
        where: { externalId },
      });
      
      if (existing) {
        console.log('[createRecipe] Recipe with externalId already exists:', externalId);
        return res.json({
          success: true,
          id: existing.id,
          recipe: existing,
        });
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        imageUrl,
        mealType,
        totalTime,
        estimatedCostPerServing,
        nutritionInfo: nutritionInfo || {},
        ingredients: ingredients || [],
        instructions: instructions || [],
        dietaryTags,
        externalId,
      },
    });

    console.log('[createRecipe] ✅ Recipe created with ID:', recipe.id);

    res.status(201).json({
      success: true,
      id: recipe.id,
      recipe,
    });
  } catch (error) {
    console.error('[createRecipe] Error:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
};

/**
 * Update an existing recipe in the database
 * PUT /api/recipes/:id
 */
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      mealType,
      totalTime,
      estimatedCostPerServing,
      nutritionInfo,
      ingredients,
      instructions,
      dietaryTags,
    } = req.body;

    // Validate recipe ID
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Update recipe with provided fields (only update fields that are provided)
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(mealType && { mealType }),
        ...(totalTime !== undefined && { totalTime }),
        ...(estimatedCostPerServing !== undefined && { estimatedCostPerServing }),
        ...(nutritionInfo && { nutritionInfo }),
        ...(ingredients && { ingredients }),
        ...(instructions && { instructions }),
        ...(dietaryTags && { dietaryTags }),
        updatedAt: new Date(),
      },
    });

    console.log('[updateRecipe] ✅ Recipe updated with ID:', updatedRecipe.id);

    res.status(200).json({
      success: true,
      id: updatedRecipe.id,
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error('[updateRecipe] Error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
};

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