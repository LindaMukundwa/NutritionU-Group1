import type { Request, Response } from 'express';
import { default as User } from '../models/UserModel.ts';
import { error } from 'console';

// Create a new user
export const createUser = async (req: Request, res: Response) => {

    /* 
    JSON Format
        {
            "_id": "testkey123",
            "firebaseUid": "testfirebase123",
            "email": "nutritionutester@gmail.com",
            "displayName": "John Doe",
            "photoURL": "https://example.com/photo.jpg",
            "age": 30,
            "height": 180,
            "weight": 75,
            "units": "metric",
            "activityLevel": "moderately_active",
            "bmi": 23.1,
            "medicalRestrictions": {
                "gluten": false,
                "dairy": false,
                "nuts": false,
                "peanuts": false,
                "soy": false,
                "eggs": false,
                "shellfish": false,
                "wheat": false,
                "sesame": false,
                "corn": false,
                "sulfites": false,
                "fodmap": false,
                "histamine": false,
                "lowSodium": false,
                "lowSugar": false,
                "none": true,
                "description": "Medical and health dietary restrictions"
            },
            "nutritionGoals": {
                "goals": "Eat Healthier",
                "calories": 2000,
                "protein": 150,
                "carbs": 250,
                "fats": 70,
                "description": "User nutrition and lifestyle goals"
            },
            "lifestyleDiets": {
                "vegetarian": false,
                "pescetarian": false,
                "flexitarian": false,
                "mediterranean": true,
                "paleo": false,
                "keto": false,
                "whole30": false,
                "none": false,
                "description": "Lifestyle and ethical dietary choices"
            },
            "culturalDiets": {
                "halal": true,
                "kosher": false,
                "jain": false,
                "hindu": false,
                "buddhist": false,
                "none": false,
                "description": "Cultural and religious dietary preferences"
            },
            "budget": {
                "minimum": 50,
                "maximum": 200,
                "step": 25,
                "default": 100,
                "description": "Weekly food budget in dollars"
            },
            "onboardingCompleted": true,
            "lastLogin": "2023-09-01T12:00:00.000Z",
            "planGenerationCount": 5,
            "favoriteRecipes": ["recipe123", "recipe456"],
            "recipe": ["recipe789", "recipe101"],
            "createdAt": "2023-09-01T12:00:00.000Z",
            "updatedAt": "2023-09-01T12:00:00.000Z"
        }
    */
    try {
        const userData = req.body;
        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json(userData);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get an existing user
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userData = await User.findById(id);
        if (!userData) {
            throw error("User with this id is not found");
        }
        res.status(201).json(userData);
    } catch (error) {
        console.log('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete an existing user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    res.status(201).json(req);
}

// Update user budget
export const patchUserBudget = async (req: Request, res: Response) => {

    /*
    JSON Format
    {
        "budget": {
            "minimum": 50,
            "maximum": 200,
            "step": 10,
            "default": 75,
            "description": "Updated weekly food budget in dollars"

        }
    }
    
    */
    try {
        const { id } = req.params;
        const { budget } = req.body;

        if (!budget) {
            return res.status(400).json({ message: 'Budget is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { budget },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user budget:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    res.status(201).json(req);
}

// Update lifestyle diets
export const patchUserLifestyleDiets = async (req: Request, res: Response) => {
    /* 
    JSON Format
        { 
            "lifestyleDiets": {
                "vegetarian": true,
                "pescetarian": false,
                "flexitarian": false,
                "mediterranean": false,
                "paleo": false,
                "keto": false,
                "whole30": false,
                "none": false,
                "description": "Lifestyle and ethical dietary choices"
            }
        }
    */

    try {
        const { id } = req.params;
        const { lifestyleDiets } = req.body;

        if (!lifestyleDiets) {
            return res.status(400).json({ message: 'Lifestyle preferences required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { lifestyleDiets },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating lifestyle diets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update culutral diets
export const patchUserCulturalDiets = async (req: Request, res: Response) => {

    /*
    JSON Format
        {
            "culturalDiets": {
                "halal": true,
                "kosher": false,
                "jain": false,
                "hindu": true,
                "buddhist": false,
                "none": false,
                "description": "Updated cultural and religious dietary preferences"
            }
        }
    */

    try {
        const { id } = req.params;
        const { culturalDiets } = req.body;

        if (!culturalDiets) {
            return res.status(400).json({ message: 'Cultural diets are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { culturalDiets },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating cultural diets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Update medical restrictions
export const patchUserMedicalRestrictions = async (req: Request, res: Response) => {
    /*
    JSON Format
    {
        "medicalRestrictions": {
            "gluten": true,
            "dairy": false,
            "nuts": false,
            "peanuts": true,
            "soy": false,
            "eggs": false,
            "shellfish": true,
            "wheat": false,
            "sesame": false,
            "corn": true,
            "sulfites": false,
            "fodmap": false,
            "histamine": true,
            "lowSodium": false,
            "lowSugar": true,
            "none": false,
            "description": "Medical and health dietary restrictions"
        }
    }
    */

    try {
        const { id } = req.params;
        const { medicalRestrictions } = req.body;

        if (!medicalRestrictions) {
            return res.status(400).json({ message: 'Medical restrictions are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { medicalRestrictions },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating medical restrictions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Update goals
export const patchUserGoals = async (req: Request, res: Response) => {
    /*
    JSON Format
    {
        "nutrition-goals": {
            "goals": "Eat Healthier",
            "calories": 2000,
            "protein": 150,
            "carbs": 250,
            "fats": 70,
            "description": "User nutrition and lifestyle goals"
        }
    }
    */

    try {
        const { id } = req.params;
        const { nutritionGoals } = req.body;

        console.log(req.body);

        if (!nutritionGoals) {
            return res.status(400).json({ message: 'Goals are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { nutritionGoals },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user goals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// Patch user's onboarding/profile data. Accepts either Mongo _id or firebaseUid as :id
export const patchUserProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profile = req.body;

        if (!profile || typeof profile !== 'object') {
            return res.status(400).json({ message: 'Profile data is required' });
        }

        const updates = {
            profile,
            onboardingCompleted: true,
            updatedAt: new Date(),
        };

        // Allow caller to pass either the Mongo _id or the firebaseUid
        const filter = { $or: [{ _id: id }, { firebaseUid: id }] } as any;

        // Upsert: if the user doesn't exist yet, create a minimal record using the id
        const updatedUser = await User.findOneAndUpdate(
            filter,
            { $set: updates, $setOnInsert: { _id: id, firebaseUid: id, createdAt: new Date() } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Error patching user profile:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
