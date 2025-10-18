import { Router } from 'express';

import { generateRecipeFromOpenAI } from '../controllers/RecipeController.ts';

const router = Router()

// Route to get recipe from open AI
router.post('/generate-recipe', generateRecipeFromOpenAI);

export default router;