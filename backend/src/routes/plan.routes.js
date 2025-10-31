import { Router } from 'express';
import { listPlans, upgradePlan } from '../controllers/plan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', listPlans);
router.post('/upgrade', authenticate, upgradePlan);

export default router;
