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

const stringifyData = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
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

export const countByForm = (formId) => {
  const db = getDb();
  const row = db
    .prepare(`SELECT COUNT(*) AS total FROM ${TABLE} WHERE form_id = ?`)
    .get(Number(formId));

  return Number(row?.total ?? 0);
};

export const countByFormSince = (formId, days) => {
  const db = getDb();
  const windowDays = Number.isFinite(Number(days)) ? Math.max(0, Number(days)) : 0;
  const clause = windowDays > 0 ? `AND datetime(created_at) >= datetime('now', ?)` : '';
  const statement = db.prepare(
    `SELECT COUNT(*) AS total FROM ${TABLE} WHERE form_id = ? ${clause}`
  );

  const params = [Number(formId)];
  if (windowDays > 0) {
    params.push(`-${windowDays} days`);
  }

  const row = statement.get(...params);
  return Number(row?.total ?? 0);
};

export const findRecentByForm = (formId, limit = 5) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, data, created_at FROM ${TABLE} WHERE form_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(Number(formId), Number(limit));

  return rows.map((row) => {
    const parsed = parseData(row.data) ?? {};
    const answer =
      typeof parsed?.answer === 'string'
        ? parsed.answer
        : typeof parsed?.user_input === 'string'
        ? parsed.user_input
        : typeof parsed?.reply === 'string'
        ? parsed.reply
        : null;

    const previewSource = answer ?? stringifyData(parsed);
    const preview = previewSource ? String(previewSource).slice(0, 120) : '';

    return {
      id: Number(row.id),
      created_at: row.created_at,
      preview
    };
  });
};

export const extractNPSBuckets = (formId) => {
  const db = getDb();
  const rows = db
    .prepare(`SELECT data FROM ${TABLE} WHERE form_id = ?`)
    .all(Number(formId));

  const pattern = /\b(?:10|[0-9])\b/g;
  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const row of rows) {
    const raw = stringifyData(row?.data ?? '');
    if (!raw) {
      continue;
    }

    const matches = [...raw.matchAll(pattern)];
    if (matches.length === 0) {
      continue;
    }

    const lastMatch = matches[matches.length - 1]?.[0];
    const value = Number(lastMatch);
    if (!Number.isFinite(value)) {
      continue;
    }

    if (value >= 9) {
      promoters += 1;
    } else if (value >= 7) {
      passives += 1;
    } else if (value >= 0) {
      detractors += 1;
    }
  }

  const total = promoters + passives + detractors;
  if (total === 0) {
    return null;
  }

  return {
    promoters,
    passives,
    detractors,
    total
  };
};

export const ResponseModel = {
  saveResponse,
  getResponsesByForm,
  getRecentAnswers,
  countByForm,
  countByFormSince,
  findRecentByForm,
  extractNPSBuckets
};
