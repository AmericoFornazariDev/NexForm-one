import { getDb } from '../config/db.js';

const TABLE = 'sentiment_analysis';

const normalizeSentiment = (value) => {
  if (!value) {
    return 'neutro';
  }

  const lowered = String(value).trim().toLowerCase();
  if (['positivo', 'neutro', 'negativo'].includes(lowered)) {
    return lowered;
  }

  return 'neutro';
};

export const replaceFormSentiments = (formId, entries) => {
  const db = getDb();
  const numericFormId = Number(formId);
  const insert = db.prepare(
    `INSERT INTO ${TABLE} (form_id, response_id, sentiment, confidence) VALUES (?, ?, ?, ?)`
  );

  const tx = db.transaction((items) => {
    db.prepare(`DELETE FROM ${TABLE} WHERE form_id = ?`).run(numericFormId);

    for (const item of items) {
      const responseId = Number(item?.response_id ?? item?.responseId ?? item?.id);
      if (!Number.isFinite(responseId)) {
        continue;
      }

      const sentiment = normalizeSentiment(item?.sentiment);
      const confidence = Number(item?.confidence ?? 0) || 0;

      insert.run(numericFormId, responseId, sentiment, confidence);
    }
  });

  tx(Array.isArray(entries) ? entries : []);
};

export const getTrendByForm = (formId) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DATE(created_at) AS bucket, sentiment, COUNT(*) AS total
       FROM ${TABLE}
       WHERE form_id = ?
       GROUP BY DATE(created_at), sentiment
       ORDER BY DATE(created_at) ASC`
    )
    .all(Number(formId));

  const grouped = new Map();

  for (const row of rows) {
    const dateKey = row?.bucket ?? row?.date;
    if (!dateKey) {
      continue;
    }

    const existing = grouped.get(dateKey) ?? {
      date: dateKey,
      positive: 0,
      neutral: 0,
      negative: 0
    };

    const sentiment = normalizeSentiment(row?.sentiment);
    const count = Number(row?.total ?? 0) || 0;

    if (sentiment === 'positivo') {
      existing.positive += count;
    } else if (sentiment === 'negativo') {
      existing.negative += count;
    } else {
      existing.neutral += count;
    }

    grouped.set(dateKey, existing);
  }

  return Array.from(grouped.values());
};

export const getTotalsByForm = (formId) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT sentiment, COUNT(*) AS total
       FROM ${TABLE}
       WHERE form_id = ?
       GROUP BY sentiment`
    )
    .all(Number(formId));

  const totals = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  for (const row of rows) {
    const sentiment = normalizeSentiment(row?.sentiment);
    const count = Number(row?.total ?? 0) || 0;

    if (sentiment === 'positivo') {
      totals.positive += count;
    } else if (sentiment === 'negativo') {
      totals.negative += count;
    } else {
      totals.neutral += count;
    }
  }

  return totals;
};

export const SentimentModel = {
  replaceFormSentiments,
  getTrendByForm,
  getTotalsByForm
};
