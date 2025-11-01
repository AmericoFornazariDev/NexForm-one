import { Router } from 'express';
import { analyzeFormSentiment, getFormSentimentTrend } from '../controllers/sentiment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.post('/analyze/:formId', authenticate, initAiConfig, analyzeFormSentiment);
router.get('/:formId/trend', authenticate, initAiConfig, getFormSentimentTrend);

export default router;
