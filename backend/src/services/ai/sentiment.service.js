import * as gptService from './gpt.service.js';
import * as llamaService from './llama.service.js';
import { SentimentModel } from '../../models/sentiment.model.js';

const SENTIMENT_VALUES = new Set(['positivo', 'neutro', 'negativo']);

const normalizeEntries = (answersText) => {
  if (!Array.isArray(answersText)) {
    return [];
  }

  return answersText
    .map((item) => {
      if (typeof item === 'string') {
        return { id: null, text: item.trim() };
      }

      if (item && typeof item === 'object') {
        const id = item.response_id ?? item.responseId ?? item.id ?? null;
        const rawText =
          item.text ?? item.answer ?? item.content ?? item.value ?? item.response ?? '';
        return {
          id: Number.isFinite(Number(id)) ? Number(id) : null,
          text: typeof rawText === 'string' ? rawText.trim() : String(rawText ?? '').trim()
        };
      }

      return { id: null, text: '' };
    })
    .filter((entry) => entry.text);
};

const pickModel = (aiMode) => {
  return aiMode === 'gpt' ? gptService : llamaService;
};

const normalizeSentiment = (value) => {
  if (!value) {
    return 'neutro';
  }

  const parsed = String(value).trim().toLowerCase();
  if (SENTIMENT_VALUES.has(parsed)) {
    return parsed;
  }

  if (parsed.includes('pos')) {
    return 'positivo';
  }

  if (parsed.includes('neg')) {
    return 'negativo';
  }

  return 'neutro';
};

export async function analyzeResponses(formId, aiMode, answersText) {
  const entries = normalizeEntries(answersText);

  if (entries.length === 0) {
    SentimentModel.replaceFormSentiments(formId, []);
    return [];
  }

  const model = pickModel(aiMode);
  const prompt = `
  Classifica o sentimento de cada resposta (positivo, neutro ou negativo).
  Retorna JSON no formato:
  [{"sentiment":"positivo","confidence":0.9}, ...]
  Respostas:
  ${entries.map((item, index) => `${index + 1}. ${item.text}`).join('\n')}
  `;

  const raw = await model.generateReply(prompt);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error('AI response is not valid JSON for sentiment analysis');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI sentiment response must be an array');
  }

  const combined = entries.map((entry, index) => {
    const result = parsed[index] ?? {};
    const sentiment = normalizeSentiment(result?.sentiment);
    const confidenceValue = Number(result?.confidence ?? result?.score ?? 0);

    return {
      response_id: entry.id,
      sentiment,
      confidence: Number.isFinite(confidenceValue) ? confidenceValue : 0
    };
  });

  SentimentModel.replaceFormSentiments(formId, combined);

  return combined;
}
