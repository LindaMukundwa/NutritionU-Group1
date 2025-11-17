import express from 'express';
import { generateChatbotResponse, generateChatbotPrompts, generateMacros } from '../controllers/ChatbotController.ts';


const router = express.Router();

/**
 * @route POST /api/openai/generate
 * @desc Generate a response using OpenAI
 * @access Public
 */
router.post('/generate', generateChatbotResponse);

router.post('/prompts', generateChatbotPrompts);

router.post('/macros', generateMacros);

export default router;