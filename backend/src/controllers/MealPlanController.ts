import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';
import FatSecretService from '../services/fatSecretService.ts';
import openai from '../openai.ts'


export const createMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, items } = req.body;

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

        const existingPlan = await prisma.mealPlan.findFirst({
            where: {
                userId: user.id,
                startDate: new Date(startDate)
            }
        });

        if (existingPlan) {
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

export const getUserMealPlans = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

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

export const updateMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;
        const { startDate, endDate, items } = req.body;

        await prisma.mealPlanItem.deleteMany({
            where: { mealPlanId: Number(mealPlanId) }
        });

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

export const deleteMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;

        await prisma.mealPlanItem.deleteMany({
            where: { mealPlanId: Number(mealPlanId) }
        });

        await prisma.mealPlan.delete({
            where: { id: Number(mealPlanId) }
        });

        res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        res.status(500).json({ error: 'Failed to delete meal plan' });
    }
};

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

export const removeMealPlanItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        await prisma.recipe.delete({
            where: { id: Number(itemId) }
        });

        res.status(200).json({ message: 'Meal plan item removed successfully' });
    } catch (error) {
        console.error('Error removing meal plan item:', error);
        res.status(500).json({ error: 'Failed to remove meal plan item' });
    }
};

export const getCurrentWeekMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

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

export const getMealPlansByDateRange = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        console.log('[getMealPlansByDateRange] Request received:', { userId, startDate, endDate });

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: isNaN(Number(userId)) ? undefined : Number(userId) },
                    { firebaseUid: userId }
                ]
            }
        });

        if (!user) {
            console.log('[getMealPlansByDateRange] User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[getMealPlansByDateRange] User found:', { id: user.id, firebaseUid: user.firebaseUid });

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

        console.log('[getMealPlansByDateRange] Found meal plans:', mealPlans.length);
        console.log('[getMealPlansByDateRange] Meal plans summary:', mealPlans.map(mp => ({
            id: mp.id,
            startDate: mp.startDate,
            endDate: mp.endDate,
            itemCount: mp.items.length
        })));

        res.status(200).json(mealPlans);
    } catch (error) {
        console.error('[getMealPlansByDateRange] Error fetching meal plans by date range:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[getMealPlansByDateRange] Error details:', errorMessage);
        res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
};

export const generateMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, preferences } = req.body;

        console.log('[generateMealPlan] Starting meal plan generation');
        console.log('[generateMealPlan] Request params:', { userId, startDate, endDate });
        console.log('[generateMealPlan] Preferences:', preferences);

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

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates: string[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }

        console.log('[generateMealPlan]  Date range calculated:', { dates, totalDays: dates.length });

        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        if (preferences.mealsPerDay === 4) {
            mealTypes.push('snacks');
        }

        console.log('[generateMealPlan] Meal types:', mealTypes);

        const macroTargetsPerMeal = {
            breakfast: {
                calories: Math.round(preferences.dailyCalories * 0.23),
                protein: Math.round(preferences.proteinGoal * 0.23),
                carbs: Math.round(preferences.carbsGoal * 0.23),
                fat: Math.round(preferences.fatGoal * 0.23)
            },
            lunch: {
                calories: Math.round(preferences.dailyCalories * 0.32),
                protein: Math.round(preferences.proteinGoal * 0.32),
                carbs: Math.round(preferences.carbsGoal * 0.32),
                fat: Math.round(preferences.fatGoal * 0.32)
            },
            dinner: {
                calories: Math.round(preferences.dailyCalories * 0.32),
                protein: Math.round(preferences.proteinGoal * 0.32),
                carbs: Math.round(preferences.carbsGoal * 0.32),
                fat: Math.round(preferences.fatGoal * 0.32)
            },
            snacks: {
                calories: Math.round(preferences.dailyCalories * 0.13),
                protein: Math.round(preferences.proteinGoal * 0.13),
                carbs: Math.round(preferences.carbsGoal * 0.13),
                fat: Math.round(preferences.fatGoal * 0.13)
            }
        };

        console.log('[generateMealPlan] 🎯 Macro targets per meal:', macroTargetsPerMeal);

        const createBalancedCustomRecipe = (mealType: string, targets: any) => {
            const targetCalories = targets.calories * 0.95;
            const proteinCals = targetCalories * 0.20;
            const fatCals = targetCalories * 0.25;
            const carbCals = targetCalories * 0.55;

            const proteinGrams = proteinCals / 4;
            const fatGrams = fatCals / 9;
            const carbGrams = carbCals / 4;

            const recipeTemplates = {
                breakfast: {
                    title: "Balanced Morning Meal",
                    ingredients: [
                        { name: "Whole grain oats", amount: Math.round(carbGrams * 0.4), unit: { type: 'metric', value: 'g' } },
                        { name: "Greek yogurt", amount: Math.round(proteinGrams * 3), unit: { type: 'metric', value: 'g' } },
                        { name: "Mixed nuts", amount: Math.round(fatGrams * 0.6), unit: { type: 'metric', value: 'g' } },
                        { name: "Banana", amount: Math.round(carbGrams * 0.6), unit: { type: 'metric', value: 'g' } },
                        { name: "Honey", amount: 15, unit: { type: 'metric', value: 'g' } }
                    ]
                },
                lunch: {
                    title: "Balanced Power Bowl",
                    ingredients: [
                        { name: "Brown rice (cooked)", amount: Math.round(carbGrams * 0.7), unit: { type: 'metric', value: 'g' } },
                        { name: "Lean protein (chicken/tofu)", amount: Math.round(proteinGrams * 4), unit: { type: 'metric', value: 'g' } },
                        { name: "Avocado", amount: Math.round(fatGrams * 1.5), unit: { type: 'metric', value: 'g' } },
                        { name: "Mixed vegetables", amount: 150, unit: { type: 'metric', value: 'g' } },
                        { name: "Olive oil", amount: Math.round(fatGrams * 0.5), unit: { type: 'metric', value: 'g' } }
                    ]
                },
                dinner: {
                    title: "Balanced Evening Meal",
                    ingredients: [
                        { name: "Salmon or lean meat", amount: Math.round(proteinGrams * 4.5), unit: { type: 'metric', value: 'g' } },
                        { name: "Sweet potato", amount: Math.round(carbGrams * 0.8), unit: { type: 'metric', value: 'g' } },
                        { name: "Olive oil", amount: Math.round(fatGrams * 0.7), unit: { type: 'metric', value: 'g' } },
                        { name: "Green vegetables", amount: 200, unit: { type: 'metric', value: 'g' } }
                    ]
                },
                snacks: {
                    title: "Balanced Snack",
                    ingredients: [
                        { name: "Whole grain crackers", amount: Math.round(carbGrams * 0.6), unit: { type: 'metric', value: 'g' } },
                        { name: "Cheese or nuts", amount: Math.round(proteinGrams * 2), unit: { type: 'metric', value: 'g' } },
                        { name: "Fruit", amount: Math.round(carbGrams * 0.4), unit: { type: 'metric', value: 'g' } }
                    ]
                }
            };

            const template = recipeTemplates[mealType as keyof typeof recipeTemplates] || recipeTemplates.lunch;

            return {
                title: template.title,
                description: `Nutritionally balanced ${mealType} following optimal macro ratios`,
                totalTime: 25,
                estimatedCostPerServing: 7.0,
                adjustedNutrition: {
                    calories: Math.round(targetCalories),
                    protein: Math.round(proteinGrams),
                    carbs: Math.round(carbGrams),
                    fat: Math.round(fatGrams),
                    fiber: 8,
                    sugar: 12,
                    sodium: 350
                },
                ingredients: template.ingredients,
                instructions: [
                    { stepNumber: 1, instruction: "Prepare all ingredients according to portion sizes", equipment: [] },
                    { stepNumber: 2, instruction: "Combine ingredients following balanced nutrition principles", equipment: [] },
                    { stepNumber: 3, instruction: "Serve immediately for optimal nutrition", equipment: [] }
                ],
                servingMultiplier: 1,
                macroPercentages: { protein: 20.0, fat: 25.0, carbs: 55.0 },
                macroScore: 1.0,
                withinRange: true
            };
        };

        const generateSearchQuery = (mealType: string): string => {
            const baseQueries = {
                breakfast: ['oatmeal', 'eggs', 'yogurt', 'smoothie', 'pancakes'],
                lunch: ['salad', 'sandwich', 'bowl', 'soup', 'wrap'],
                dinner: ['chicken', 'fish', 'pasta', 'stir fry', 'rice'],
                snacks: ['nuts', 'fruit', 'energy balls', 'crackers', 'cheese']
            };

            const queries = baseQueries[mealType as keyof typeof baseQueries] || baseQueries.dinner;

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

        console.log('[generateMealPlan] Applying daily macro balancing...');

        const balanceDailyMacros = (dayRecipes: { breakfast: any[], lunch: any[], dinner: any[], snacks?: any[] }) => {
            const dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

            Object.values(dayRecipes).forEach(mealRecipes => {
                if (mealRecipes.length > 0) {
                    const recipe = mealRecipes[0];
                    dailyTotals.calories += recipe.adjustedNutrition.calories;
                    dailyTotals.protein += recipe.adjustedNutrition.protein;
                    dailyTotals.carbs += recipe.adjustedNutrition.carbs;
                    dailyTotals.fat += recipe.adjustedNutrition.fat;
                }
            });

            const dailyProteinPercent = (dailyTotals.protein * 4) / dailyTotals.calories * 100;
            const dailyFatPercent = (dailyTotals.fat * 9) / dailyTotals.calories * 100;
            const dailyCarbPercent = (dailyTotals.carbs * 4) / dailyTotals.calories * 100;

            console.log(`[generateMealPlan] Daily totals: ${dailyTotals.calories.toFixed(0)} cal`);
            console.log(`    Daily macros: P:${dailyProteinPercent.toFixed(1)}% F:${dailyFatPercent.toFixed(1)}% C:${dailyCarbPercent.toFixed(1)}%`);

            return dailyTotals;
        };

        const recipesByMealType: Record<string, any[]> = {};

        console.log('[generateMealPlan] Starting recipe search for each meal type...');

        for (const mealType of mealTypes) {
            try {
                const searchQuery = generateSearchQuery(mealType);
                console.log(`[generateMealPlan] Searching ${mealType} with query: "${searchQuery}"`);

                const fatSecretRecipes = await FatSecretService.searchRecipes(searchQuery, 10);
                console.log(`[generateMealPlan] FatSecret returned ${fatSecretRecipes.length} recipes for ${mealType}`);

                if (fatSecretRecipes.length === 0) {
                    console.warn(`[generateMealPlan] ⚠️ No recipes found for ${mealType} with query "${searchQuery}"`);
                    recipesByMealType[mealType] = [];
                    continue;
                }

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

                const targets = macroTargetsPerMeal[mealType as keyof typeof macroTargetsPerMeal];
                console.log(`[generateMealPlan] Filtering ${mealType} recipes with targets:`, targets);

                const processedRecipes = convertedRecipes.map(recipe => {
                    const nutrition = recipe.nutritionInfo;

                    const calorieMultiplier = targets.calories / nutrition.calories;
                    let servings = Math.max(1, Math.ceil(calorieMultiplier * 0.9));
                    servings = Math.min(servings, 3);

                    let adjustedNutrition = {
                        calories: nutrition.calories * servings,
                        protein: nutrition.protein * servings,
                        carbs: nutrition.carbs * servings,
                        fat: nutrition.fat * servings,
                        fiber: (nutrition.fiber || 0) * servings,
                        sugar: (nutrition.sugar || 0) * servings,
                        sodium: (nutrition.sodium || 0) * servings
                    };

                    adjustedNutrition.calories = (adjustedNutrition.protein * 4) + (adjustedNutrition.fat * 9) + (adjustedNutrition.carbs * 4);

                    const totalCals = adjustedNutrition.calories;
                    const proteinPercent = (adjustedNutrition.protein * 4) / totalCals * 100;
                    const fatPercent = (adjustedNutrition.fat * 9) / totalCals * 100;
                    const carbPercent = (adjustedNutrition.carbs * 4) / totalCals * 100;

                    const proteinInRange = proteinPercent >= 10 && proteinPercent <= 35;
                    const fatInRange = fatPercent >= 20 && fatPercent <= 35;
                    const carbInRange = carbPercent >= 45 && carbPercent <= 65;

                    const caloriesInRange = (
                        adjustedNutrition.calories >= targets.calories * 0.75 &&
                        adjustedNutrition.calories <= targets.calories * 1.1
                    );

                    const proteinScore = proteinInRange ? 1 : Math.max(0.3, 1 - Math.abs(proteinPercent - 22.5) / 22.5);
                    const fatScore = fatInRange ? 1 : Math.max(0.3, 1 - Math.abs(fatPercent - 27.5) / 27.5);
                    const carbScore = carbInRange ? 1 : Math.max(0.3, 1 - Math.abs(carbPercent - 55) / 55);
                    const calorieScore = caloriesInRange ? 1 : Math.max(0.3, 1 - Math.abs(adjustedNutrition.calories - targets.calories) / targets.calories);

                    const macroScore = (proteinScore * 1.1 + fatScore * 1.0 + carbScore * 1.0 + calorieScore * 1.2) / 4.3;

                    const withinRange = macroScore >= 0.7;

                    console.log(`[generateMealPlan] Recipe "${recipe.title}": ${nutrition.calories}→${adjustedNutrition.calories.toFixed(0)}cal (x${servings})`);
                    console.log(`    Final Macros: P:${proteinPercent.toFixed(1)}% (${adjustedNutrition.protein.toFixed(1)}g) F:${fatPercent.toFixed(1)}% (${adjustedNutrition.fat.toFixed(1)}g) C:${carbPercent.toFixed(1)}% (${adjustedNutrition.carbs.toFixed(1)}g)`);
                    console.log(`    Score: ${macroScore.toFixed(2)} ${withinRange ? '✅ PASS' : '❌ FAIL'}`);

                    return {
                        ...recipe,
                        servingMultiplier: servings,
                        adjustedNutrition,
                        macroPercentages: { protein: proteinPercent, fat: fatPercent, carbs: carbPercent },
                        macroScore,
                        withinRange
                    };
                }).filter(recipe => recipe.withinRange)
                    .sort((a, b) => b.macroScore - a.macroScore);

                console.log(`[generateMealPlan] ${processedRecipes.length}/${convertedRecipes.length} recipes passed macro filter for ${mealType}`);

                if (processedRecipes.length === 0) {
                    console.log(`[generateMealPlan] 🔧 Creating custom balanced recipe for ${mealType}`);

                    const customRecipe = createBalancedCustomRecipe(mealType, targets);
                    processedRecipes.push(customRecipe);
                }

                recipesByMealType[mealType] = processedRecipes;
            } catch (error) {
                console.error(`[generateMealPlan] Error fetching recipes for ${mealType}:`, error);
                recipesByMealType[mealType] = [];
            }
        }

        console.log('[generateMealPlan] Recipe collection summary:');
        Object.entries(recipesByMealType).forEach(([mealType, recipes]) => {
            console.log(`  - ${mealType}: ${recipes.length} recipes available`);
        });

        console.log('[generateMealPlan] Analyzing recipes with OpenAI for optimization...');

        const analyzeRecipesWithAI = async (mealType: string, recipes: any[]) => {
            if (recipes.length === 0) return recipes;

            try {
                const recipesText = recipes.map((recipe, index) => `
          Recipe ${index + 1}: ${recipe.title}
          - Calories: ${recipe.adjustedNutrition?.calories || recipe.nutritionInfo.calories}
          - Protein: ${recipe.adjustedNutrition?.protein || recipe.nutritionInfo.protein}g
          - Carbs: ${recipe.adjustedNutrition?.carbs || recipe.nutritionInfo.carbs}g  
          - Fat: ${recipe.adjustedNutrition?.fat || recipe.nutritionInfo.fat}g
          - Macro Score: ${recipe.macroScore?.toFixed(2) || 'N/A'}
        `).join('\n');

                const analysisPrompt = `Analyze these ${mealType} recipes for a meal plan with ${preferences.dailyCalories} daily calories target.

                User Goals:
                - Daily Calories: ${preferences.dailyCalories}
                - Protein: ${preferences.proteinGoal}g
                - Carbs: ${preferences.carbsGoal}g
                - Fat: ${preferences.fatGoal}g
                - Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}

                Recipes to analyze:
                ${recipesText}

                Rank these recipes from 1-${recipes.length} based on:
                1. How well they meet the macro targets for ${mealType}
                2. Nutritional quality and balance
                3. Appropriateness for ${mealType} timing

                Respond with ONLY a JSON array of recipe indices in order of preference (e.g., [2,1,3] if recipe 2 is best, recipe 1 is second, etc.)`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a nutritionist analyzing meal plan recipes. Respond only with a JSON array of numbers representing recipe ranking by preference."
                        },
                        {
                            role: "user",
                            content: analysisPrompt
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.3
                });

                try {
                    const ranking = JSON.parse(completion.choices[0].message.content || '[]');
                    console.log(`[generateMealPlan] AI ranking for ${mealType}: ${ranking}`);

                    const reorderedRecipes = ranking
                        .map((index: number) => recipes[index - 1])
                        .filter((recipe: any) => recipe !== undefined);

                    const rankedIndices = ranking.map((i: number) => i - 1);
                    const unrankedRecipes = recipes.filter((_, index) => !rankedIndices.includes(index));

                    const finalRecipes = [...reorderedRecipes, ...unrankedRecipes];
                    console.log(`[generateMealPlan] Reordered ${mealType} recipes based on AI analysis`);

                    return finalRecipes;
                } catch (parseError) {
                    console.warn(`[generateMealPlan] ⚠️ Could not parse AI ranking for ${mealType}, using original order`);
                    return recipes;
                }

            } catch (error) {
                console.error(`[generateMealPlan] ❌ AI analysis failed for ${mealType}:`, error);
                return recipes;
            }
        };

        for (const mealType of mealTypes) {
            if (recipesByMealType[mealType].length > 1) {
                console.log(`[generateMealPlan] Analyzing ${mealType} recipes...`);
                recipesByMealType[mealType] = await analyzeRecipesWithAI(mealType, recipesByMealType[mealType]);
            }
        }

        console.log('[generateMealPlan] AI analysis complete');

        const mealPlanItems: any[] = [];

        console.log('[generateMealPlan] Building meal plan items...');

        const addedMeals = new Set<string>();

        for (const dateString of dates) {
            console.log(`[generateMealPlan] Processing date: ${dateString}`);

            const dayRecipes: { breakfast: any[], lunch: any[], dinner: any[], snacks?: any[] } = {
                breakfast: [],
                lunch: [],
                dinner: []
            };

            if (mealTypes.includes('snacks')) {
                dayRecipes.snacks = [];
            }

            for (const mealType of mealTypes) {
                const mealKey = `${dateString}-${mealType}`;
                const availableRecipes = recipesByMealType[mealType];
                console.log(`[generateMealPlan] Processing ${mealType} - ${availableRecipes.length} recipes available`);

                if (addedMeals.has(mealKey)) {
                    console.log(`[generateMealPlan] ⚠️ Skipping duplicate for ${mealType} on ${dateString}`);
                    continue;
                }

                if (availableRecipes.length > 0) {
                    const topRecipes = availableRecipes.slice(0, Math.min(3, availableRecipes.length));
                    const selectedRecipe = topRecipes[Math.floor(Math.random() * topRecipes.length)];

                    console.log(`[generateMealPlan] Selected recipe for ${mealType} on ${dateString}: "${selectedRecipe.title}" (Score: ${selectedRecipe.macroScore?.toFixed(2) || 'N/A'})`);

                    if (mealType === 'breakfast') {
                        dayRecipes.breakfast = [selectedRecipe];
                    } else if (mealType === 'lunch') {
                        dayRecipes.lunch = [selectedRecipe];
                    } else if (mealType === 'dinner') {
                        dayRecipes.dinner = [selectedRecipe];
                    } else if (mealType === 'snacks' && dayRecipes.snacks) {
                        dayRecipes.snacks = [selectedRecipe];
                    }

                    try {
                        const recipeData = {
                            title: selectedRecipe.servingMultiplier && selectedRecipe.servingMultiplier > 1
                                ? `${selectedRecipe.title} (${selectedRecipe.servingMultiplier} servings)`
                                : selectedRecipe.title,
                            description: selectedRecipe.description || `Nutritious ${selectedRecipe.title.toLowerCase()}`,
                            totalTime: selectedRecipe.totalTime || 30,
                            estimatedCostPerServing: (selectedRecipe.estimatedCostPerServing || 5.0) * (selectedRecipe.servingMultiplier || 1),
                            nutritionInfo: selectedRecipe.adjustedNutrition || selectedRecipe.nutritionInfo,
                            ingredients: selectedRecipe.ingredients.map((ing: any) => ({
                                name: ing.name,
                                amount: ing.amount * (selectedRecipe.servingMultiplier || 1),
                                unit: ing.unit
                            })),
                            instructions: selectedRecipe.instructions.map((inst: any, idx: number) => ({
                                stepNumber: idx + 1,
                                instruction: selectedRecipe.servingMultiplier && selectedRecipe.servingMultiplier > 1 && idx === 0
                                    ? `This recipe serves ${selectedRecipe.servingMultiplier} portions. ${inst.instruction}`
                                    : inst.instruction,
                                equipment: inst.equipment || []
                            }))
                        };

                        console.log(`[generateMealPlan] Saving scaled recipe: "${recipeData.title}" with ${selectedRecipe.adjustedNutrition?.calories || selectedRecipe.nutritionInfo.calories} calories`);
                        const savedRecipe = await prisma.recipe.create({
                            data: recipeData
                        });
                        console.log(`[generateMealPlan] ✅ Recipe saved with ID: ${savedRecipe.id}`);

                        mealPlanItems.push({
                            recipeId: savedRecipe.id,
                            date: new Date(dateString),
                            mealType: mealType
                        });

                        addedMeals.add(mealKey);

                        console.log(`[generateMealPlan] ✅ Added meal plan item: ${mealType} on ${dateString}`);

                    } catch (saveError) {
                        console.error(`[generateMealPlan] ❌ Error saving recipe "${selectedRecipe.title}":`, saveError);
                    }
                } else {
                    console.warn(`[generateMealPlan] ⚠️ No recipes available for ${mealType} on ${dateString}`);
                }
            }

            console.log(`[generateMealPlan] 🔍 Checking daily balance for ${dateString}:`);
            const dailyBalance = balanceDailyMacros(dayRecipes);

            const dailyCalorieTarget = preferences.dailyCalories;
            const calorieVariance = Math.abs(dailyBalance.calories - dailyCalorieTarget) / dailyCalorieTarget;

            if (calorieVariance > 0.15) {
                console.warn(`[generateMealPlan] ⚠️ Daily calories for ${dateString} are ${calorieVariance > 0 ? 'over' : 'under'} target by ${(calorieVariance * 100).toFixed(1)}%`);
            }
        }

        console.log(`[generateMealPlan] Total meal plan items created: ${mealPlanItems.length}`);
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

        console.log('[generateMealPlan] Checking for existing meal plan...');
        const existingPlan = await prisma.mealPlan.findFirst({
            where: {
                userId: user.id,
                startDate: new Date(startDate)
            }
        });

        let mealPlan;

        if (existingPlan) {
            console.log(`[generateMealPlan] Updating existing meal plan ID: ${existingPlan.id}`);

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
            console.log('[generateMealPlan] Creating new meal plan');

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

        console.log('[generateMealPlan] Final summary:', response.summary);
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
