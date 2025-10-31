import { FormModel } from '../models/form.model.js';
import { ResponseModel } from '../models/response.model.js';
import { SentimentModel } from '../models/sentiment.model.js';
import { analyzeResponses } from '../services/ai/sentiment.service.js';

const extractAnswer = (response) => {
  const payload = response?.data;

  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  const candidates = [
    payload.answer,
    payload.user_input,
    payload.reply,
    payload.response,
    payload.text
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (typeof payload === 'object') {
    const values = Object.values(payload)
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value.trim());

    if (values.length > 0) {
      return values[0];
    }
  }

  return '';
};

export const analyzeFormSentiment = async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(400).json({ message: 'Formulário inválido.' });
  }

  const form = FormModel.getFormById(formId);

  if (!form) {
    return res.status(404).json({ message: 'Formulário não encontrado.' });
  }

  if (!req.user || Number(form.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Acesso negado a este formulário.' });
  }

  const responses = ResponseModel.getResponsesByForm(form.id);
  const normalized = responses
    .map((response) => ({ id: response.id, text: extractAnswer(response) }))
    .filter((item) => item.text);

  if (normalized.length === 0) {
    SentimentModel.replaceFormSentiments(form.id, []);
    return res.json({ analyzed: 0, message: 'Nenhuma resposta encontrada para analisar.' });
  }

  const overrideMode = req.body?.aiMode ?? req.query?.aiMode;
  const aiMode = typeof overrideMode === 'string' && overrideMode.trim()
    ? overrideMode.trim().toLowerCase()
    : form.ai_mode ?? 'llama';

  try {
    const results = await analyzeResponses(form.id, aiMode, normalized);
    return res.json({ analyzed: results.length, results });
  } catch (error) {
    console.error('Failed to analyze sentiments', error);
    return res
      .status(500)
      .json({ message: 'Não foi possível analisar os sentimentos das respostas.' });
  }
};

export const getFormSentimentTrend = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(400).json({ message: 'Formulário inválido.' });
  }

  const form = FormModel.getFormById(formId);

  if (!form) {
    return res.status(404).json({ message: 'Formulário não encontrado.' });
  }

  if (!req.user || Number(form.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Acesso negado a este formulário.' });
  }

  const trend = SentimentModel.getTrendByForm(form.id);
  const totals = SentimentModel.getTotalsByForm(form.id);

  return res.json({ trend, totals });
};
