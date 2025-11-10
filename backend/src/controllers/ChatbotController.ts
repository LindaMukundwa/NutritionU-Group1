import { type Request, type Response } from 'express';
import openai from '../openai.ts'
import fatSecretService from '../services/fatSecretService.ts';

// Define tools that can be used by open ai
const tools = [{
  name: "searchRecipes",
  description: "Searches the internal recipe database for meals based on a food query, like ingredients or dish names. Use this when the user asks for recipes, meal ideas, or cooking instructions.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The food string or ingredient to search for (e.g., 'chicken', 'low carb desserts', 'steak'). This parameter is required."
      },
      maxResults: {
        type: "integer",
        description: "The maximum number of results should always be 1"
      }
    },
    required: ["query"]
  }
}];

// Generate a response for chatbot
export const generateChatbotResponse = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    // Build the message to chat gpt
    const fullMessages = [
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
    ]

    // Query open ai
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: fullMessages,
      functions: tools
    });

    const responseMessage = completion.choices[0].message;

    // Check if tooling is needed
    if (responseMessage.function_call) {

      // Check if recipe should be searched by FatSecretApi
      if (responseMessage.function_call.name === "searchRecipes") {

        const { query, maxResults } = JSON.parse(responseMessage.function_call.arguments || '{}');
        const recipes = await fatSecretService.searchRecipes(query, maxResults || 1);

        // Hold converted recipes
        const formattedRecipes = [];

        // Make recipe conform to NutritionU model
        for (const recipe of recipes) {
          const formattedRecipe = fatSecretService.convertToRecipeModel(recipe);
          formattedRecipes.push(formattedRecipe);
        }

        // Create recipe string for chatbot
        var recipeString: string = "**Here are some options** \n";
        for (const recipe of formattedRecipes){
            const currentRecipe = `
              **Name:** ${recipe.title}
              **Description:** ${recipe.description}\n
              **Calories:** ${recipe.nutritionInfo.calories}
              **Protein:** ${recipe.nutritionInfo.protein}
              **Carbohydrates:** ${recipe.nutritionInfo.carbs}
              **Fats:** ${recipe.nutritionInfo.fat}\n
              **Source:** ${recipe.source}
            `;
          recipeString += currentRecipe;
        }
        
        res.status(200).json({ reply: recipeString });
      } else {
        res.status(200).json({ reply: responseMessage.content });
      }
    } else {
      res.status(200).json({ reply: responseMessage.content });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
}

export const generateChatbotPrompts = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    console.log(message);
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `
    //       System / Instruction Prompt:

    //       You are a prompt generator that creates short, clear, and meaningful prompts for a nutrition assistant chatbot.
    //       Your job is to:

    //       Generate a concise, actionable prompt (for the assistant to use next), and

    //       Guidelines:

    //       Generate 3 prompts (questions to ask) under 10 words based on the history of the conversation denoted in message. 

    //       It should be from the point of view of the user asking the chatbot. Don't include numbered bullets.

    //       Remove list indicators (number indicators) and quotes surrounding the question.
    //       `
    //     },
    //     ...message,
    //   ],

    // });
    // res.json({
    //   reply: completion.choices[0].message?.content?.split('\n').filter(line => line.trim() !== '') || []
    // });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
}