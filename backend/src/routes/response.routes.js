import { Router } from 'express';
import { listResponses, createResponse, getResponse } from '../controllers/response.controller.js';

const router = Router();

router.get('/', listResponses);
router.post('/', createResponse);
router.get('/:id', getResponse);

export default router;
