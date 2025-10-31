import { ResponseModel } from '../models/response.model.js';
import { FormModel } from '../models/form.model.js';
import { generateReply as generateLlamaReply } from '../services/ai/llama.service.js';
import { generateReply as generateGptReply } from '../services/ai/gpt.service.js';
import { ENV } from '../config/env.js';

const SUPPORTED_AI_MODES = ['llama', 'gpt'];

const resolveAiMode = (formAiMode) => {
  const normalized = String(formAiMode ?? '')
    .trim()
    .toLowerCase();

  if (SUPPORTED_AI_MODES.includes(normalized)) {
    return normalized;
  }

  return ENV.aiMode;
};

export const handleResponse = async (req, res) => {
  const { id: formId } = req.params;
  const { user_input: userInput } = req.body ?? {};

  if (!formId) {
    return res.status(400).json({ message: 'Form id is required' });
  }

  if (typeof userInput !== 'string' || !userInput.trim()) {
    return res.status(400).json({ message: 'user_input must be a non-empty string' });
  }

  const form = FormModel.getFormById(formId);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  const aiMode = resolveAiMode(form.ai_mode);

  let reply;

  try {
    if (aiMode === 'gpt') {
      reply = await generateGptReply(userInput);
    } else {
      reply = await generateLlamaReply(userInput);
    }
  } catch (error) {
    console.error('Failed to generate AI reply:', error);
    return res.status(500).json({ message: 'Failed to generate reply' });
  }

  const payload = {
    user_input: userInput,
    reply,
    ai_mode: aiMode
  };

  const aiContext = `User: ${userInput}\nAI (${aiMode}): ${reply}`;

  try {
    ResponseModel.saveResponse(form.id, payload, aiContext);
  } catch (error) {
    console.error('Failed to save response:', error);
    return res.status(500).json({ message: 'Failed to save response' });
  }

  return res.json({ reply, ai_mode: aiMode });
};
