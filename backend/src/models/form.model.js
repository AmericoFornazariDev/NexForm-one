import { getDb } from '../config/db.js';

const TABLE = 'forms';

const mapForm = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    title: row.title,
    description: row.description,
    qrUrl: row.qr_url,
    aiMode: row.ai_mode,
    createdAt: row.created_at
  };
};

export const createForm = (userId, title, description, aiMode = 'llama') => {
  const db = getDb();
  const numericUserId = Number(userId);
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (user_id, title, description, ai_mode) VALUES (?, ?, ?, ?)`
  );

  const result = statement.run(numericUserId, title, description, aiMode);

  return getFormById(Number(result.lastInsertRowid));
};

export const updateQrUrl = (formId, qrUrl) => {
  const db = getDb();
  const statement = db.prepare(`UPDATE ${TABLE} SET qr_url = ? WHERE id = ?`);
  statement.run(qrUrl, Number(formId));
  return getFormById(Number(formId));
};

export const getFormById = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, user_id, title, description, qr_url, ai_mode, created_at FROM ${TABLE} WHERE id = ?`
    )
    .get(id);

  return mapForm(row);
};

export const getFormsByUserId = (userId) => {
  const db = getDb();
  const numericUserId = Number(userId);
  const rows = db
    .prepare(
      `SELECT id, user_id, title, description, qr_url, ai_mode, created_at FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(numericUserId);

  return rows.map(mapForm);
};

export const deleteFormById = (id) => {
  const db = getDb();
  const statement = db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`);
  const result = statement.run(Number(id));
  return result.changes > 0;
};

export const FormModel = {
  createForm,
  updateQrUrl,
  getFormById,
  getFormsByUserId,
  deleteFormById
};
