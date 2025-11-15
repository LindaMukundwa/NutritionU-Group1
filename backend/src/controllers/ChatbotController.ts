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
        for (const recipe of formattedRecipes) {
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

export const generateMacros = async (req: Request, res: Response) => {
  try {
    console.log("[CHATBOT] generateMacros(): open ai request beginning to generate macros... ")
    // May need to modify based on how data is passed in
    const preferences = req.body;
    const preferencesString = JSON.stringify(preferences);

    console.log(preferencesString);

    // Build the prompt for OpenAI
    const prompt = `
      Generate a personalized macronutrient (calories, fats, carbs, protein) breakdown based on supplied user preferences and attributes from a JSON request body.

      Consider the following required user inputs:
      - age
      - height
      - weight
      - units (e.g. "imperial" or "metric")
      - activityLevel (e.g. "very_active", "inactive")
      - budget (daily food budget in USD)
      - cookingLevel (e.g. "beginner", "intermediate", "expert")
      - lifestyleDiets (array: special dietary focuses, e.g. ["high_protein"])
      - medicalRestrictions (array: e.g. ["diabetes"], can be empty)
      - culturalDiets (array: e.g. ["kosher"], can be empty)
      - goals (array: e.g. ["muscle_gain", "athletic_performance"])
      - mealPrep (frequency, e.g. "daily", "weekly")

      Reason step by step through the following before producing your answer:
      1. Interpret all user attributes, goals, and restrictions, combining insights from activity level, age, and goals. Adjust for lifestyle or cultural diet flags, medical restrictions, and budgetary/cooking constraints only if relevant.
      2. Determine an appropriate total daily calorie target.
      3. Calculate evidence-based recommendations for daily macronutrient targets (grams and/or % of calories) for protein, fats, and carbohydrates, based on user profile and goals.
      4. Ensure macronutrient ratios make sense for all stated goals, prioritizing muscle gain, athletic performance, and high protein per the example.
      5. Only after finalizing your calculations, present the conclusion in a well-structured JSON object.

      Output format:
      Return your answer as a well-formatted JSON object in the following structure:
      {
        "calories": [daily target, integer, kcal],
        "protein": {
          "grams": [integer, g/day],
          "percent": [float, % of daily calories]
        },
        "carbs": {
          "grams": [integer, g/day],
          "percent": [float, % of daily calories]
        },
        "fats": {
          "grams": [integer, g/day],
          "percent": [float, % of daily calories]
        },
        "rationale": "[Short explanation of the calculations and macronutrient distribution chosen based on provided preferences.]"
      }

      Examples:
      USE THIS INPUT ONLY to make decisions are generating macro nutrient breakdown in the REQUIRED structure
      ${preferencesString}

      Corresponding output:
      {
        "calories": 3200,
        "protein": {
          "grams": 228,
          "percent": 28.5
        },
        "carbs": {
          "grams": 380,
          "percent": 47.5
        },
        "fats": {
          "grams": 95,
          "percent": 24
        },
        "rationale": "The user profile targets muscle gain and athletic performance with high activity and a high protein focus. Estimated TDEE is increased for 'very_active' status (+10% for muscle gain). Protein set at 1.2g/lb due to high-protein and muscle goals; fats kept moderate; carbs fill remainder to support performance and recovery."
      }

      (Real output should have rationales appropriately detailed for each user input; placeholder numbers above.)

      Important: Proceed stepwise—interpret user data and perform calculations before finalizing the output. Output only the specified JSON object format and rationale. Do not add explanations or outputs outside the JSON object.

      —

      Reminder: Always reason through user data and macronutrient calculation steps before finalizing and presenting the result in JSON format with rationale.`

      console.log(prompt);
    // Query OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and meal planning expert."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    console.log(completion.choices);

    const responseMessage = completion.choices[0].message?.content;
    // Parse and return the response
    const macros = JSON.parse(responseMessage || '{}');
    console.log("[CHATBOT] generateMacros(): macro nutrient generation successful")
    res.status(200).json(macros);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate macronutrient breakdown' });
  }
}