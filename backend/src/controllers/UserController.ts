import type { Request, Response } from 'express';
import { default as User } from '../models/user.ts';
import { error } from 'console';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
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
    } catch(error) {
        console.log('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
}