import { Router } from 'express';
import {
    createMealPlan,
    getUserMealPlans,
    getMealPlan,
    updateMealPlan,
    deleteMealPlan,
    addMealPlanItem,
    removeMealPlanItem,
    getCurrentWeekMealPlan,
    getMealPlansByDateRange
} from '../controllers/MealPlanController.ts';

const router = Router();

// User-specific meal plan routes
router.post('/users/:userId/meal-plans', createMealPlan);
router.get('/users/:userId/meal-plans', getUserMealPlans);
router.get('/users/:userId/meal-plans/current', getCurrentWeekMealPlan);
router.get('/users/:userId/meal-plans/range', getMealPlansByDateRange);

// General meal plan routes
router.get('/meal-plans/:mealPlanId', getMealPlan);
router.put('/meal-plans/:mealPlanId', updateMealPlan);
router.delete('/meal-plans/:mealPlanId', deleteMealPlan);

// Meal plan item routes
router.post('/meal-plans/:mealPlanId/items', addMealPlanItem);
router.delete('/meal-plans/items/:itemId', removeMealPlanItem);

export default router;
