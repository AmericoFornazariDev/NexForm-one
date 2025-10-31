import { Router } from 'express';
import { handleResponse } from '../controllers/response.controller.js';

const router = Router();

router.post('/:id/respond', handleResponse);

export default router;
