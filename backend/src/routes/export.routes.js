import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { exportCSV, exportPDF, globalReport } from '../controllers/export.controller.js';

const router = Router();

router.get('/global', authenticate, globalReport);
router.get('/form/:formId/pdf', authenticate, exportPDF);
router.get('/form/:formId/csv', authenticate, exportCSV);

export default router;
