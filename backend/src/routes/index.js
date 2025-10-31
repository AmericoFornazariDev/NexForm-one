import { Router } from 'express';
import authRoutes from './auth.routes.js';
import planRoutes from './plan.routes.js';
import formRoutes from './form.routes.js';
import responseRoutes from './response.routes.js';
import aiRoutes from './ai.routes.js';
import questionRoutes from './question.routes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/', planRoutes);
router.use('/', aiRoutes);
router.use('/', questionRoutes);
router.use('/forms', formRoutes);
router.use('/forms', responseRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

export default router;
