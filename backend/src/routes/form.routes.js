import { Router } from 'express';
import {
  createForm,
  getForms,
  getFormById,
  deleteForm
} from '../controllers/form.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.get('/', authenticate, initAiConfig, getForms);
router.post('/', authenticate, initAiConfig, createForm);
router.get('/:id', getFormById);
router.delete('/:id', authenticate, initAiConfig, deleteForm);

export default router;
