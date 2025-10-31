import { Router } from 'express';
import { overview, insights } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:formId/overview', authenticate, overview);
router.post('/:formId/insights', authenticate, insights);

export default router;
