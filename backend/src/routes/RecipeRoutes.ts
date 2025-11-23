import { Router } from 'express';
import { 
  createRecipe,
  searchRecipes, 
  getRecipeById, 
  searchFoods, 
  getFoodById,
  //generateRecipeFromOpenAI 
} from '../controllers/RecipeController.ts';

const router = Router();

// Recipe creation (for saving FatSecret recipes to DB)
router.post('/', createRecipe);

// FatSecret recipe routes
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);

// FatSecret food/ingredient routes
router.get('/foods/search', searchFoods);
router.get('/foods/:id', getFoodById);

// OpenAI route (keeping for future)
//router.post('/generate-recipe', generateRecipeFromOpenAI);

export default router;