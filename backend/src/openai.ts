import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "",
});

const userPreferences = {
  age: 30,
  height: 180,
  weight: 75,
  units: "metric",
  activityLevel: "moderately_active",
  medicalRestrictions: {
    gluten: false,
    dairy: false,
    nuts: false,
    peanuts: false,
    soy: false,
    eggs: false,
    shellfish: false,
    wheat: false,
    sesame: false,
    corn: false,
    sulfites: false,
    fodmap: false,
    histamine: false,
    lowSodium: false,
    lowSugar: false,
    none: true,
  },
  nutritionGoals: {
    goals: "Eat Healthier",
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 70,
  },
  lifestyleDiets: {
    vegetarian: false,
    pescetarian: false,
    flexitarian: false,
    mediterranean: true,
    paleo: false,
    keto: false,
    whole30: false,
    none: false,
  },
  culturalDiets: {
    halal: true,
    kosher: false,
    jain: false,
    hindu: false,
    buddhist: false,
    none: false,
  },
  budget: {
    minimum: 50,
    maximum: 200,
  },
};

const recipeJSON = {
  "nutritionInfo": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0
  },
  "nutritionPerServing": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0
  },
  "_id": "",
  "title": "",
  "description": "",
  "imageUrl": "",
  "cuisine": "",
  "mealType": "",
  "difficulty": "",
  "prepTime": 0,
  "cookTime": 0,
  "totalTime": 0,
  "servings": 0,
  "ingredients": [
    {
      "unit": {
        "type": "",
        "value": ""
      },
      "nutritionInfo": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0
      },
      "openFoodFactsId": "",
      "name": "",
      "amount": 0,
      "category": "",
      "_id": ""
    }
  ],
  "instructions": [
    {
      "step": 0,
      "description": ""
    }
  ]
};

const recipePrompt = `Generate a recipe based on the following user preferences: ${JSON.stringify(
  userPreferences
)}. The recipe should match this JSON structure ${JSON.stringify(recipeJSON)}, including nutrition information, nutrition per serving, ingredients, instructions, and all other fields`;

const recipeResponse = openai.responses.create({
  model: "gpt-5-nano",
  input: recipePrompt,
  store: true,
});

recipeResponse.then((result) => {
  const generatedRecipe = JSON.parse(result.output_text);
  console.log(generatedRecipe);
});