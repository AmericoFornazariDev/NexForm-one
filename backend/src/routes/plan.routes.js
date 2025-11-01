import { Router } from 'express';
import { getPlans, upgradePlan } from '../controllers/plan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.get('/plans', getPlans);
router.post('/upgrade', authenticate, initAiConfig, upgradePlan);

export default router;
