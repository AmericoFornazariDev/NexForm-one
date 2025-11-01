import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { initAiConfig } from '../middleware/initAiConfig.js';

const router = Router();

router.get('/forms/:id/questions', authenticate, initAiConfig, QuestionController.listQuestions);
router.post('/forms/:id/questions', authenticate, initAiConfig, QuestionController.createQuestion);
router.put('/questions/:qid', authenticate, initAiConfig, QuestionController.updateQuestion);
router.delete('/questions/:qid', authenticate, initAiConfig, QuestionController.deleteQuestion);

export default router;
