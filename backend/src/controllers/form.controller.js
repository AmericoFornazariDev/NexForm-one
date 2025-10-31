import { FormModel } from '../models/form.model.js';
import { PlanService } from '../services/plan.service.js';
import { generateQRCode, deleteQRCodeFile } from '../services/qr.service.js';

const ALLOWED_AI_MODES = ['llama', 'gpt'];

const normalizeAiMode = (aiMode) => {
  if (!aiMode) {
    return 'llama';
  }

  const normalized = String(aiMode).toLowerCase();
  return ALLOWED_AI_MODES.includes(normalized) ? normalized : null;
};

export const listForms = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const forms = FormModel.getFormsByUserId(userId);
  return res.json(forms);
};

export const createForm = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, description = '', ai_mode: aiModeInput } = req.body ?? {};
  const normalizedDescription =
    typeof description === 'string' ? description : String(description ?? '');

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'Title is required' });
  }

  const aiMode = normalizeAiMode(aiModeInput);

  if (!aiMode) {
    return res.status(400).json({ message: 'Invalid ai_mode provided' });
  }

  const canCreate = PlanService.checkPlanLimit(userId);

  if (!canCreate) {
    return res.status(403).json({ message: 'Form limit reached for the current plan' });
  }

  try {
    const sanitizedTitle = title.trim();

    if (!sanitizedTitle) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const createdForm = FormModel.createForm(userId, sanitizedTitle, normalizedDescription, aiMode);

    const qrUrl = await generateQRCode(createdForm.id);
    const formWithQr = FormModel.updateQrUrl(createdForm.id, qrUrl);

    return res.status(201).json(formWithQr);
  } catch (error) {
    console.error('Failed to create form:', error);
    return res.status(500).json({ message: 'Failed to create form' });
  }
};

export const getForm = (req, res) => {
  const { id } = req.params;
  const form = FormModel.getFormById(Number(id));

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  return res.json(form);
};

export const deleteForm = (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const form = FormModel.getFormById(Number(id));

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  if (form.userId !== Number(userId)) {
    return res.status(403).json({ message: 'Not allowed to delete this form' });
  }

  const deleted = FormModel.deleteFormById(form.id);

  if (deleted) {
    deleteQRCodeFile(form.qrUrl);
    return res.status(204).send();
  }

  return res.status(500).json({ message: 'Failed to delete form' });
};
