import { PlanModel } from '../models/plan.model.js';
import { getUserById, updateUserPlan } from '../models/user.model.js';
import { getDb } from '../config/db.js';

export const getAvailablePlans = () => {
  return PlanModel.getAllPlans();
};

export const upgradeUserPlan = (userId, planId) => {
  const user = getUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const plan = PlanModel.getPlanById(planId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.code = 'PLAN_NOT_FOUND';
    throw error;
  }

  updateUserPlan(userId, planId);

  return plan;
};

export const checkPlanLimit = (userId) => {
  const user = getUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const plan = PlanModel.getPlanById(user.planId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.code = 'PLAN_NOT_FOUND';
    throw error;
  }

  if (plan.maxForms === -1) {
    return true;
  }

  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) as total FROM forms WHERE user_id = ?')
    .get(userId);

  const totalForms = row?.total ?? 0;

  return totalForms < plan.maxForms;
};

export const PlanService = {
  getAvailablePlans,
  upgradeUserPlan,
  checkPlanLimit
};
