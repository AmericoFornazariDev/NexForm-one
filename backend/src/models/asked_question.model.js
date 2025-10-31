import { getDb } from '../config/db.js';

const TABLE = 'asked_questions';

export const markAsked = (formId, questionId, responseId = null) => {
  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (form_id, question_id, response_id) VALUES (?, ?, ?)`
  );
  statement.run(Number(formId), Number(questionId), responseId ? Number(responseId) : null);
};

export const AskedQuestionModel = {
  markAsked
};
