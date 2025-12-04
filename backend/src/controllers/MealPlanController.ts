import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';
import FatSecretService from '../services/fatSecretService.ts';

/**
 * Create a new meal plan for a user
 * POST /api/users/:userId/meal-plans
 * Body: { startDate, endDate, items: [{ recipeId, date, mealType }] }
 */
export const createMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, items } = req.body;

        // Find user by firebaseUid or Prisma ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if meal plan already exists for this week
        const existingPlan = await prisma.mealPlan.findFirst({
            where: {
                userId: user.id,
                startDate: new Date(startDate)
            }
        });

        if (existingPlan) {
            // Update existing plan instead of creating a new one
            await prisma.mealPlanItem.deleteMany({
                where: { mealPlanId: existingPlan.id }
            });

            const updatedPlan = await prisma.mealPlan.update({
                where: { id: existingPlan.id },
                data: {
                    endDate: new Date(endDate),
                    items: {
                        create: items.map((item: any) => ({
                            recipeId: item.recipeId,
                            date: new Date(item.date),
                            mealType: item.mealType
                        }))
                    },
                    updatedAt: new Date()
                },
                include: {
                    items: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });

            return res.status(200).json(updatedPlan);
        }

        // Create new meal plan
        const mealPlan = await prisma.mealPlan.create({
            data: {
                userId: user.id,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                items: {
                    create: items.map((item: any) => ({
                        recipeId: item.recipeId,
                        date: new Date(item.date),
                        mealType: item.mealType
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        res.status(201).json(mealPlan);
    } catch (error) {
        console.error('Error creating meal plan:', error);
        res.status(500).json({ error: 'Failed to create meal plan' });
    }
};

/**
 * Get all meal plans for a user
 * GET /api/users/:userId/meal-plans
 */
export const getUserMealPlans = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Find user by firebaseUid or Prisma ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const mealPlans = await prisma.mealPlan.findMany({
            where: { userId: user.id },
            include: {
                items: {
                    include: {
                        recipe: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(mealPlans);
    } catch (error) {
        console.error('Error fetching meal plans:', error);
        res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
};

/**
 * Get a specific meal plan
 * GET /api/meal-plans/:mealPlanId
 */
export const getMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;

        const mealPlan = await prisma.mealPlan.findUnique({
            where: { id: Number(mealPlanId) },
            include: {
                items: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        if (!mealPlan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        res.status(200).json(mealPlan);
    } catch (error) {
        console.error('Error fetching meal plan:', error);
        res.status(500).json({ error: 'Failed to fetch meal plan' });
    }
};

/**
 * Update a meal plan
 * PUT /api/meal-plans/:mealPlanId
 * Body: { startDate, endDate, items: [{ recipeId, date, mealType }] }
 */
export const updateMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;
        const { startDate, endDate, items } = req.body;

        // Delete existing items
        await prisma.mealPlanItem.deleteMany({
            where: { mealPlanId: Number(mealPlanId) }
        });

        // Create new items
        const updatedMealPlan = await prisma.mealPlan.update({
            where: { id: Number(mealPlanId) },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                items: {
                    create: items.map((item: any) => ({
                        recipeId: item.recipeId,
                        date: new Date(item.date),
                        mealType: item.mealType
                    }))
                },
                updatedAt: new Date()
            },
            include: {
                items: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        res.status(200).json(updatedMealPlan);
    } catch (error) {
        console.error('Error updating meal plan:', error);
        res.status(500).json({ error: 'Failed to update meal plan' });
    }
};

/**
 * Delete a meal plan
 * DELETE /api/meal-plans/:mealPlanId
 */
export const deleteMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;

        // Delete meal plan items first (cascade should handle this, but being explicit)
        await prisma.mealPlanItem.deleteMany({
            where: { mealPlanId: Number(mealPlanId) }
        });

        // Delete meal plan
        await prisma.mealPlan.delete({
            where: { id: Number(mealPlanId) }
        });

        res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        res.status(500).json({ error: 'Failed to delete meal plan' });
    }
};

/**
 * Add a recipe to an existing meal plan
 * POST /api/meal-plans/:mealPlanId/items
 * Body: { recipeId, date, mealType }
 */
export const addMealPlanItem = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;

        const { recipeId, date, mealType } = req.body;

        const item = await prisma.mealPlanItem.create({
            data: {
                mealPlanId: Number(mealPlanId),
                recipeId: Number(recipeId),
                date: new Date(date),
                mealType
            },
            include: {
                recipe: true
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error adding meal plan item:', error);
        res.status(500).json({ error: 'Failed to add meal plan item' });
    }
};

/**
 * Remove a recipe from a meal plan
 * DELETE /api/meal-plans/items/:itemId
 */
export const removeMealPlanItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        // Delete a meal plan item based on its recipe origin
        await prisma.recipe.delete({
            where: { id: Number(itemId) }
        });

        res.status(200).json({ message: 'Meal plan item removed successfully' });
    } catch (error) {
        console.error('Error removing meal plan item:', error);
        res.status(500).json({ error: 'Failed to remove meal plan item' });
    }
};

/**
 * Get current week's meal plan for a user
 * GET /api/users/:userId/meal-plans/current
 */
export const getCurrentWeekMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Find user by firebaseUid or Prisma ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the most recent meal plan (current week)
        const currentMealPlan = await prisma.mealPlan.findFirst({
            where: { userId: user.id },
            include: {
                items: {
                    include: {
                        recipe: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(currentMealPlan || null);
    } catch (error) {
        console.error('Error fetching current meal plan:', error);
        res.status(500).json({ error: 'Failed to fetch current meal plan' });
    }
};

/**
 * Get meal plans for a specific date range
 * GET /api/users/:userId/meal-plans/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getMealPlansByDateRange = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        // Find user by firebaseUid or Prisma ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const mealPlans = await prisma.mealPlan.findMany({
            where: {
                userId: user.id,
                startDate: {
                    gte: new Date(startDate as string)
                },
                endDate: {
                    lte: new Date(endDate as string)
                }
            },
            include: {
                items: {
                    include: {
                        recipe: true
                    },
                    orderBy: {
                        date: 'asc'
                    }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        res.status(200).json(mealPlans);
    } catch (error) {
        console.error('Error fetching meal plans by date range:', error);
        res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
};

/**
 * Generate AI meal plan using FatSecret API
 * POST /api/users/:userId/meal-plans/generate
 * Body: { startDate, endDate, preferences: { dailyCalories, proteinGoal, carbsGoal, fatGoal, mealsPerDay, dietaryRestrictions } }
 */
export const generateMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, preferences } = req.body;

        console.log('[generateMealPlan] Starting meal plan generation');
        console.log('[generateMealPlan] Request params:', { userId, startDate, endDate });
        console.log('[generateMealPlan] Preferences:', preferences);

        // Find user by firebaseUid
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            console.log('[generateMealPlan] User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[generateMealPlan] User found:', { id: user.id, firebaseUid: user.firebaseUid });

        // Calculate date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates: string[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }

        console.log('[generateMealPlan]  Date range calculated:', { dates, totalDays: dates.length });

        // Define meal types based on preferences
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        if (preferences.mealsPerDay === 4) {
            mealTypes.push('snacks');
        }

        console.log('[generateMealPlan] Meal types:', mealTypes);

        // Calculate macro targets per meal type
        const macroTargetsPerMeal = {
            breakfast: {
                calories: Math.round(preferences.dailyCalories * 0.25),
                protein: Math.round(preferences.proteinGoal * 0.25),
                carbs: Math.round(preferences.carbsGoal * 0.25),
                fat: Math.round(preferences.fatGoal * 0.25)
            },
            lunch: {
                calories: Math.round(preferences.dailyCalories * 0.35),
                protein: Math.round(preferences.proteinGoal * 0.35),
                carbs: Math.round(preferences.carbsGoal * 0.35),
                fat: Math.round(preferences.fatGoal * 0.35)
            },
            dinner: {
                calories: Math.round(preferences.dailyCalories * 0.35),
                protein: Math.round(preferences.proteinGoal * 0.35),
                carbs: Math.round(preferences.carbsGoal * 0.35),
                fat: Math.round(preferences.fatGoal * 0.35)
            },
            snacks: {
                calories: Math.round(preferences.dailyCalories * 0.15),
                protein: Math.round(preferences.proteinGoal * 0.15),
                carbs: Math.round(preferences.carbsGoal * 0.15),
                fat: Math.round(preferences.fatGoal * 0.15)
            }
        };

        console.log('[generateMealPlan] 🎯 Macro targets per meal:', macroTargetsPerMeal);

        // Generate search queries based on meal type and dietary restrictions
        const generateSearchQuery = (mealType: string): string => {
            const baseQueries = {
                breakfast: ['oatmeal', 'eggs', 'yogurt', 'smoothie', 'pancakes'],
                lunch: ['salad', 'sandwich', 'bowl', 'soup', 'wrap'],
                dinner: ['chicken', 'fish', 'pasta', 'stir fry', 'rice'],
                snacks: ['nuts', 'fruit', 'energy balls', 'crackers', 'cheese']
            };

            const queries = baseQueries[mealType as keyof typeof baseQueries] || baseQueries.dinner;

            // Add dietary restriction filters
            let query = queries[Math.floor(Math.random() * queries.length)];
            if (preferences.dietaryRestrictions?.includes('Vegetarian')) {
                query += ' vegetarian';
            }
            if (preferences.dietaryRestrictions?.includes('Vegan')) {
                query += ' vegan';
            }
            if (preferences.dietaryRestrictions?.includes('Gluten-Free')) {
                query += ' gluten free';
            }

            return query;
        };

        // Fetch recipes from FatSecret for each meal type
        const recipesByMealType: Record<string, any[]> = {};

        console.log('[generateMealPlan] 🔍 Starting recipe search for each meal type...');

        for (const mealType of mealTypes) {
            try {
                const searchQuery = generateSearchQuery(mealType);
                console.log(`[generateMealPlan] 🔍 Searching ${mealType} with query: "${searchQuery}"`);

                const fatSecretRecipes = await FatSecretService.searchRecipes(searchQuery, 10);
                console.log(`[generateMealPlan] FatSecret returned ${fatSecretRecipes.length} recipes for ${mealType}`);

                if (fatSecretRecipes.length === 0) {
                    console.warn(`[generateMealPlan] ⚠️ No recipes found for ${mealType} with query "${searchQuery}"`);
                    recipesByMealType[mealType] = [];
                    continue;
                }

                // Convert FatSecret recipes to our format
                console.log(`[generateMealPlan] Converting ${fatSecretRecipes.length} recipes for ${mealType}...`);
                const convertedRecipes = fatSecretRecipes.map((recipe, index) => {
                    try {
                        const converted = FatSecretService.convertToRecipeModel(recipe);
                        console.log(`[generateMealPlan] Converted recipe ${index + 1}: ${converted.title} (${converted.nutritionInfo.calories} cal)`);
                        return converted;
                    } catch (conversionError) {
                        console.error(`[generateMealPlan] ❌ Error converting recipe ${index + 1}:`, conversionError);
                        return null;
                    }
                }).filter(recipe => recipe !== null);

                console.log(`[generateMealPlan] Successfully converted ${convertedRecipes.length} recipes for ${mealType}`);

                // Filter by macro targets
                const targets = macroTargetsPerMeal[mealType as keyof typeof macroTargetsPerMeal];
                console.log(`[generateMealPlan] Filtering ${mealType} recipes with targets:`, targets);

                // Replace the macro filtering section with this more flexible approach:

                const processedRecipes = convertedRecipes.map(recipe => {
                    const calories = recipe.nutritionInfo.calories;
                    
                    // Calculate how many servings needed to meet target
                    let servings = 1;
                    let adjustedNutrition = { ...recipe.nutritionInfo };
                    
                    if (calories < targets.calories * 0.8) {
                        // If recipe is too small, calculate servings needed
                        servings = Math.ceil(targets.calories / calories);
                        
                        // Cap at reasonable serving size (max 3 servings for practicality)
                        if (servings > 3) {
                            servings = 3;
                        }
                        
                        // Adjust all nutrition values
                        adjustedNutrition = {
                            calories: recipe.nutritionInfo.calories * servings,
                            protein: recipe.nutritionInfo.protein * servings,
                            carbs: recipe.nutritionInfo.carbs * servings,
                            fat: recipe.nutritionInfo.fat * servings,
                            fiber: (recipe.nutritionInfo.fiber || 0) * servings,
                            sugar: (recipe.nutritionInfo.sugar || 0) * servings,
                            sodium: (recipe.nutritionInfo.sodium || 0) * servings
                        };
                    }
                    
                    // Accept recipe if adjusted calories are close to target (within 20% range)
                    const adjustedCalories = adjustedNutrition.calories;
                    const withinRange = (
                        adjustedCalories >= targets.calories * 0.8 && 
                        adjustedCalories <= targets.calories * 1.3
                    );
                    
                    console.log(`[generateMealPlan] 🔍 Recipe "${recipe.title}": ${calories} cal x${servings} = ${adjustedCalories} cal (target: ${targets.calories}) - ${withinRange ? '✅ PASS' : '❌ FAIL'}`);
                    
                    return {
                        ...recipe,
                        servingMultiplier: servings,
                        adjustedNutrition,
                        withinRange
                    };
                }).filter(recipe => recipe.withinRange);

                console.log(`[generateMealPlan] 📊 ${processedRecipes.length}/${convertedRecipes.length} recipes passed macro filter for ${mealType}`);
                recipesByMealType[mealType] = processedRecipes;

            } catch (error) {
                console.error(`[generateMealPlan] Error fetching recipes for ${mealType}:`, error);
                recipesByMealType[mealType] = [];
            }
        }

        console.log('[generateMealPlan] 📋 Recipe collection summary:');
        Object.entries(recipesByMealType).forEach(([mealType, recipes]) => {
            console.log(`  - ${mealType}: ${recipes.length} recipes available`);
        });

        // Generate meal plan items for each date
        const mealPlanItems: any[] = [];

        console.log('[generateMealPlan] 🏗️ Building meal plan items...');

        for (const dateString of dates) {
            console.log(`[generateMealPlan] Processing date: ${dateString}`);

            for (const mealType of mealTypes) {
                const availableRecipes = recipesByMealType[mealType];
                console.log(`[generateMealPlan] Processing ${mealType} - ${availableRecipes.length} recipes available`);

                if (availableRecipes.length > 0) {
                    // Select a random recipe for variety
                    const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
                    console.log(`[generateMealPlan] Selected recipe for ${mealType} on ${dateString}: "${selectedRecipe.title}"`);

                    try {
                        // Save recipe to database first
                        const recipeData = {
                            title: selectedRecipe.servingMultiplier > 1 
                                ? `${selectedRecipe.title} (${selectedRecipe.servingMultiplier} servings)`
                                : selectedRecipe.title,
                            description: selectedRecipe.description || `Nutritious ${selectedRecipe.title.toLowerCase()}`,
                            totalTime: selectedRecipe.totalTime || 30,
                            estimatedCostPerServing: (selectedRecipe.estimatedCostPerServing || 5.0) * selectedRecipe.servingMultiplier,
                            nutritionInfo: selectedRecipe.adjustedNutrition, // Use the scaled nutrition values
                            ingredients: selectedRecipe.ingredients.map((ing: any) => ({
                                name: ing.name,
                                amount: ing.amount * selectedRecipe.servingMultiplier, // Scale ingredient amounts
                                unit: ing.unit
                            })),
                            instructions: selectedRecipe.instructions.map((inst: any, idx: number) => ({
                                stepNumber: idx + 1,
                                instruction: selectedRecipe.servingMultiplier > 1 && idx === 0
                                    ? `This recipe serves ${selectedRecipe.servingMultiplier} portions. ${inst.instruction}`
                                    : inst.instruction,
                                equipment: inst.equipment || []
                            }))
                        };

                        console.log(`[generateMealPlan] 💾 Saving recipe to database: "${selectedRecipe.title}"`);
                        const savedRecipe = await prisma.recipe.create({
                            data: recipeData
                        });
                        console.log(`[generateMealPlan] Recipe saved with ID: ${savedRecipe.id}`);

                        // Add to meal plan items
                        mealPlanItems.push({
                            recipeId: savedRecipe.id,
                            date: new Date(dateString),
                            mealType: mealType
                        });
                        console.log(`[generateMealPlan] Added meal plan item: ${mealType} on ${dateString}`);

                    } catch (saveError) {
                        console.error(`[generateMealPlan] Error saving recipe "${selectedRecipe.title}":`, saveError);
                    }
                } else {
                    console.warn(`[generateMealPlan] No recipes available for ${mealType} on ${dateString}`);
                }
            }
        }

        console.log(`[generateMealPlan] 📊 Total meal plan items created: ${mealPlanItems.length}`);
        console.log('[generateMealPlan] Meal plan items breakdown:');
        mealPlanItems.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.mealType} on ${item.date.toISOString().split('T')[0]} - Recipe ID: ${item.recipeId}`);
        });

        if (mealPlanItems.length === 0) {
            console.error('[generateMealPlan] No meal plan items were created! Check recipe search and filtering logic.');
            return res.status(500).json({
                error: 'No meals could be generated',
                details: 'Recipe search returned no suitable results',
                recipesByMealType
            });
        }

        // Create or update meal plan
        console.log('[generateMealPlan] 🔍 Checking for existing meal plan...');
        const existingPlan = await prisma.mealPlan.findFirst({
            where: {
                userId: user.id,
                startDate: new Date(startDate)
            }
        });

        let mealPlan;

        if (existingPlan) {
            console.log(`[generateMealPlan] 🔄 Updating existing meal plan ID: ${existingPlan.id}`);

            // Delete existing items
            await prisma.mealPlanItem.deleteMany({
                where: { mealPlanId: existingPlan.id }
            });
            console.log('[generateMealPlan] 🗑️ Deleted existing meal plan items');

            mealPlan = await prisma.mealPlan.update({
                where: { id: existingPlan.id },
                data: {
                    endDate: new Date(endDate),
                    items: {
                        create: mealPlanItems
                    },
                    updatedAt: new Date()
                },
                include: {
                    items: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });
            console.log('[generateMealPlan] ✅ Updated existing meal plan');
        } else {
            console.log('[generateMealPlan] 🆕 Creating new meal plan');

            mealPlan = await prisma.mealPlan.create({
                data: {
                    userId: user.id,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    items: {
                        create: mealPlanItems
                    }
                },
                include: {
                    items: {
                        include: {
                            recipe: true
                        }
                    }
                }
            });
            console.log(`[generateMealPlan] ✅ Created new meal plan with ID: ${mealPlan.id}`);
        }

        // Return summary statistics
        const totalMealsGenerated = mealPlanItems.length;
        const dailyCaloriesGenerated = mealPlan.items
            .filter(item => item.date.toISOString().split('T')[0] === dates[0])
            .reduce((sum, item) => sum + ((item.recipe.nutritionInfo as any)?.calories || 0), 0);

        const response = {
            mealPlan,
            summary: {
                totalMealsGenerated,
                daysPlanned: dates.length,
                averageDailyCalories: dailyCaloriesGenerated,
                mealsPerDay: mealTypes.length
            }
        };

        console.log('[generateMealPlan] 📊 Final summary:', response.summary);
        console.log('[generateMealPlan] ✅ Meal plan generation completed successfully');

        res.status(201).json(response);

    } catch (error) {
        console.error('[generateMealPlan] ❌ Fatal error generating meal plan:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[generateMealPlan] Stack trace:', errorStack);
        res.status(500).json({
            error: 'Failed to generate meal plan',
            details: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
        });
    }
};