import { Router } from 'express';

import { createUser, getUser } from '../controllers/UserController.ts';

const router = Router();

// Route to create a new user
router.post('/create', createUser);

router.get('/:id', getUser);

export default router;