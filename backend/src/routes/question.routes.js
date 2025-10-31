import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/forms/:id/questions', authenticate, QuestionController.listQuestions);
router.post('/forms/:id/questions', authenticate, QuestionController.createQuestion);
router.put('/questions/:qid', authenticate, QuestionController.updateQuestion);
router.delete('/questions/:qid', authenticate, QuestionController.deleteQuestion);

export default router;
