import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';

/**
 * Create a new meal plan for a user
 * POST /api/users/:userId/meal-plans
 */
export const createMealPlan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { items } = req.body; // items: Array<{ recipeId, dayOfWeek, mealType }>

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

        // Create meal plan with items
        const mealPlan = await prisma.mealPlan.create({
            data: {
                userId: user.id,
                items: {
                    create: items.map((item: any) => ({
                        recipeId: item.recipeId,
                        dayOfWeek: item.dayOfWeek,
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
 */
export const updateMealPlan = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;
        const { items } = req.body;

        // Delete existing items
        await prisma.mealPlanItem.deleteMany({
            where: { mealPlanId: Number(mealPlanId) }
        });

        // Create new items
        const updatedMealPlan = await prisma.mealPlan.update({
            where: { id: Number(mealPlanId) },
            data: {
                items: {
                    create: items.map((item: any) => ({
                        recipeId: item.recipeId,
                        dayOfWeek: item.dayOfWeek,
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
 */
export const addMealPlanItem = async (req: Request, res: Response) => {
    try {
        const { mealPlanId } = req.params;
        const { recipeId, dayOfWeek, mealType } = req.body;

        const item = await prisma.mealPlanItem.create({
            data: {
                mealPlanId: Number(mealPlanId),
                recipeId: Number(recipeId),
                dayOfWeek,
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

        await prisma.mealPlanItem.delete({
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
