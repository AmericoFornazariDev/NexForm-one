import QRCode from 'qrcode';
import { FormModel } from '../models/form.model.js';
import { checkPlanLimit } from '../services/plan.service.js';

const ALLOWED_AI_MODES = ['llama', 'gpt'];

const buildResponsePayload = (form) => {
  if (!form) {
    return null;
  }

  const { id, title, description, qr_url: qrUrl, qr_code: qrCode, ai_mode: aiMode } = form;

  return {
    id,
    title,
    description,
    qr_url: qrUrl,
    qr_code: qrCode,
    ai_mode: aiMode
  };
};

const normalizeAiMode = (value) => {
  if (!value) {
    return 'llama';
  }

  const normalized = String(value).toLowerCase();
  return ALLOWED_AI_MODES.includes(normalized) ? normalized : null;
};

export const createForm = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, description = '', ai_mode: aiModeInput } = req.body ?? {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Invalid title' });
  }

  if (typeof description !== 'string') {
    return res.status(400).json({ message: 'Invalid description' });
  }

  const aiMode = normalizeAiMode(aiModeInput);

  if (!aiMode) {
    return res.status(400).json({ message: 'Invalid ai_mode' });
  }

  const withinPlan = checkPlanLimit(userId);

  if (!withinPlan) {
    return res.status(403).json({ message: 'Plan limit reached' });
  }

  try {
    const form = FormModel.createForm(
      userId,
      title.trim(),
      description.trim(),
      aiMode,
      null
    );

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formLink = `${baseUrl}/form/${form.id}`;
    const qrCodeData = await QRCode.toDataURL(formLink);

    const formWithQr = FormModel.updateQrCode(form.id, qrCodeData);

    formWithQr.qr_code = qrCodeData;

    return res.status(201).json(buildResponsePayload(formWithQr));
  } catch (error) {
    console.error('Failed to create form:', error);
    return res.status(500).json({ message: 'Failed to create form' });
  }
};

export const getForms = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const forms = FormModel.getFormsByUser(userId)
    .map(buildResponsePayload)
    .filter(Boolean);
  return res.json(forms);
};

export const getFormById = (req, res) => {
  const { id } = req.params;
  const form = FormModel.getFormById(id);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  return res.json(buildResponsePayload(form));
};

export const deleteForm = (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const form = FormModel.getFormById(id);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  if (form.user_id !== Number(userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const deleted = FormModel.deleteForm(form.id, userId);

  if (!deleted) {
    return res.status(500).json({ message: 'Failed to delete form' });
  }

  return res.status(204).send();
};
