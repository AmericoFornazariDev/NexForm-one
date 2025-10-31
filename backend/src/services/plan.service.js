import { planModel } from '../models/plan.model.js';
import { getUserById } from '../models/user.model.js';
import { getDb } from '../config/db.js';

export const checkPlanLimit = (userId) => {
  const user = getUserById(userId);

  if (!user) {
    return false;
  }

  const plan = user.planId ? planModel.getPlanById(user.planId) : null;

  if (!plan || plan.max_forms == null) {
    return true;
  }

  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) as total FROM forms WHERE user_id = ?')
    .get(userId);

  const totalForms = row?.total ?? 0;

  return Number(totalForms) < Number(plan.max_forms);
};

export const PlanService = {
  checkPlanLimit
};
