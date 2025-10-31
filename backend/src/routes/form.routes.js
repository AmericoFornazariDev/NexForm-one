import { Router } from 'express';
import {
  createForm,
  getForms,
  getFormById,
  deleteForm
} from '../controllers/form.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getForms);
router.post('/', authenticate, createForm);
router.get('/:id', getFormById);
router.delete('/:id', authenticate, deleteForm);

export default router;
