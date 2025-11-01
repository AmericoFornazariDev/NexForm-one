import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';
import { exportCSV, exportPDF, globalReport } from '../controllers/export.controller.js';

const router = Router();

router.get('/global', authenticate, initAiConfig, globalReport);
router.get('/form/:formId/pdf', authenticate, initAiConfig, exportPDF);
router.get('/form/:formId/csv', authenticate, initAiConfig, exportCSV);

export default router;
