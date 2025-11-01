import { z } from 'zod';
import { AiConfigModel } from '../models/ai_config.model.js';
import { FormModel } from '../models/form.model.js';
import { ResponseModel } from '../models/response.model.js';
import { OrchestratorService } from '../services/ai/orchestrator.service.js';
import { generateReply as generateGptReply } from '../services/gpt.service.js';
import { generateReply as generateLlamaReply } from '../services/ai/llama.service.js';

const toneEnum = ['simpático', 'formal', 'técnico', 'motivacional'];
const styleEnum = ['curta', 'detalhada', 'analítica'];
const modeEnum = ['llama', 'gpt'];

const AI_TIMEOUT_MS = 7000;
const AI_FALLBACK_QUESTION = 'Pode por favor explicar em uma única frase o que o incomodou mais?';

const configSchema = z.object({
  tone: z.enum(toneEnum),
  style: z.enum(styleEnum),
  goal: z.string().min(1).max(500),
  ai_mode: z.enum(modeEnum)
});

const withTimeout = (promise, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('AI generation timeout'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const requestAiQuestion = async (aiMode, prompt) => {
  const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
  if (!trimmedPrompt) {
    throw new Error('Prompt must be a non-empty string');
  }

  if (aiMode === 'gpt') {
    return withTimeout(generateGptReply([{ role: 'user', content: trimmedPrompt }]), AI_TIMEOUT_MS);
  }

  return withTimeout(generateLlamaReply(trimmedPrompt), AI_TIMEOUT_MS);
};

const normalizeRecentAnswers = (input) => {
  if (!Array.isArray(input)) {
    return null;
  }

  const normalized = input
    .map((entry) => ({
      question: typeof entry?.question === 'string' ? entry.question : null,
      answer: typeof entry?.answer === 'string' ? entry.answer : null,
      question_id:
        entry?.question_id !== undefined && entry?.question_id !== null
          ? Number(entry.question_id)
          : null,
      type: entry?.type ?? null
    }))
    .filter((entry) => entry.question || entry.answer);

  return normalized.length > 0 ? normalized : null;
};

const resolveNextQuestion = async (form, recentAnswers = null) => {
  const answers = recentAnswers ?? ResponseModel.getRecentAnswers(form.id, 5);
  const next = await OrchestratorService.decideNextQuestion(form.id, form.user_id, answers);

  if (next.type === 'manual') {
    return {
      type: next.type,
      question: next.question,
      ai_mode: next.ai_mode,
      meta: next.meta ?? null
    };
  }

  try {
    const aiResult = await requestAiQuestion(next.ai_mode, next.prompt);
    const question = typeof aiResult === 'string' ? aiResult.trim() : '';

    return {
      type: 'ai',
      question: question || AI_FALLBACK_QUESTION,
      ai_mode: next.ai_mode,
      meta: next.meta ?? null
    };
  } catch (error) {
    console.error('Failed to generate AI question:', error);
    return {
      type: 'ai',
      question: AI_FALLBACK_QUESTION,
      ai_mode: next.ai_mode,
      meta: next.meta ?? null
    };
  }
};

export const getConfig = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const config = AiConfigModel.getConfigByUser(userId) ?? AiConfigModel.ensureConfigForUser(userId);

    return res.json({
      tone: config.tone,
      style: config.style,
      goal: config.goal,
      ai_mode: config.ai_mode
    });
  } catch (error) {
    console.error('Failed to load AI config:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const saveConfig = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = configSchema.parse(req.body ?? {});
    AiConfigModel.upsertConfig(userId, payload);

    return res.json({ message: 'Config atualizada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      });
    }

    console.error('Failed to save AI config:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNextQuestion = async (req, res) => {
  try {
    const { id: formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'Form id is required' });
    }

    const form = FormModel.getFormById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const recentAnswersFromBody = normalizeRecentAnswers(req.body?.recentAnswers);
    const result = await resolveNextQuestion(form, recentAnswersFromBody);

    return res.json(result);
  } catch (error) {
    console.error('Failed to get next question:', error);
    return res.status(500).json({ message: 'Failed to get next question' });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    const { form_id: formId } = req.body ?? {};
    if (!formId) {
      return res.status(400).json({ message: 'form_id is required' });
    }

    const form = FormModel.getFormById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const recentAnswersFromBody = normalizeRecentAnswers(req.body?.recentAnswers);
    const result = await resolveNextQuestion(form, recentAnswersFromBody);

    return res.json(result);
  } catch (error) {
    console.error('Failed to generate AI question:', error);
    return res.status(500).json({ message: 'Failed to generate AI question' });
  }
};

export const AiController = {
  getConfig,
  saveConfig,
  getNextQuestion,
  generateQuestion
};
