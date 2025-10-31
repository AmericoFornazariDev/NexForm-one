import { Router } from 'express';
import authRoutes from './auth.routes.js';
import planRoutes from './plan.routes.js';
import formRoutes from './form.routes.js';
import responseRoutes from './response.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/plans', planRoutes);
router.use('/forms', formRoutes);
router.use('/responses', responseRoutes);
router.use('/ai', aiRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

export default router;
