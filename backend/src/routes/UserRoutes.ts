import { Router } from 'express';

import { createUser, getUser, deleteUser, patchUserPreferences, patchUserBudget, patchUserLifestyleDiets, patchUserCulturalDiets, patchUserMedicalRestrictions, patchUserGoals } from '../controllers/UserController.ts';

const router = Router();

// Route to create a new user
router.post('/create', createUser);

// Route to get user information
router.get('/:id', getUser);

// Route to delete user information
router.delete('/:id', deleteUser);

// Route to update user preferences
router.patch('/:id/preferences', patchUserPreferences);

// Route to update user budget
router.patch('/:id/budget', patchUserBudget);

// Route to update user lifestyle diets
router.patch('/:id/lifestyle-diets', patchUserLifestyleDiets);

// Route to update user cultural diets
router.patch('/:id/cultural-diets', patchUserCulturalDiets);

// Route to update user medical restrictions
router.patch('/:id/medical-restrictions', patchUserMedicalRestrictions);

// Route to update user goald
router.patch(':id/goals', patchUserGoals);



export default router;