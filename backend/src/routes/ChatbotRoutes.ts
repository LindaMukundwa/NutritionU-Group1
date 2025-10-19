import express from 'express';
import { generateChatbotResponse } from '../controllers/ChatbotController';


const router = express.Router();

/**
 * @route POST /api/openai/generate
 * @desc Generate a response using OpenAI
 * @access Public
 */
router.post('/generate', generateChatbotResponse);

export default router;