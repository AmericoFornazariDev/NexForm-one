import { getDb } from '../config/db.js';

const TABLE = 'ai_config';

const DEFAULT_CONFIG = {
  tone: 'simpático',
  style: 'curta',
  goal: 'satisfação geral',
  ai_mode: 'llama'
};

const mapConfig = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    tone: row.tone ?? DEFAULT_CONFIG.tone,
    style: row.style ?? DEFAULT_CONFIG.style,
    goal: row.goal ?? DEFAULT_CONFIG.goal,
    ai_mode: row.ai_mode ?? DEFAULT_CONFIG.ai_mode,
    created_at: row.created_at
  };
};

export const getConfigByUser = (userId) => {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, user_id, tone, style, goal, ai_mode, created_at FROM ${TABLE} WHERE user_id = ?`)
    .get(Number(userId));

  return mapConfig(row);
};

export const upsertConfig = (userId, { tone, style, goal, ai_mode }) => {
  const db = getDb();
  const existing = getConfigByUser(userId);

  if (existing) {
    const statement = db.prepare(
      `UPDATE ${TABLE} SET tone = ?, style = ?, goal = ?, ai_mode = ? WHERE id = ?`
    );
    statement.run(tone, style, goal, ai_mode, existing.id);
    return getConfigByUser(userId);
  }

  const statement = db.prepare(
    `INSERT INTO ${TABLE} (user_id, tone, style, goal, ai_mode) VALUES (?, ?, ?, ?, ?)`
  );
  statement.run(Number(userId), tone, style, goal, ai_mode);

  return getConfigByUser(userId);
};

export const ensureConfigForUser = (userId) => {
  const existing = getConfigByUser(userId);
  if (existing) {
    return existing;
  }

  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (user_id, tone, style, goal, ai_mode) VALUES (?, ?, ?, ?, ?)`
  );
  statement.run(Number(userId), DEFAULT_CONFIG.tone, DEFAULT_CONFIG.style, DEFAULT_CONFIG.goal, DEFAULT_CONFIG.ai_mode);

  return getConfigByUser(userId);
};

export const AiConfigModel = {
  getConfigByUser,
  upsertConfig,
  ensureConfigForUser,
  DEFAULT_CONFIG
};
