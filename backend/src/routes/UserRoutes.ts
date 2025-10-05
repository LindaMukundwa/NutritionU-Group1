import { Router } from 'express';

import { createUser } from '../controllers/UserController.ts';

const router = Router();

// Route to create a new user
router.post('/create', createUser);

export default router;