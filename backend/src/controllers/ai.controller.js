import { z } from 'zod';
import { AiConfigModel } from '../models/ai_config.model.js';
import { FormModel } from '../models/form.model.js';
import { ResponseModel } from '../models/response.model.js';
import { OrchestratorService } from '../services/ai/orchestrator.service.js';

const toneEnum = ['simpático', 'formal', 'técnico', 'motivacional'];
const styleEnum = ['curta', 'detalhada', 'analítica'];
const modeEnum = ['llama', 'gpt'];

const configSchema = z.object({
  tone: z.enum(toneEnum),
  style: z.enum(styleEnum),
  goal: z.string().min(1).max(500),
  ai_mode: z.enum(modeEnum)
});

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

    const recentAnswersFromBody = Array.isArray(req.body?.recentAnswers)
      ? req.body.recentAnswers
          .map((entry) => ({
            question: typeof entry?.question === 'string' ? entry.question : null,
            answer: typeof entry?.answer === 'string' ? entry.answer : null,
            question_id:
              entry?.question_id !== undefined && entry?.question_id !== null
                ? Number(entry.question_id)
                : null,
            type: entry?.type ?? null
          }))
          .filter((entry) => entry.question || entry.answer)
      : null;

    const recentAnswers = recentAnswersFromBody ?? ResponseModel.getRecentAnswers(formId, 5);
    const nextQuestion = await OrchestratorService.decideNextQuestion(
      form.id,
      form.user_id,
      recentAnswers
    );

    return res.json({
      type: nextQuestion.type,
      question: nextQuestion.question,
      ai_mode: nextQuestion.ai_mode,
      meta: nextQuestion.meta ?? null
    });
  } catch (error) {
    console.error('Failed to get next question:', error);
    return res.status(500).json({ message: 'Failed to get next question' });
  }
};

export const AiController = {
  getConfig,
  saveConfig,
  getNextQuestion
};
