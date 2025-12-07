import type { Request, Response } from 'express';
import User from '../models/UserModel.ts';
import prisma from '../lib/prisma.ts';
import Recipe from '../models/RecipeModel.ts';

// Create a new user - updated to work with new schema (no Profile model)
export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body || {};

        // Use Firebase UID if available
        const firebaseUid = userData.firebaseUid?.trim() || undefined;

        // Create user with all fields directly on User model
        const newUser = await prisma.user.create({
            data: {
                firebaseUid,
                email: userData.email,
                displayName: userData.displayName || (userData.email ? String(userData.email).split('@')[0] : 'User'),
                photoURL: userData.photoURL,
                age: userData.age,
                height: userData.height,
                weight: userData.weight,
                bmi: userData.bmi,
                units: userData.units || 'metric',
                activityLevel: userData.activityLevel || 'moderately_active',
                onboardingCompleted: false,
                medicalRestrictions: userData.medicalRestrictions || {
                    gluten: false,
                    dairy: false,
                    nuts: false,
                    peanuts: false,
                    soy: false,
                    eggs: false,
                    shellfish: false,
                    wheat: false,
                    sesame: false,
                    corn: false,
                    sulfites: false,
                    fodmap: false,
                    histamine: false,
                    lowSodium: false,
                    lowSugar: false,
                    none: true,
                    description: 'Medical and health dietary restrictions'
                },
                nutritionGoals: userData.nutritionGoals || {
                    goals: 'None',
                    calories: undefined,
                    protein: undefined,
                    carbs: undefined,
                    fats: undefined,
                    description: 'User nutrition and lifestyle goals'
                },
                lifestyleDiets: userData.lifestyleDiets || {
                    vegetarian: false,
                    pescetarian: false,
                    flexitarian: false,
                    mediterranean: false,
                    paleo: false,
                    keto: false,
                    whole30: false,
                    none: true,
                    description: 'Lifestyle and ethical dietary choices'
                },
                culturalDiets: userData.culturalDiets || {
                    halal: false,
                    kosher: false,
                    jain: false,
                    hindu: false,
                    buddhist: false,
                    none: true,
                    description: 'Cultural and religious dietary preferences'
                },
                budget: userData.budget || {
                    minimum: undefined,
                    maximum: undefined,
                    step: 25,
                    default: 100,
                    description: 'Weekly food budget in dollars'
                }
            },
            include: {
                favorites: {
                    include: {
                        recipe: true
                    }
                },
                mealPlans: true
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get an existing user - supports both Prisma ID and Firebase UID
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Try to find by Prisma ID first, then by Firebase UID
        const userData = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            },
            include: {
                favorites: {
                    include: {
                        recipe: true
                    }
                },
                mealPlans: true
            }
        });

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(userData);
    } catch (error) {
        console.log('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete an existing user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedUser = await prisma.user.delete({
            where: {
                id: parseInt(id, 10)
            }
        });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Add favorite recipe
export const addFavoriteRecipe = async (req: Request, res: Response) => {
    try {
        const { userId, recipeId } = req.params;

        const favorite = await prisma.favorite.create({
            data: {
                userId: parseInt(userId, 10),
                recipeId: parseInt(recipeId, 10)
            },
            include: {
                recipe: true
            }
        });

        res.status(200).json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove favorite recipe
export const removeFavoriteRecipe = async (req: Request, res: Response) => {
    try {
        const { userId, recipeId } = req.params;

        await prisma.favorite.delete({
            where: {
                userId_recipeId: {
                    userId: parseInt(userId, 10),
                    recipeId: parseInt(recipeId, 10)
                }
            }
        });

        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's favorite recipes
export const getUserFavorites = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            },
            include: {
                favorites: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.favorites);
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user budget
export const patchUserBudget = async (req: Request, res: Response) => {

    /*
    JSON Format
    {
        "budget": {
            "minimum": 50,
            "maximum": 200,
            "step": 10,
            "default": 75,
            "description": "Updated weekly food budget in dollars"

        }
    }
    
    */
    try {
        const { id } = req.params;
        const { budget } = req.body;

        if (!budget) {
            return res.status(400).json({ message: 'Budget is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { budget },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user budget:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    res.status(201).json(req);
}

// Update lifestyle diets
export const patchUserLifestyleDiets = async (req: Request, res: Response) => {
    /* 
    JSON Format
        { 
            "lifestyleDiets": {
                "vegetarian": true,
                "pescetarian": false,
                "flexitarian": false,
                "mediterranean": false,
                "paleo": false,
                "keto": false,
                "whole30": false,
                "none": false,
                "description": "Lifestyle and ethical dietary choices"
            }
        }
    */

    try {
        const { id } = req.params;
        const { lifestyleDiets } = req.body;

        if (!lifestyleDiets) {
            return res.status(400).json({ message: 'Lifestyle preferences required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { lifestyleDiets },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating lifestyle diets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update culutral diets
export const patchUserCulturalDiets = async (req: Request, res: Response) => {

    /*
    JSON Format
        {
            "culturalDiets": {
                "halal": true,
                "kosher": false,
                "jain": false,
                "hindu": true,
                "buddhist": false,
                "none": false,
                "description": "Updated cultural and religious dietary preferences"
            }
        }
    */

    try {
        const { id } = req.params;
        const { culturalDiets } = req.body;

        if (!culturalDiets) {
            return res.status(400).json({ message: 'Cultural diets are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { culturalDiets },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating cultural diets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Update medical restrictions
export const patchUserMedicalRestrictions = async (req: Request, res: Response) => {
    /*
    JSON Format
    {
        "medicalRestrictions": {
            "gluten": true,
            "dairy": false,
            "nuts": false,
            "peanuts": true,
            "soy": false,
            "eggs": false,
            "shellfish": true,
            "wheat": false,
            "sesame": false,
            "corn": true,
            "sulfites": false,
            "fodmap": false,
            "histamine": true,
            "lowSodium": false,
            "lowSugar": true,
            "none": false,
            "description": "Medical and health dietary restrictions"
        }
    }
    */

    try {
        const { id } = req.params;
        const { medicalRestrictions } = req.body;

        if (!medicalRestrictions) {
            return res.status(400).json({ message: 'Medical restrictions are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { medicalRestrictions },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating medical restrictions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Update goals
export const patchUserGoals = async (req: Request, res: Response) => {
    /*
    JSON Format
    {
        "nutrition-goals": {
            "goals": "Eat Healthier",
            "calories": 2000,
            "protein": 150,
            "carbs": 250,
            "fats": 70,
            "description": "User nutrition and lifestyle goals"
        }
    }
    */

    try {
        const { id } = req.params;
        const { nutritionGoals } = req.body;

        if (!nutritionGoals) {
            return res.status(400).json({ message: 'Goals are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { nutritionGoals },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user goals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Patch user's onboarding/profile data - supports both Prisma ID and Firebase UID
export const patchUserProfile = async (req: Request, res: Response) => {

    try {
        const { id } = req.params;
        const profile = req.body;

        if (!profile || typeof profile !== 'object') {
            return res.status(400).json({ message: 'Profile data is required' });
        }

        // Try to find existing user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            }
        });

        if (user) {
            // Update existing user directly (no profile table)
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    displayName: profile.displayName,
                    photoURL: profile.photoURL,
                    age: profile.age,
                    gender: profile.gender,
                    height: profile.height,
                    weight: profile.weight,
                    bmi: profile.bmi,
                    units: profile.units || user.units,
                    goals: profile.goals || [],
                    cookingLevel: profile.cookingLevel,
                    activityLevel: profile.activityLevel || user.activityLevel,
                    onboardingCompleted: true,
                    medicalRestrictions: profile.medicalRestrictions || [],
                    nutritionGoals: profile.macros || profile.nutritionGoals || {},
                    lifestyleDiets: profile.lifestyleDiets || [],
                    culturalDiets: profile.culturalDiets || [],
                    budget: typeof profile.budget === 'number' 
                        ? {
                            value: profile.budget,
                            default: 100,
                            description: 'Weekly food budget in dollars'
                          }
                        : profile.budget || { value: 100, default: 100, description: 'Weekly food budget in dollars' }
                }
            });

            console.log('[patchUserProfile] ✅ User profile updated:', updatedUser);

            return res.status(200).json(updatedUser);
        }

        // Create new user if not found
        const newUser = await prisma.user.create({
            data: {
                firebaseUid: id,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
                age: profile.age,
                gender: profile.gender,
                height: profile.height,
                weight: profile.weight,
                bmi: profile.bmi,
                units: profile.units || 'metric',
                activityLevel: profile.activityLevel || 'moderately_active',
                onboardingCompleted: true,
                medicalRestrictions: profile.medicalRestrictions || [],
                nutritionGoals: profile.macros || profile.nutritionGoals || {},
                lifestyleDiets: profile.lifestyleDiets || [],
                culturalDiets: profile.culturalDiets || [],
                goals: profile.goals || [],
                cookingLevel: profile.cookingLevel,
                budget: typeof profile.budget === 'number'
                    ? {
                        value: profile.budget,
                        default: 100,
                        description: 'Weekly food budget in dollars'
                      }
                    : profile.budget || { value: 100, default: 100, description: 'Weekly food budget in dollars' }
            }
        });

        return res.status(200).json(newUser);
    } catch (err) {
        console.error('Error patching user profile:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Post a recipe to user recipes array and add recipe to database
export const postUserRecipe = async (req: Request, res: Response) => {
    /*
    JSON Format
    {
        "recipe": {
            "_id": "R12345678",
            "title": "Spaghetti Bolognese",
            "description": "A classic Italian pasta dish with a rich meat sauce.",
            "imageUrl": "https://example.com/spaghetti.jpg",
            "cuisine": "Italian",
            "mealType": "dinner",
            "difficulty": "beginner",
            "prepTime": 15,
            "cookTime": 45,
            "totalTime": 60,
            "servings": 4,
            "ingredients": [
                {
                    "openFoodFactsId": "12345",
                    "name": "Ground Beef",
                    "amount": 500,
                    "unit": {
                        "type": "metric",
                        "value": "grams"
                    },
                    "category": "protein",
                    "nutritionInfo": {
                        "calories": 250,
                        "protein": 20,
                        "carbs": 0,
                        "fat": 15,
                        "fiber": 0,
                        "sugar": 0,
                        "sodium": 70
                    }
                },
                {
                    "openFoodFactsId": "67890",
                    "name": "Spaghetti",
                    "amount": 400,
                    "unit": {
                        "type": "metric",
                        "value": "grams"
                    },
                    "category": "grain",
                    "nutritionInfo": {
                        "calories": 350,
                        "protein": 12,
                        "carbs": 70,
                        "fat": 1,
                        "fiber": 3,
                        "sugar": 2,
                        "sodium": 5
                    }
                }
            ],
            "instructions": [
                {
                    "stepNumber": 1,
                    "instruction": "Boil water and cook spaghetti according to package instructions.",
                    "equipment": ["pot", "stove"]
                },
                {
                    "stepNumber": 2,
                    "instruction": "In a pan, cook ground beef until browned.",
                    "equipment": ["pan", "stove"]
                }
            ],
            "nutritionInfo": {
                "calories": 600,
                "protein": 32,
                "carbs": 70,
                "fat": 16,
                "fiber": 3,
                "sugar": 2,
                "sodium": 75
            },
            "estimatedCostPerServing": 5,
            "dietaryTags": ["high-protein", "low-sugar"],
            "source": "user_created",
            "createdBy": "user123",
            "nutritionPerServing": {
                "calories": 150,
                "protein": 8,
                "carbs": 17.5,
                "fat": 4,
                "fiber": 0.75,
                "sugar": 0.5,
                "sodium": 18.75
            }
        }
    }
    */

    try {
        const { id } = req.params;
        const { recipe } = req.body;

        // Check if recipe is in body
        if (!recipe) {
            return res.status(400).json({ message: 'Recipe is required' });
        }

        // Find the current user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensures user has an array for recipes
        if (!user.recipe) {
            user.recipe = [];
        }

        // Check if the recipe already exists in the user's recipe array
        if (user.recipe.includes(recipe._id)) {
            return res.status(400).json({ message: 'Recipe already exists in user\'s recipe list' });
        }

        // Check if the recipe already exists in the Recipe collection
        const existingRecipe = await Recipe.findById(recipe._id);
        if (existingRecipe) {
            return res.status(400).json({ message: 'Recipe already exists in the database' });
        }

        // Save recipe id to user
        user.recipe.push(recipe._id);
        await user.save();

        // Create a new recipe object
        const newRecipe = new Recipe(recipe);
        await newRecipe.save();

        res.status(200).json(user);
    } catch (error) {
        console.error('Error adding recipe to user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get all user recipes
export const getUserRecipes = async (req: Request, res: Response) => {
    /* 
    JSON Returned:
        [
            {
                "nutritionInfo": {
                    "calories": 600,
                    "protein": 32,
                    "carbs": 70,
                    "fat": 16,
                    "fiber": 3,
                    "sugar": 2,
                    "sodium": 75
                },
                "nutritionPerServing": {
                    "calories": 150,
                    "protein": 8,
                    "carbs": 17.5,
                    "fat": 4,
                    "fiber": 0.75,
                    "sugar": 0.5,
                    "sodium": 18.75
                },
                "_id": "R12345678",
                "title": "Spaghetti Marinara",
                "description": "A classic Italian pasta dish with a rich meat sauce.",
                "imageUrl": "https://example.com/spaghetti.jpg",
                "cuisine": "Italian",
                "mealType": "dinner",
                "difficulty": "beginner",
                "prepTime": 15,
                "cookTime": 45,
                "totalTime": 60,
                "servings": 4,
                "ingredients": [
                    {
                        "unit": {
                            "type": "metric",
                            "value": "grams"
                        },
                        "nutritionInfo": {
                            "calories": 250,
                            "protein": 20,
                            "carbs": 0,
                            "fat": 15,
                            "fiber": 0,
                            "sugar": 0,
                            "sodium": 70
                        },
                        "openFoodFactsId": "12345",
                        "name": "Ground Beef",
                        "amount": 500,
                        "category": "protein",
                        "_id": "68f2ccb8b67ac4cfb48483d9"
                    },
                    {
                        "unit": {
                            "type": "metric",
                            "value": "grams"
                        },
                        "nutritionInfo": {
                            "calories": 350,
                            "protein": 12,
                            "carbs": 70,
                            "fat": 1,
                            "fiber": 3,
                            "sugar": 2,
                            "sodium": 5
                        },
                        "openFoodFactsId": "67890",
                        "name": "Spaghetti",
                        "amount": 400,
                        "category": "grain",
                        "_id": "68f2ccb8b67ac4cfb48483da"
                    }
                ],
                "instructions": [
                    {
                        "stepNumber": 1,
                        "instruction": "Boil water and cook spaghetti according to package instructions.",
                        "equipment": [
                            "pot",
                            "stove"
                        ],
                        "_id": "68f2ccb8b67ac4cfb48483db"
                    },
                    {
                        "stepNumber": 2,
                        "instruction": "In a pan, cook ground beef until browned.",
                        "equipment": [
                            "pan",
                            "stove"
                        ],
                        "_id": "68f2ccb8b67ac4cfb48483dc"
                    }
                ],
                "estimatedCostPerServing": 5,
                "dietaryTags": [
                    "high-protein",
                    "low-sugar"
                ],
                "source": "user_created",
                "createdBy": "user123",
                "createdAt": "2025-10-17T23:09:44.182Z",
                "updatedAt": "2025-10-17T23:09:44.182Z",
                "__v": 0
            }
        ]
    */
    try {
        const { id } = req.params;

        // Find user in database
        const user = await User.findById(id);

        // Check user existence
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return empty array if user recipe is empty
        if (!user.recipe || user.recipe.length === 0) {
            return res.status(200).json([]);
        }

        // Get the objects of recipes owned by a user
        const recipes = await Recipe.find({ _id: { $in: user.recipe } });

        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching user recipes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a user recipe
export const deleteUserRecipe = async (req: Request, res: Response) => {
    try {
        const { id, recipeId } = req.params;

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the recipe exists in the user's recipe array
        if (!user.recipe || !user.recipe.includes(recipeId)) {
            return res.status(404).json({ message: 'Recipe not found in user\'s recipe list' });
        }

        // Remove the recipe from the user's recipe array
        user.recipe = user.recipe.filter((rId) => rId !== recipeId);
        await user.save();

        // Delete the recipe from the Recipe collection
        const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found in the database' });
        }

        res.status(200).json({ message: 'Recipe deleted successfully from user and database' });
    } catch (error) {
        console.error('Error deleting recipe from user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

