import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/ai/config', authenticate, AiController.getConfig);
router.post('/ai/config', authenticate, AiController.saveConfig);
router.post('/forms/:id/next', AiController.getNextQuestion);

export default router;
