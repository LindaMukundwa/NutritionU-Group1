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
  console.log("[CHATBOT]: Generating chatbot response")
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
    console.log("[CHATBOT]: Sending chatbot response");
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
}

export const generateChatbotPrompts = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    console.log(message);
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

export const generateMacros = async (req: Request, res: Response) => {
  try {
    console.log("[CHATBOT] generateMacros(): open ai request beginning to generate macros... ")
    // May need to modify based on how data is passed in
    const preferences = req.body;
    const preferencesString = JSON.stringify(preferences);


    // Build the prompt for OpenAI
    const prompt = `
      Generate a personalized macronutrient (calories, fats, carbs, protein) breakdown based on supplied user preferences and attributes from a JSON request body.

      Consider the following required user inputs:
      - age
      - gender (e.g. "male", "female", "nonbinary", "prefer_not")
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
      1. Interpret all user attributes, goals, and restrictions, combining insights from activity level, age, gender, and goals. Adjust for lifestyle or cultural diet flags, medical restrictions, and budgetary/cooking constraints only if relevant.
      2. Determine an appropriate total daily calorie target using gender-specific calculations (e.g., Mifflin-St Jeor equation).
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

// Generate instructions based on a recipe from fat secret
export const generateInstructionsAndIngredients = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing query parameter' });
    }

    // Build the prompt for OpenAI
    const prompt = `
        Generate a recipe ingredient list and step-by-step instructions based on a given recipe name and a macronutrient profile (e.g., calories, protein, carbs, fats). Before providing the ingredient list and instructions, use reasoning to explain how you selected the ingredients and designed the preparation steps to match the given macronutrient targets for the recipe.

        This is the given recipe ${query}
        
        Think step by step to ensure that the ingredient choices and preparation methods fit the intended nutritional profile. Do not produce your conclusion (the ingredient list and recipe instructions) until after your reasoning section.

        Persist in iterative planning to optimize the macronutrients as closely as possible to the targets before producing your final answer. Internally, verify that all recipe elements align with the goals specified.

        Return your response as a JSON object with the following fields:

        - "reasoning": An explanation of how the ingredients and steps were chosen to fit the given macronutrient targets and dish type (50-150 words).
        - "ingredients": A list of ingredient names and their quantities, formatted as an array of strings (e.g., "2 eggs", "100g oats", "1 tsp salt").
        - "instructions": An ordered array of recipe preparation steps (e.g., "Preheat oven...", "Mix eggs...").

        ## Output format

        Respond ONLY with a JSON object as described above (no code block formatting).

        ## Example

        ### Input  
        Recipe name: Chicken Caesar Salad  
        Macronutrients: 40g protein, 15g carbs, 20g fat

        ### Output Example  
        {
          "reasoning": "To meet the high protein requirement, I used grilled chicken breast as the main protein source. The carb content is kept low by using primarily lettuce and a little whole-wheat crouton for some carbs, while the fat comes from olive oil and a light Caesar dressing. The ingredient amounts are selected to ensure the totals are as close as possible to the specified macronutrients.",
          "ingredients": [
            "150g grilled chicken breast",
            "2 cups romaine lettuce",
            "30g whole-wheat croutons",
            "2 tbsp light Caesar dressing",
            "1 tbsp grated parmesan cheese",
            "1 tbsp olive oil"
          ],
          "instructions": [
            "Grill the chicken breast until fully cooked and slice.",
            "Wash and chop the romaine lettuce.",
            "Toss lettuce with olive oil and Caesar dressing in a large bowl.",
            "Add sliced chicken on top, sprinkle with parmesan and croutons.",
            "Serve immediately."
          ]
        }

        (Real examples should use accurate quantities to reach the specified macronutrient targets more closely; ingredient calculations may require placeholder values if not specified.)

        ---

        **Important:**
        - Think step-by-step before listing ingredients or instructions.
        - Respond only with the specified JSON format.
      `;

    // Query OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe creator."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseMessage = completion.choices[0].message?.content;
    const recipe = JSON.parse(responseMessage || '{}');

    res.status(200).json(recipe);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
};

export const generateIngredientPrices = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    // Build the prompt for OpenAI
    const prompt = `
        Estimate the cost of specified food ingredients in the user's location and provide the sources used.  
        Given an input JSON with "ingredients" (a list of food items as strings or a dictionary of items) and "location" (a string), for each ingredient, estimate its local cost using online sources relevant to the specified location. For each ingredient, list the estimated unit price, the total estimated cost (for all ingredients), and indicate the internet sources where price information was found. Output the results as a structured JSON.

        - Carefully review the provided ingredients and location found her ${JSON.stringify(query)}
        - For each ingredient, search for price information from reputable online sources (such as grocery chains, marketplaces, or price aggregators) that serve the given location.
        - Clearly separate out your reasoning process (e.g., how you found the prices; what assumptions you made) from the final JSON output.  
        - Only include sources you actually used, providing URLs.
        - If you cannot find a price for any ingredient, indicate this explicitly in the output for that item with "price": null and provide a brief note in the "notes" field.
        - Be accurate and clear; total the cost for all items where prices are known.  
        - Reason step by step internally before producing the final output.

        **Output Format:**  
        - Respond with a single JSON object containing:
          - "ingredients_costs": a list with entries for each ingredient:
              - "name": ingredient name (string)
              - "price": estimated price per common unit/currency (float or null if not found)
              - "unit": unit for the price (string)
              - "source": a list of nearby stores
              - "notes": explanation or comment if applicable (string)
          - "total_cost": sum of all known ingredient prices (float, same currency as above)
          - "location": user-provided location (string)
          - "reasoning": a description of the search strategy, sources used, and methods/assumptions
        - Output ONLY the JSON described above, nothing else. Do not use code blocks.

        ---

        ### Example Input
        {
          "ingredients": ["milk", "eggs", "cheddar cheese"],
          "location": "Toronto, Canada"
        }

        ### Example Output
        {
          "ingredients_costs": [
            {
              "name": "milk",
              "price": 2.99,
              "unit": "1 L",
              "source": "https://www.loblaws.ca/milk-1L",
              "notes": ""
            },
            {
              "name": "eggs",
              "price": 3.49,
              "unit": "12 count",
              "source": "https://www.metro.ca/eggs-dozen",
              "notes": ""
            },
            {
              "name": "cheddar cheese",
              "price": null,
              "unit": "",
              "source": [],
              "notes": "Cheddar cheese pricing was not listed online for this location."
            }
          ],
          "total_cost": 6.48,
          "location": "Toronto, Canada",
          "reasoning": "Looked up current prices for each ingredient on major grocery store sites (Loblaws and Metro) serving Toronto, Canada. Used the price for the smallest standard unit; if unavailable, marked as null."
        }

        _(For real examples, the "ingredients" list may be longer, and links/units/prices should be updated according to web findings. Most notes will be blank unless special circumstances arise.)_

        ---

        **Important:**  
        - Output must be a single JSON object (see above structure), with clear reasoning included as a field.  
        - Always report accurate source URLs.  
        - Mark not-found ingredients with null prices and explain in "notes".
        - Reason step by step before providing the answer.
        - Remember: objective is to estimate ingredient costs, total, and sources, outputting in the specified JSON structure.
      `;

    // Query OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional internet surfer tasked to search the internet for the prices of food ingredients."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseMessage = completion.choices[0].message?.content;
    const recipe = JSON.parse(responseMessage || '{}');

    res.status(200).json(recipe);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
};

/**
 * Analyze and provide recommendations for FatSecret recipes
 * POST /api/chatbot/analyze-recipes
 * Body: { recipes: Recipe[], userContext?: string, mealType?: string }
 */
export const analyzeRecipes = async (req: Request, res: Response) => {
  console.log("[CHATBOT]: Analyzing FatSecret recipes with OpenAI");
  
  try {
    const { recipes, userContext, mealType, userGoals } = req.body;

    if (!recipes || recipes.length === 0) {
      return res.status(400).json({ error: 'No recipes provided for analysis' });
    }

    // Format recipes for OpenAI analysis
    const recipesText = recipes.map((recipe: any, index: number) => `
      **Recipe ${index + 1}: ${recipe.title}**
      - Description: ${recipe.description || 'No description available'}
      - Calories: ${recipe.nutritionInfo.calories}
      - Protein: ${recipe.nutritionInfo.protein}g
      - Carbs: ${recipe.nutritionInfo.carbs}g  
      - Fat: ${recipe.nutritionInfo.fat}g
      - Fiber: ${recipe.nutritionInfo.fiber || 0}g
      - Prep Time: ${recipe.totalTime || 'Unknown'} minutes
      - Cost: $${recipe.estimatedCostPerServing || 'Unknown'}
    `).join('\n');

    // Build context-aware prompt
    let analysisPrompt = `Please analyze these ${recipes.length} recipe(s) and provide:

1. **Nutritional Analysis** - Overall nutritional quality and balance
2. **Best Choice Recommendation** - Which recipe is optimal and why
3. **Meal Timing Suitability** - How appropriate each recipe is for the intended meal time
4. **Health Benefits** - Key nutritional benefits of the recommended recipe
5. **Preparation Tips** - Any suggestions to enhance nutrition or flavor

**Recipes to analyze:**
${recipesText}`;

    // Add contextual information if provided
    if (mealType) {
      analysisPrompt += `\n\n**Meal Context:** These recipes are being considered for ${mealType}.`;
    }

    if (userContext) {
      analysisPrompt += `\n\n**User Context:** ${userContext}`;
    }

    if (userGoals) {
      analysisPrompt += `\n\n**User Goals:** ${userGoals}`;
    }

    analysisPrompt += `\n\nProvide your analysis in a clear, structured format using bold headers and bullet points for readability.`;

    // Query OpenAI for recipe analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: 
            "You are a professional nutritionist and culinary expert. " +
            "Your job is to analyze recipes and provide evidence-based recommendations. " +
            "Focus on nutritional quality, meal timing appropriateness, health benefits, and practical cooking advice. " +
            "Be specific about why one recipe might be better than others. " +
            "Consider macronutrient balance, micronutrient content, and overall dietary quality. " +
            "Keep your analysis comprehensive but concise. " +
            "Use bold formatting for headers and structure your response clearly." +
            "Do not respond if not about recipes and nutrition. Instead, state that you can only respond to recipe and nutrition related inquiries."
        },
        {
          role: "user", 
          content: analysisPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const analysisResponse = completion.choices[0].message.content;

    // Also provide a structured recommendation
    const bestRecipe = recipes.reduce((best: any, current: any) => {
      // Simple scoring based on nutrition balance and calorie density
      const bestScore = (best.nutritionInfo.protein * 2) + best.nutritionInfo.fiber - (best.nutritionInfo.calories / 100);
      const currentScore = (current.nutritionInfo.protein * 2) + current.nutritionInfo.fiber - (current.nutritionInfo.calories / 100);
      
      return currentScore > bestScore ? current : best;
    });

    console.log("[CHATBOT]: Recipe analysis completed");
    
    res.status(200).json({ 
      analysis: analysisResponse,
      recommendedRecipe: {
        id: bestRecipe.id || null,
        title: bestRecipe.title,
        reason: "Highest protein-to-calorie ratio with good fiber content"
      },
      totalRecipesAnalyzed: recipes.length
    });

  } catch (error) {
    console.error('OpenAI Recipe Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze recipes with AI assistant' });
  }
};

/**
 * Get meal suggestions based on time of day and user preferences  
 * POST /api/chatbot/meal-suggestions
 * Body: { preferences?: string, dietaryRestrictions?: string[], currentTime?: string }
 */
export const getMealSuggestions = async (req: Request, res: Response) => {
  console.log("[CHATBOT]: Getting time-based meal suggestions");
  
  try {
    const { preferences, dietaryRestrictions, currentTime } = req.body;
    
    // Determine meal type based on time
    const now = currentTime ? new Date(currentTime) : new Date();
    const hour = now.getHours();
    
    let mealType: string;
    let mealDescription: string;
    
    if (hour >= 6 && hour < 11) {
      mealType = "breakfast";
      mealDescription = "morning meal to start your day";
    } else if (hour >= 11 && hour < 15) {
      mealType = "lunch"; 
      mealDescription = "midday meal to fuel your afternoon";
    } else if (hour >= 17 && hour < 21) {
      mealType = "dinner";
      mealDescription = "evening meal to end your day";
    } else {
      mealType = "snack";
      mealDescription = "light snack or late meal";
    }

    // Build suggestion prompt
    let suggestionPrompt = `Suggest 3-5 healthy ${mealType} ideas for a ${mealDescription}. 

Consider:
- Current time: ${now.toLocaleTimeString()}
- Meal type: ${mealType}
- Focus on balanced nutrition appropriate for this time of day`;

    if (preferences) {
      suggestionPrompt += `\n- User preferences: ${preferences}`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      suggestionPrompt += `\n- Dietary restrictions: ${dietaryRestrictions.join(', ')}`;
    }

    suggestionPrompt += `\n\nFor each suggestion, briefly mention:
- Why it's good for ${mealType}
- Key nutritional benefits  
- Approximate prep time

Format your response with clear headings and bullet points.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: 
            "You are a nutritionist specializing in meal timing and circadian nutrition. " +
            "Provide meal suggestions that are appropriate for the time of day, " +
            "considering factors like energy needs, digestion, and sleep quality. " +
            "Keep suggestions practical and achievable for home cooking."
        },
        {
          role: "user",
          content: suggestionPrompt  
        }
      ],
      max_tokens: 600,
      temperature: 0.8
    });

    const suggestions = completion.choices[0].message.content;

    console.log("[CHATBOT]: Meal suggestions generated");
    
    res.status(200).json({
      suggestions,
      mealType,
      currentTime: now.toISOString(),
      contextUsed: {
        preferences: preferences || null,
        dietaryRestrictions: dietaryRestrictions || [],
        timeOfDay: `${hour}:00`
      }
    });

  } catch (error) {
    console.error('Meal suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate meal suggestions' });
  }
};