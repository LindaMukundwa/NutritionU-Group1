import express from 'express';
import { generateChatbotResponse, generateChatbotPrompts, generateMacros, generateInstructionsAndIngredients, generateIngredientPrices, analyzeRecipes, getMealSuggestions, estimateRecipeCost } from '../controllers/ChatbotController.ts';


const router = express.Router();

/**
 * @route POST /api/openai/generate
 * @desc Generate a response using OpenAI
 * @access Public
 */
router.post('/generate', generateChatbotResponse);

router.post('/prompts', generateChatbotPrompts);

router.post('/macros', generateMacros);

router.post('/instructions-ingredients', generateInstructionsAndIngredients);

router.post('/ingredients-prices', generateIngredientPrices);

router.post('/analyze-recipes', analyzeRecipes);

router.post('/meal-suggestions', getMealSuggestions);

router.post('/estimate-recipe-cost', estimateRecipeCost);


export default router;