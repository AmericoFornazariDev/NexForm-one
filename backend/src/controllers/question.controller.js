import { z } from 'zod';
import { FormModel } from '../models/form.model.js';
import { MerchantQuestionModel } from '../models/merchant_question.model.js';

const toFlag = (value) => (Number(value) === 1 ? 1 : 0);

const createSchema = z.object({
  question: z.string().min(1).max(500),
  sort_order: z
    .preprocess((value) => Number(value ?? 0), z.number().int().min(0))
    .default(0),
  is_required: z
    .preprocess((value) => toFlag(value ?? 0), z.number().int().min(0).max(1))
    .default(0),
  is_active: z
    .preprocess((value) => toFlag(value ?? 1), z.number().int().min(0).max(1))
    .default(1)
});

const updateSchema = z
  .object({
    question: z.string().min(1).max(500).optional(),
    sort_order: z
      .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().int().min(0))
      .optional(),
    is_required: z
      .preprocess((value) => (value === undefined ? undefined : toFlag(value)), z.number().int().min(0).max(1))
      .optional(),
    is_active: z
      .preprocess((value) => (value === undefined ? undefined : toFlag(value)), z.number().int().min(0).max(1))
      .optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  });

const ensureFormOwnership = (formId, userId) => {
  const form = FormModel.getFormById(formId);
  if (!form) {
    return { error: { status: 404, message: 'Form not found' } };
  }

  if (form.user_id !== Number(userId)) {
    return { error: { status: 403, message: 'Forbidden' } };
  }

  return { form };
};

export const listQuestions = (req, res) => {
  try {
    const { id: formId } = req.params;
    const userId = req.user?.id;

    const { error } = ensureFormOwnership(formId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const questions = MerchantQuestionModel.getQuestionsByForm(formId);
    return res.json(
      questions.map((question) => ({
        id: question.id,
        question: question.question,
        sort_order: question.sort_order,
        is_required: question.is_required,
        is_active: question.is_active
      }))
    );
  } catch (error) {
    console.error('Failed to list questions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createQuestion = (req, res) => {
  try {
    const { id: formId } = req.params;
    const userId = req.user?.id;

    const { error } = ensureFormOwnership(formId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const payload = createSchema.parse(req.body ?? {});
    const created = MerchantQuestionModel.createQuestion(formId, userId, payload);

    return res.status(201).json({
      id: created.id,
      question: created.question,
      sort_order: created.sort_order,
      is_required: created.is_required,
      is_active: created.is_active
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      });
    }

    console.error('Failed to create question:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuestion = (req, res) => {
  try {
    const { qid } = req.params;
    const userId = req.user?.id;
    const question = MerchantQuestionModel.getQuestionById(qid);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { error } = ensureFormOwnership(question.form_id, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const payload = updateSchema.parse(req.body ?? {});
    const updated = MerchantQuestionModel.updateQuestion(qid, userId, {
      question: payload.question ?? question.question,
      sort_order: payload.sort_order ?? question.sort_order,
      is_required: payload.is_required ?? question.is_required,
      is_active: payload.is_active ?? question.is_active
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update question' });
    }

    return res.json({
      id: updated.id,
      question: updated.question,
      sort_order: updated.sort_order,
      is_required: updated.is_required,
      is_active: updated.is_active
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      });
    }

    console.error('Failed to update question:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuestion = (req, res) => {
  try {
    const { qid } = req.params;
    const userId = req.user?.id;
    const question = MerchantQuestionModel.getQuestionById(qid);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { error } = ensureFormOwnership(question.form_id, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const success = MerchantQuestionModel.deactivateQuestion(qid, userId);

    if (!success) {
      return res.status(500).json({ message: 'Failed to delete question' });
    }

    return res.json({ message: 'Question removed successfully' });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const QuestionController = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
