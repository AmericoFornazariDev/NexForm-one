import { z } from 'zod';
import {
  getAvailablePlans,
  upgradeUserPlan
} from '../services/plan.service.js';

const upgradeSchema = z.object({
  plan_id: z.coerce
    .number({ invalid_type_error: 'plan_id must be a number' })
    .int({ message: 'plan_id must be an integer' })
    .positive({ message: 'plan_id must be positive' })
});

const toApiPlan = (plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  max_forms: plan.maxForms,
  max_ai_tokens: plan.maxAiTokens
});

export const listPlans = (req, res) => {
  try {
    const plans = getAvailablePlans();
    return res.json(plans.map(toApiPlan));
  } catch (error) {
    console.error('List plans error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const upgradePlan = (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { plan_id } = upgradeSchema.parse(req.body);

    const plan = upgradeUserPlan(req.user.id, plan_id);

    return res.json({
      message: 'Plano atualizado com sucesso',
      plan: plan.name
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      });
    }

    if (error.code === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }

    console.error('Upgrade plan error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
