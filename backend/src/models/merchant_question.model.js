import { getDb } from '../config/db.js';

const TABLE = 'merchant_questions';

const mapQuestion = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    form_id: Number(row.form_id),
    user_id: Number(row.user_id),
    question: row.question,
    sort_order: Number(row.sort_order ?? 0),
    is_required: Number(row.is_required ?? 0) === 1 ? 1 : 0,
    is_active: Number(row.is_active ?? 0) === 1 ? 1 : 0,
    created_at: row.created_at
  };
};

export const getQuestionsByForm = (formId, { onlyActive = false } = {}) => {
  const db = getDb();
  let query = `SELECT * FROM ${TABLE} WHERE form_id = ?`;
  if (onlyActive) {
    query += ' AND is_active = 1';
  }
  query += ' ORDER BY sort_order ASC, id ASC';

  const rows = db.prepare(query).all(Number(formId));
  return rows.map(mapQuestion).filter(Boolean);
};

export const getQuestionById = (questionId) => {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM ${TABLE} WHERE id = ?`)
    .get(Number(questionId));
  return mapQuestion(row);
};

export const createQuestion = (formId, userId, { question, sort_order, is_required, is_active }) => {
  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (form_id, user_id, question, sort_order, is_required, is_active) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = statement.run(
    Number(formId),
    Number(userId),
    question,
    Number(sort_order ?? 0),
    Number(is_required ?? 0) === 1 ? 1 : 0,
    Number(is_active ?? 1) === 1 ? 1 : 0
  );

  return getQuestionById(Number(result.lastInsertRowid));
};

export const updateQuestion = (
  questionId,
  userId,
  { question, sort_order, is_required, is_active }
) => {
  const db = getDb();
  const statement = db.prepare(
    `UPDATE ${TABLE} SET question = ?, sort_order = ?, is_required = ?, is_active = ? WHERE id = ? AND user_id = ?`
  );
  statement.run(
    question,
    Number(sort_order ?? 0),
    Number(is_required ?? 0) === 1 ? 1 : 0,
    Number(is_active ?? 1) === 1 ? 1 : 0,
    Number(questionId),
    Number(userId)
  );

  return getQuestionById(questionId);
};

export const deactivateQuestion = (questionId, userId) => {
  const db = getDb();
  const statement = db.prepare(
    `UPDATE ${TABLE} SET is_active = 0 WHERE id = ? AND user_id = ?`
  );
  const result = statement.run(Number(questionId), Number(userId));
  return result.changes > 0;
};

export const getNextPendingQuestion = (formId, excludeIds = []) => {
  const db = getDb();
  const excluded = Array.isArray(excludeIds)
    ? excludeIds.filter((value) => Number.isInteger(Number(value))).map((value) => Number(value))
    : [];

  const exclusionClause = excluded.length > 0
    ? `AND mq.id NOT IN (${excluded.map(() => '?').join(', ')})`
    : '';

  const row = db
    .prepare(
      `SELECT mq.*
       FROM ${TABLE} mq
       WHERE mq.form_id = ?
         AND mq.is_active = 1
          AND NOT EXISTS (
            SELECT 1 FROM asked_questions aq
            WHERE aq.form_id = mq.form_id AND aq.question_id = mq.id
          )
          ${exclusionClause}
       ORDER BY mq.sort_order ASC, mq.id ASC
       LIMIT 1`
    )
    .get(Number(formId), ...excluded);

  return mapQuestion(row);
};

export const MerchantQuestionModel = {
  getQuestionsByForm,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deactivateQuestion,
  getNextPendingQuestion
};
