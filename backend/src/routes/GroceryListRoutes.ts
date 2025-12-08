import { Router } from 'express';
import {
    createGroceryList,
    getUserGroceryLists,
    getGroceryList,
    updateGroceryList,
    deleteGroceryList,
    addGroceryItem,
    updateGroceryItem,
    deleteGroceryItem,
    toggleGroceryItemChecked,
    clearCheckedItems,
    generateGroceryListFromMealPlan,
    duplicateGroceryList,
    simplifyIngredients
} from '../controllers/GroceryListController.ts';

const router = Router();

// User-specific grocery list routes
router.post('/users/:firebaseUid/grocery-lists', createGroceryList);
router.get('/users/:firebaseUid/grocery-lists', getUserGroceryLists);

router.post('/grocery-lists/simplify-ingredients', simplifyIngredients);

// General grocery list routes
router.get('/grocery-lists/:groceryListId', getGroceryList);
router.put('/grocery-lists/:groceryListId', updateGroceryList);
router.delete('/grocery-lists/:groceryListId', deleteGroceryList);

// Grocery item routes
router.post('/grocery-lists/:groceryListId/items', addGroceryItem);
router.put('/grocery-lists/items/:itemId', updateGroceryItem);
router.delete('/grocery-lists/items/:itemId', deleteGroceryItem);

// Utility routes for grocery items
router.patch('/grocery-lists/items/:itemId/toggle', toggleGroceryItemChecked);
router.delete('/grocery-lists/:groceryListId/checked-items', clearCheckedItems);

// Special functionality routes
router.post('/grocery-lists/:groceryListId/generate-from-meal-plan/:mealPlanId', generateGroceryListFromMealPlan);
router.post('/grocery-lists/:groceryListId/duplicate', duplicateGroceryList);

export default router;