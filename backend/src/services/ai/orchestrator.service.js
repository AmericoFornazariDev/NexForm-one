import { FormModel } from '../../models/form.model.js';
import { AiConfigModel } from '../../models/ai_config.model.js';
import { MerchantQuestionModel } from '../../models/merchant_question.model.js';

const SUPPORTED_AI_MODES = ['llama', 'gpt'];

const normalizeMode = (mode) => {
  const normalized = String(mode ?? '').trim().toLowerCase();
  if (SUPPORTED_AI_MODES.includes(normalized)) {
    return normalized;
  }
  return 'llama';
};

const buildPrompt = (config, recentAnswers = []) => {
  const tone = config?.tone ?? AiConfigModel.DEFAULT_CONFIG.tone;
  const style = config?.style ?? AiConfigModel.DEFAULT_CONFIG.style;
  const goal = config?.goal ?? AiConfigModel.DEFAULT_CONFIG.goal;

  const intro = `Você é uma IA que conduz um inquérito de satisfação com tom ${tone}, estilo ${style} e objetivo focado em ${goal}.`;

  const recent = (recentAnswers ?? [])
    .slice(-5)
    .map((item, index) => {
      const q = item?.question ? `Pergunta ${index + 1}: ${item.question}` : null;
      const a = item?.answer ? `Resposta: ${item.answer}` : null;
      return [q, a].filter(Boolean).join(' ');
    })
    .filter(Boolean);

  const history = recent.length > 0 ? `Histórico recente:\n${recent.join('\n')}` : '';

  const instruction = 'Gere APENAS a próxima pergunta objetiva para continuar um inquérito de satisfação. Sem explicações.';

  return [intro, history, instruction].filter(Boolean).join('\n\n');
};

export const decideNextQuestion = async (formId, userIdOrNull = null, recentAnswers = []) => {
  const form = FormModel.getFormById(formId);
  if (!form) {
    throw new Error('Form not found');
  }

  const ownerId = form.user_id ?? userIdOrNull;
  const aiConfig = ownerId ? AiConfigModel.getConfigByUser(ownerId) : null;
  const resolvedMode = normalizeMode(form.ai_mode ?? aiConfig?.ai_mode ?? 'llama');

  const answeredManualIds = (recentAnswers ?? [])
    .map((entry) => (entry?.type === 'manual' && entry?.question_id ? Number(entry.question_id) : null))
    .filter((value) => Number.isInteger(value));

  const manualQuestion = MerchantQuestionModel.getNextPendingQuestion(form.id, answeredManualIds);
  if (manualQuestion) {
    return {
      type: 'manual',
      question: manualQuestion.question,
      ai_mode: resolvedMode,
      meta: {
        question_id: manualQuestion.id,
        is_required: manualQuestion.is_required === 1
      }
    };
  }

  const prompt = buildPrompt(aiConfig ?? AiConfigModel.DEFAULT_CONFIG, recentAnswers);

  return {
    type: 'ai',
    prompt,
    ai_mode: resolvedMode,
    meta: {
      tone: aiConfig?.tone ?? AiConfigModel.DEFAULT_CONFIG.tone,
      style: aiConfig?.style ?? AiConfigModel.DEFAULT_CONFIG.style,
      goal: aiConfig?.goal ?? AiConfigModel.DEFAULT_CONFIG.goal
    }
  };
};

export const OrchestratorService = {
  decideNextQuestion
};
