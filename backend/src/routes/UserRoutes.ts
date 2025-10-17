import { Router } from 'express';

import { createUser, getUser, deleteUser, patchUserBudget, patchUserLifestyleDiets, patchUserCulturalDiets, patchUserMedicalRestrictions, patchUserGoals, postUserRecipe, getUserRecipe, deleteUserRecipe } from '../controllers/UserController.ts';

const router = Router();

// Route to create a new user
router.post('/create', createUser);

// Route to get user information
router.get('/:id', getUser);

// Route to delete user information
router.delete('/:id', deleteUser);

// Route to update user budget
router.patch('/:id/budget', patchUserBudget);

// Route to update user lifestyle diets
router.patch('/:id/lifestyle-diets', patchUserLifestyleDiets);

// Route to update user cultural diets
router.patch('/:id/cultural-diets', patchUserCulturalDiets);

// Route to update user medical restrictions
router.patch('/:id/medical-restrictions', patchUserMedicalRestrictions);

// Route to update user goals
router.patch('/:id/goals', patchUserGoals);

// Route for a user to create a recipe
router.post('/:id/recipes', postUserRecipe);

// Route to get a recipes owned by a user
router.get('/:id/recipes', getUserRecipe);

// Route to delete a recipe owned by a user 
router.delete('/:id/recipes/:recipeId', deleteUserRecipe)

export default router;