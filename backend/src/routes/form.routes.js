import { Router } from 'express';
import { listForms, createForm, getForm, deleteForm } from '../controllers/form.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listForms);
router.post('/', authenticate, createForm);
router.get('/:id', getForm);
router.delete('/:id', authenticate, deleteForm);

export default router;
