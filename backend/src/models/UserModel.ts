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
    bmi: { type: Number},
    medicalRestrictions: {
        gluten: { type: Boolean, required: true },
        dairy: { type: Boolean, required: true },
        nuts: { type: Boolean, required: true },
        peanuts: { type: Boolean, required: true },
        soy: { type: Boolean, required: true },
        eggs: { type: Boolean, required: true },
        shellfish: { type: Boolean, required: true },
        wheat: { type: Boolean, required: true },
        sesame: { type: Boolean, required: true },
        corn: { type: Boolean, required: true },
        sulfites: { type: Boolean, required: true },
        fodmap: { type: Boolean, required: true },
        histamine: { type: Boolean, required: true },
        lowSodium: { type: Boolean, required: true },
        lowSugar: { type: Boolean, required: true },
        none: { type: Boolean, required: true },
        description: { type: String, default: "Medical and health dietary restrictions" }
    },
    nutritionGoals: {
        goals: { type: String, enum: ["Save Money", "Eat Healthier", "Save Time", "Learn to Cook", "Lose Weight", "Gain Muscle", "None"] },
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number },
        description: { type: String, default: "User nutrition and lifestyle goals" }
    },
    lifestyleDiets: {
        vegetarian: { type: Boolean, required: true },
        pescetarian: { type: Boolean, required: true },
        flexitarian: { type: Boolean, required: true },
        mediterranean: { type: Boolean, required: true },
        paleo: { type: Boolean, required: true },
        keto: { type: Boolean, required: true },
        whole30: { type: Boolean, required: true },
        none: { type: Boolean, required: true },
        description: { type: String, default: "Lifestyle and ethical dietary choices" }
    },
    culturalDiets: {
        halal: { type: Boolean, required: true },
        kosher: { type: Boolean, required: true },
        jain: { type: Boolean, required: true },
        hindu: { type: Boolean, required: true },
        buddhist: { type: Boolean, required: true },
        none: { type: Boolean, required: true },
        description: { type: String, default: "Cultural and religious dietary preferences" }
    },
    budget: {
        minimum: { type: Number },
        maximum: { type: Number },
        step: { type: Number, default: 25 },
        default: { type: Number, default: 100 },
        description: { type: String, default: "Weekly food budget in dollars" }
    },
    onboardingCompleted: { type: Boolean, default: false },
    lastLogin: { type: Date },
    planGenerationCount: { type: Number, default: 0 },
    favoriteRecipes: { type: Array },
    recipe: { type: Array },
    createdAt: { type: Date },
    updatedAt: { type: Date },
});

const User = model<UserDocument>('User', UserSchema);

export default User;