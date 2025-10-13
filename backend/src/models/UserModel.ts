import type { User } from '../../../shared/types/user';
import { Schema, model } from 'mongoose';

export interface UserDocument extends User, Document {}

const UserSchema = new Schema<UserDocument>({
    _id: { type: String, required: true },
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    activityLevel: { type: String, enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'], required: true },
    dietaryRestrictions: {
        vegetarian: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false },
        glutenFree: { type: Boolean, default: false },
        dairyFree: { type: Boolean, default: false },
        nutFree: { type: Boolean, default: false },
        //kosher: { type: Boolean, default: false },
        halal: { type: Boolean, default: false },
        custom: { type: [String], default: [] },
    },
    nutritionGoals: {
        dailyCalories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fat: { type: Number, required: true },
        fiber: { type: Number, required: true },
        sugar: { type: Number, required: true },
        sodium: { type: Number, required: true },
    },
    preferences: {
        cuisineTypes: { type: [String], default: [] },
        cookingTime: { type: String, enum: ['quick', 'moderate', 'lengthy'], required: true },
        skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
        budgetRange: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
        },
        servingSize: { type: Number, required: true },
    },
    mealHistory: [
        {
            recipeId: { type: String, required: true },
            date: { type: Date, required: true },
            rating: { type: Number, min: 1, max: 5 },
            notes: { type: String },
        },
    ],
});

const User = model<UserDocument>('User', UserSchema);

export default User;