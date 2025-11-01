import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.get('/ai/config', authenticate, initAiConfig, AiController.getConfig);
router.post('/ai/config', authenticate, initAiConfig, AiController.saveConfig);
router.post('/ai/generate', authenticate, initAiConfig, AiController.generateQuestion);
router.post('/forms/:id/next', AiController.getNextQuestion);

export default router;
