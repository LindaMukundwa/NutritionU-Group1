import type { Recipe } from '../../../shared/types/recipe';
import { Schema, model } from 'mongoose';

export interface RecipeDocument extends Recipe, Document {}

const RecipeSchema = new Schema<RecipeDocument>({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    cuisine: { type: String, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'], required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    totalTime: { type: Number, required: true },
    servings: { type: Number, required: true },
    ingredients: [
        {
            openFoodFactsId: { type: String },
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            unit: {
                type: {
                    type: String,
                    enum: ['metric', 'imperial'],
                    required: true,
                },
                value: {
                    type: String,
                    enum: [
                        'grams', 'kg', 'ml', 'liters',
                        'pounds', 'cups', 'ounces', 'tbsp', 'tsp', 'pieces', 'slices',
                    ],
                    required: true,
                },
            },
            category: {
                type: String,
                enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'condiment', 'other'],
                required: true,
            },
            nutritionInfo: {
                calories: { type: Number, required: true },
                protein: { type: Number, required: true },
                carbs: { type: Number, required: true },
                fat: { type: Number, required: true },
                fiber: { type: Number, required: true },
                sugar: { type: Number, required: true },
                sodium: { type: Number, required: true },
            },
        },
    ],
    instructions: [
        {
            stepNumber: { type: Number, required: true },
            instruction: { type: String, required: true },
            equipment: [{ type: String, required: true }],
        },
    ],
    nutritionInfo: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fat: { type: Number, required: true },
        fiber: { type: Number, required: true },
        sugar: { type: Number, required: true },
        sodium: { type: Number, required: true },
    },
    estimatedCostPerServing: { type: Number, required: true },
    dietaryTags: [{ type: String, required: true }],
    source: { type: String, enum: ['openai_generated', 'user_created'], required: true },
    openaiPrompt: { type: String },
    createdBy: { type: String },
    nutritionPerServing: {
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        sugar: { type: Number },
        sodium: { type: Number },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Recipe = model<RecipeDocument>('Recipe', RecipeSchema);

export default Recipe;