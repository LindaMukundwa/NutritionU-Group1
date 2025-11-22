import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Create a new user - now uses Prisma but keeps Firebase UID support
export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body || {};

        // Use Firebase UID if available, otherwise use provided ID
        const firebaseUid = userData.firebaseUid?.trim() || undefined;

        // Create user and profile in a transaction
        const newUser = await prisma.user.create({
            data: {
                firebaseUid,
                email: userData.email,
                profile: {
                    create: {
                        onboardingCompleted: false,
                        units: userData.units || 'metric',
                        extra: {
                            displayName: userData.displayName || (userData.email ? String(userData.email).split('@')[0] : 'User'),
                            photoURL: userData.photoURL,
                            age: userData.age,
                            height: userData.height,
                            weight: userData.weight,
                            activityLevel: userData.activityLevel || 'moderately_active',
                            bmi: userData.bmi,
                            medicalRestrictions: userData.medicalRestrictions || {
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
                                description: 'Medical and health dietary restrictions'
                            },
                            nutritionGoals: userData.nutritionGoals || {
                                goals: 'None',
                                calories: undefined,
                                protein: undefined,
                                carbs: undefined,
                                fats: undefined,
                                description: 'User nutrition and lifestyle goals'
                            },
                            lifestyleDiets: userData.lifestyleDiets || {
                                vegetarian: false,
                                pescetarian: false,
                                flexitarian: false,
                                mediterranean: false,
                                paleo: false,
                                keto: false,
                                whole30: false,
                                none: true,
                                description: 'Lifestyle and ethical dietary choices'
                            },
                            culturalDiets: userData.culturalDiets || {
                                halal: false,
                                kosher: false,
                                jain: false,
                                hindu: false,
                                buddhist: false,
                                none: true,
                                description: 'Cultural and religious dietary preferences'
                            },
                            budget: userData.budget || {
                                minimum: undefined,
                                maximum: undefined,
                                step: 25,
                                default: 100,
                                description: 'Weekly food budget in dollars'
                            }
                        }
                    }
                }
            },
            include: {
                profile: true,
                favorites: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get an existing user and now supports both Prisma ID and Firebase UID
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Try to find by Prisma ID first, then by Firebase UID
        const userData = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            },
            include: {
                profile: true,
                favorites: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(userData);
    } catch (error) {
        console.log('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Patch user's onboarding/profile data and supports both Prisma ID and Firebase UID
export const patchUserProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profile = req.body;

        if (!profile || typeof profile !== 'object') {
            return res.status(400).json({ message: 'Profile data is required' });
        }

        // Try to find existing user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            }
        });

        if (user) {
            // Update existing user's profile
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    profile: {
                        upsert: {
                            create: {
                                onboardingCompleted: true,
                                units: profile.units || 'metric',
                                extra: profile
                            },
                            update: {
                                onboardingCompleted: true,
                                units: profile.units || 'metric',
                                extra: profile
                            }
                        }
                    }
                },
                include: {
                    profile: true
                }
            });
            return res.status(200).json(updatedUser);
        }

        // Create new user if not found
        const newUser = await prisma.user.create({
            data: {
                firebaseUid: id,
                profile: {
                    create: {
                        onboardingCompleted: true,
                        units: profile.units || 'metric',
                        extra: profile
                    }
                }
            },
            include: {
                profile: true
            }
        });

        return res.status(200).json(newUser);
    } catch (err) {
        console.error('Error patching user profile:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Add favorite recipe
export const addFavoriteRecipe = async (req: Request, res: Response) => {
    try {
        const { userId, recipeId } = req.params;

        const favorite = await prisma.favorite.create({
            data: {
                userId: parseInt(userId, 10),
                recipeId: parseInt(recipeId, 10)
            },
            include: {
                recipe: true
            }
        });

        res.status(200).json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove favorite recipe
export const removeFavoriteRecipe = async (req: Request, res: Response) => {
    try {
        const { userId, recipeId } = req.params;

        await prisma.favorite.delete({
            where: {
                userId_recipeId: {
                    userId: parseInt(userId, 10),
                    recipeId: parseInt(recipeId, 10)
                }
            }
        });

        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's favorite recipes
export const getUserFavorites = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: parseInt(id, 10) || undefined },
                    { firebaseUid: id }
                ]
            },
            include: {
                favorites: {
                    include: {
                        recipe: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.favorites);
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};