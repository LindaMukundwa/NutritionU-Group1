import type { Request, Response } from 'express';
import openai from '../openai.ts'

// Generate a response for chatbot
export const generateChatbotResponse = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
          {
              role: "system",
              content:
            "You are a professional nutritionist and meal planning expert. " +
            "Your job is to provide evidence-based nutritional advice, create personalized meal plans, and offer guidance on macronutrient distribution, caloric intake, and dietary choices. " +
            "You can help users optimize their diets for various goals like weight loss, muscle gain, athletic performance, or managing health conditions. " +
            "Use scientifically accurate information and avoid promoting extreme or dangerous dieting practices. " +
            "Always consider individual needs and preferences when making recommendations. " +
            "If a user mentions specific health conditions that require specialized medical nutrition therapy, advise them to consult with a healthcare provider." +
            "Keep answers concise and simple unless a user asks to elaborate" +
            "Prefer outputting lists for user readability" +
            "Use bold tagging for important and/or header information"
          },
          ...message,
            ],
        });
    
        res.json({ 
          reply: completion.choices[0].message.content 
        });
      } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Failed to get response from assistant' });
      }
}