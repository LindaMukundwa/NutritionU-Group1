import { response, type Request, type Response } from 'express';
import openai from '../openai.ts'

// Define tools that can be used by open ai
const tools =  {
    "type": "function",
    "function": {
      "name": "searchRecipes",
      "description": "Searches the internal recipe database for meals based on a food query, like ingredients or dish names. Use this when the user asks for recipes, meal ideas, or cooking instructions.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The food string or ingredient to search for (e.g., 'chicken', 'low carb desserts', 'steak'). This parameter is required."
          },
          "maxResults": {
            "type": "integer",
            "description": "The maximum number of recipes to return. Defaults to 20 if not specified by the user."
          }
        },
        "required": ["query"]
      }
  }
} 

// Generate a response for chatbot
export const generateChatbotResponse = async (req: Request, res: Response) => {

  console.log(tools);

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
        tools
      ],
    });

    console.log(response);
    console.log(completion);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
}

export const generateChatbotPrompts = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
          System / Instruction Prompt:

          You are a prompt generator that creates short, clear, and meaningful prompts for a nutrition assistant chatbot.
          Your job is to:
          
          Generate a concise, actionable prompt (for the assistant to use next), and
                    
          Guidelines:
                    
          Generate 3 prompts (questions to ask) under 10 words based on the history of the conversation denoted in message. 
          
          It should be from the point of view of the user asking the chatbot. Don't include numbered bullets.
          
          Remove list indicators (number indicators) and quotes surrounding the question.
          `
        },
        ...message,
      ],
    });
    res.json({
      reply: completion.choices[0].message?.content?.split('\n').filter(line => line.trim() !== '') || []
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
}