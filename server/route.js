// route.js
import express from 'express';
import { registerUser, getUsers, DeleteUser, getUserById,UpdateUserbyId } from './controll.js';
const router = express.Router();

// New route to fetch user by ID
router.get('/:id', getUserById);
router.put('/:id', UpdateUserbyId);

// Existing routes
router.delete('/:id', DeleteUser);
router.post('/register', registerUser);
router.get('/', getUsers);

export default router;
