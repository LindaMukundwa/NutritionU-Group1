import { Router } from 'express';

import { createUser } from '../controllers/UserController';

const router = Router();

// Route to create a new user
router.post('/user/create', createUser);

export default router;