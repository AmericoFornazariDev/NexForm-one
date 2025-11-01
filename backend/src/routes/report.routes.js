import { Router } from 'express';
import { overview, insights } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.get('/:formId/overview', authenticate, initAiConfig, overview);
router.post('/:formId/insights', authenticate, initAiConfig, insights);

export default router;
