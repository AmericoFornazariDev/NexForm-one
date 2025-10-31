import { getDb } from '../config/db.js';

const TABLE = 'responses';

const parseData = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const mapResponse = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    form_id: Number(row.form_id),
    data: parseData(row.data),
    ai_context: row.ai_context,
    created_at: row.created_at
  };
};

export const saveResponse = (formId, data, aiContext = null) => {
  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (form_id, data, ai_context) VALUES (?, ?, ?)`
  );

  const serialized = typeof data === 'string' ? data : JSON.stringify(data ?? {});

  const result = statement.run(Number(formId), serialized, aiContext);

  const row = db
    .prepare(
      `SELECT id, form_id, data, ai_context, created_at FROM ${TABLE} WHERE id = ?`
    )
    .get(Number(result.lastInsertRowid));

  return mapResponse(row);
};

export const getResponsesByForm = (formId) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, form_id, data, ai_context, created_at FROM ${TABLE} WHERE form_id = ? ORDER BY created_at ASC`
    )
    .all(Number(formId));

  return rows.map(mapResponse).filter(Boolean);
};

export const getRecentAnswers = (formId, limit = 5) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, form_id, data, created_at FROM ${TABLE} WHERE form_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(Number(formId), Number(limit));

  return rows
    .map(mapResponse)
    .filter(Boolean)
    .map((response) => {
      const payload = response.data ?? {};
      return {
        question_id: payload.question_id ?? null,
        type: payload.type ?? null,
        question: payload.question ?? payload.prompt ?? null,
        answer: payload.answer ?? payload.user_input ?? payload.reply ?? null
      };
    })
    .filter((item) => item.question || item.answer)
    .reverse();
};

export const ResponseModel = {
  saveResponse,
  getResponsesByForm,
  getRecentAnswers
};
