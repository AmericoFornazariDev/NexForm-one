import { getDb } from '../config/db.js';

const TABLE = 'plans';

const mapPlan = (row) => {
  if (!row) {
    return null;
  }

  const maxForms = row.max_forms === null ? -1 : row.max_forms;

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    maxForms,
    maxAiTokens: row.max_ai_tokens
  };
};

export const getAllPlans = () => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, price, max_forms, max_ai_tokens FROM ${TABLE} ORDER BY id`
    )
    .all();

  return rows.map(mapPlan);
};

export const getPlanById = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, price, max_forms, max_ai_tokens FROM ${TABLE} WHERE id = ?`
    )
    .get(id);

  return mapPlan(row);
};

export const getPlanByName = (name) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, price, max_forms, max_ai_tokens FROM ${TABLE} WHERE LOWER(name) = LOWER(?)`
    )
    .get(name);

  return mapPlan(row);
};

export const createPlan = (name, price, maxForms, maxAiTokens) => {
  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (name, price, max_forms, max_ai_tokens) VALUES (?, ?, ?, ?)`
  );

  const result = statement.run(name, price, maxForms, maxAiTokens);
  return getPlanById(Number(result.lastInsertRowid));
};

export const PlanModel = {
  getAllPlans,
  getPlanById,
  getPlanByName,
  createPlan
};
