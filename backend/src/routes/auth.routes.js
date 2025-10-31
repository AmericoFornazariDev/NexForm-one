import { Router } from 'express';
import { login, register, profile } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', profile);

export default router;
