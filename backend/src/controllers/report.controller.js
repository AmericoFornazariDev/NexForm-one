import { ResponseModel } from '../models/response.model.js';
import { FormModel } from '../models/form.model.js';
import { AiConfigModel } from '../models/ai_config.model.js';
import { InsightService } from '../services/ai/insight.service.js';
import { ENV } from '../config/env.js';

const normalizeMode = (mode) => {
  const value = String(mode ?? '').trim().toLowerCase();
  return value === 'gpt' ? 'gpt' : 'llama';
};

const ensureOwnership = (form, userId) => {
  if (!form) {
    return { status: 404, message: 'Formulário não encontrado' };
  }

  if (Number(form.user_id) !== Number(userId)) {
    return { status: 403, message: 'Acesso negado a este formulário' };
  }

  return null;
};

const computeNps = (buckets) => {
  if (!buckets) {
    return null;
  }

  const { promoters = 0, passives = 0, detractors = 0, total = 0 } = buckets;
  if (!total) {
    return null;
  }

  const promotersPct = (promoters / total) * 100;
  const detractorsPct = (detractors / total) * 100;

  return {
    promoters,
    passives,
    detractors,
    score: Number((promotersPct - detractorsPct).toFixed(2))
  };
};

const extractAnswerText = (payload) => {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload.trim();
  }

  const candidate =
    typeof payload.answer === 'string'
      ? payload.answer
      : typeof payload.user_input === 'string'
      ? payload.user_input
      : typeof payload.reply === 'string'
      ? payload.reply
      : typeof payload.value === 'string'
      ? payload.value
      : null;

  if (candidate) {
    return candidate.trim();
  }

  try {
    return JSON.stringify(payload);
  } catch (error) {
    return '';
  }
};

const parseLimit = (value, defaultValue = 200) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || Number.isNaN(numeric)) {
    return defaultValue;
  }

  const bounded = Math.min(Math.max(Math.floor(numeric), 1), 500);
  return bounded;
};

export const overview = (req, res) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'formId é obrigatório' });
    }

    const form = FormModel.getFormById(formId);
    const ownershipError = ensureOwnership(form, req.user?.id);
    if (ownershipError) {
      return res.status(ownershipError.status).json({ message: ownershipError.message });
    }

    const totalsAll = ResponseModel.countByForm(form.id);
    const totals7d = ResponseModel.countByFormSince(form.id, 7);
    const totals30d = ResponseModel.countByFormSince(form.id, 30);
    const npsBuckets = ResponseModel.extractNPSBuckets(form.id);
    const nps = computeNps(npsBuckets);
    const recent = ResponseModel.findRecentByForm(form.id, 5);

    return res.json({
      totals: {
        responses: totalsAll,
        last7d: totals7d,
        last30d: totals30d
      },
      nps,
      recent
    });
  } catch (error) {
    console.error('Failed to build report overview:', error);
    return res.status(500).json({ message: 'Erro ao gerar overview do relatório' });
  }
};

export const insights = async (req, res) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'formId é obrigatório' });
    }

    const form = FormModel.getFormById(formId);
    const ownershipError = ensureOwnership(form, req.user?.id);
    if (ownershipError) {
      return res.status(ownershipError.status).json({ message: ownershipError.message });
    }

    const limit = parseLimit(req.body?.limit, 200);

    const responses = ResponseModel.getResponsesByForm(form.id);
    if (!responses.length) {
      return res.status(400).json({ message: 'Sem dados suficientes' });
    }

    const recent = responses
      .slice(Math.max(responses.length - limit, 0))
      .reverse();

    const answersText = recent
      .map((entry) => extractAnswerText(entry?.data))
      .map((text) => (typeof text === 'string' ? text.trim() : ''))
      .filter((text) => text.length > 0);

    if (!answersText.length) {
      return res.status(400).json({ message: 'Sem dados suficientes' });
    }

    const aiConfig = AiConfigModel.getConfigByUser(form.user_id);
    const resolvedMode = normalizeMode(form.ai_mode ?? aiConfig?.ai_mode ?? ENV.aiMode);
    const insight = await InsightService.generate({ aiMode: resolvedMode, answersText });

    return res.json(insight);
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return res.status(500).json({ message: 'Erro ao gerar insights' });
  }
};
