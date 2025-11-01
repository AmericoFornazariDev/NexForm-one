import { generateReply as generateLlamaReply } from './llama.service.js';
import { generateReply as generateGptReply } from '../gpt.service.js';

const SUPPORTED_AI_MODES = ['llama', 'gpt'];

const normalizeMode = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (SUPPORTED_AI_MODES.includes(normalized)) {
    return normalized;
  }
  return 'llama';
};

const buildPrompt = (answersText = []) => {
  const header = 'És um analista de satisfação do cliente.';

  const entries = answersText
    .filter((text) => typeof text === 'string' && text.trim().length > 0)
    .map((text, index) => `Resposta ${index + 1}: ${text.trim()}`)
    .join('\n');

  const responsesSection = entries
    ? `Respostas recentes (mais recentes primeiro):\n${entries}`
    : 'Sem respostas disponíveis.';

  const instruction =
    'Produz um objeto JSON com as chaves summary, top_positives, top_negatives e suggested_actions. Escreve em PT-PT, de forma direta e sem rodeios.';

  const format =
    'O JSON deve seguir o formato: {"summary": string, "top_positives": string[], "top_negatives": string[], "suggested_actions": string[]}. Sem texto adicional.';

  return [header, responsesSection, instruction, format].join('\n\n');
};

const cleanJsonString = (raw) => {
  if (!raw) {
    return '';
  }

  let output = raw.trim();
  output = output.replace(/^```json\s*/i, '');
  output = output.replace(/^```\s*/i, '');
  output = output.replace(/```$/i, '');

  const firstBrace = output.indexOf('{');
  const lastBrace = output.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    output = output.slice(firstBrace, lastBrace + 1);
  }

  return output.trim();
};

const parseInsightResponse = (raw) => {
  const cleaned = cleanJsonString(raw);
  if (!cleaned) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    const topPositives = Array.isArray(parsed.top_positives)
      ? parsed.top_positives.filter((item) => typeof item === 'string' && item.trim())
      : [];
    const topNegatives = Array.isArray(parsed.top_negatives)
      ? parsed.top_negatives.filter((item) => typeof item === 'string' && item.trim())
      : [];
    const actions = Array.isArray(parsed.suggested_actions)
      ? parsed.suggested_actions.filter((item) => typeof item === 'string' && item.trim())
      : [];

    return {
      summary,
      top_positives: topPositives,
      top_negatives: topNegatives,
      suggested_actions: actions
    };
  } catch (error) {
    return null;
  }
};

const requestAiSummary = async (mode, prompt) => {
  if (mode === 'gpt') {
    return generateGptReply([{ role: 'user', content: prompt }]);
  }
  return generateLlamaReply(prompt);
};

const generate = async ({ aiMode, answersText }) => {
  const normalizedMode = normalizeMode(aiMode);
  const texts = Array.isArray(answersText) ? answersText.filter(Boolean) : [];

  if (texts.length === 0) {
    throw new Error('answersText must contain at least one entry');
  }

  const prompt = buildPrompt(texts);
  const raw = await requestAiSummary(normalizedMode, prompt);
  const parsed = parseInsightResponse(raw);

  if (!parsed) {
    throw new Error('Failed to parse AI insight response');
  }

  return {
    ...parsed,
    ai_mode: normalizedMode
  };
};

export const InsightService = {
  generate
};
