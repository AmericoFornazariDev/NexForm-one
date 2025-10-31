import { planModel } from '../models/plan.model.js';
import { updateUserPlan } from '../models/user.model.js';

export const getPlans = (req, res) => {
  try {
    const plans = planModel.getAllPlans();
    return res.json(plans);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const upgradePlan = (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const { plan_id: planIdInput } = req.body ?? {};

    if (planIdInput === undefined) {
      return res.status(400).json({ message: 'plan_id é obrigatório' });
    }

    const planId = Number(planIdInput);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res
        .status(400)
        .json({ message: 'plan_id deve ser um número inteiro positivo' });
    }

    const plan = planModel.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    const updated = updateUserPlan(req.user.id, planId);

    if (!updated) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    return res.json({
      message: 'Plano atualizado com sucesso',
      plan: plan.name
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
