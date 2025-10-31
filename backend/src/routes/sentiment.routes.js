import { Router } from 'express';
import { analyzeFormSentiment, getFormSentimentTrend } from '../controllers/sentiment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/analyze/:formId', authenticate, analyzeFormSentiment);
router.get('/:formId/trend', authenticate, getFormSentimentTrend);

export default router;
