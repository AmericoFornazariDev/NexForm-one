import { z } from 'zod';
import { ResponseModel } from '../models/response.model.js';
import { FormModel } from '../models/form.model.js';
import { AskedQuestionModel } from '../models/asked_question.model.js';
import { MerchantQuestionModel } from '../models/merchant_question.model.js';
import { OrchestratorService } from '../services/ai/orchestrator.service.js';
import { generateReply as generateGptReply } from '../services/gpt.service.js';
import { generateReply as generateLlamaReply } from '../services/ai/llama.service.js';

const AI_TIMEOUT_MS = 2000;
const AI_FALLBACK_QUESTION = 'Pode por favor explicar em uma única frase o que o incomodou mais?';

const withTimeout = (promise, timeoutMs) =>
  new Promise((resolve, reject) => {
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

const responseSchema = z.object({
  type: z.enum(['manual', 'ai']).default('ai'),
  question_id: z
    .preprocess((value) => (value === undefined || value === null ? undefined : Number(value)), z.number().int().positive())
    .optional(),
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1),
  ai_mode: z.enum(['llama', 'gpt']).optional()
});

export const handleResponse = async (req, res) => {
  try {
    const { id: formId } = req.params;
    if (!formId) {
      return res.status(400).json({ message: 'Form id is required' });
    }

    const form = FormModel.getFormById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const payload = responseSchema.parse(req.body ?? {});

    if (payload.type === 'manual' && !payload.question_id) {
      return res.status(400).json({ message: 'question_id is required for manual responses' });
    }

    let questionText = payload.question ?? null;

    if (payload.type === 'manual') {
      const manualQuestion = MerchantQuestionModel.getQuestionById(payload.question_id);
      if (!manualQuestion || manualQuestion.form_id !== Number(form.id)) {
        return res.status(400).json({ message: 'Invalid manual question reference' });
      }
      questionText = questionText ?? manualQuestion.question;
    }

    if (!questionText) {
      return res.status(400).json({ message: 'question is required' });
    }

    const storedPayload = {
      type: payload.type,
      question: questionText,
      question_id: payload.question_id ?? null,
      answer: payload.answer,
      ai_mode: payload.ai_mode ?? null
    };

    const saved = ResponseModel.saveResponse(form.id, storedPayload, null);

    if (payload.type === 'manual' && payload.question_id) {
      AskedQuestionModel.markAsked(form.id, payload.question_id, saved?.id);
    }

    const recentAnswers = ResponseModel.getRecentAnswers(form.id, 5);
    const next = await OrchestratorService.decideNextQuestion(form.id, form.user_id, recentAnswers);

    let nextQuestionText = null;
    let nextAiMode = next.ai_mode;

    if (next.type === 'manual') {
      nextQuestionText = next.question;
    } else {
      try {
        const aiResult = await requestAiQuestion(next.ai_mode, next.prompt);
        nextQuestionText = typeof aiResult === 'string' ? aiResult.trim() : '';
      } catch (error) {
        console.error('Failed to generate AI question after response:', error);
        nextQuestionText = '';
      }

      if (!nextQuestionText) {
        nextQuestionText = AI_FALLBACK_QUESTION;
      }
    }

    return res.json({
      saved: true,
      next: {
        type: next.type,
        question: nextQuestionText,
        ai_mode: nextAiMode
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      });
    }

    console.error('Failed to handle response:', error);
    return res.status(500).json({ message: 'Failed to handle response' });
  }
};
