import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register); // Optional - for creating employees

export default router;

