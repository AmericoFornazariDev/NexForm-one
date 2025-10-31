import { Router } from 'express';
import { generateWithLlama, generateWithGpt } from '../controllers/ai.controller.js';

const router = Router();

router.post('/llama', generateWithLlama);
router.post('/gpt', generateWithGpt);

export default router;
