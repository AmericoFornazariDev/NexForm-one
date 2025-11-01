import { getDb } from '../config/db.js';

const TABLE = 'forms';

const mapForm = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    title: row.title,
    description: row.description,
    qr_url: row.qr_url,
    qr_code: row.qr_code,
    ai_mode: row.ai_mode,
    created_at: row.created_at
  };
};

export const createForm = (
  userId,
  title,
  description,
  aiMode = 'llama',
  qrUrl = null,
  qrCode = null
) => {
  const db = getDb();
  const numericUserId = Number(userId);
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (user_id, title, description, ai_mode, qr_url, qr_code) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const result = statement.run(
    numericUserId,
    title,
    description,
    aiMode,
    qrUrl,
    qrCode
  );

  return getFormById(Number(result.lastInsertRowid));
};

export const updateQrCode = (formId, qrCode) => {
  const db = getDb();
  const statement = db.prepare(`UPDATE ${TABLE} SET qr_code = ? WHERE id = ?`);
  statement.run(qrCode, Number(formId));
  return getFormById(Number(formId));
};

export const getFormsByUser = (userId) => {
  const db = getDb();
  const numericUserId = Number(userId);
  const rows = db
    .prepare(
      `SELECT id, user_id, title, description, qr_url, qr_code, ai_mode, created_at FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(numericUserId);

  return rows.map(mapForm);
};

export const getFormById = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, user_id, title, description, qr_url, qr_code, ai_mode, created_at FROM ${TABLE} WHERE id = ?`
    )
    .get(Number(id));

  return mapForm(row);
};

export const deleteForm = (id, userId) => {
  const db = getDb();
  const statement = db.prepare(`DELETE FROM ${TABLE} WHERE id = ? AND user_id = ?`);
  const result = statement.run(Number(id), Number(userId));
  return result.changes > 0;
};

export const FormModel = {
  createForm,
  updateQrCode,
  getFormsByUser,
  getFormById,
  deleteForm
};
