import type { Request, Response } from 'express';
import { default as User } from '../models/user';

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