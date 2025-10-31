import { getDb } from '../config/db.js';

const TABLE = 'users';

export const findUserByEmail = (email) => {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, email, password_hash as passwordHash, plan_id as planId, created_at as createdAt FROM ${TABLE} WHERE email = ?`
    )
    .get(email);
};

export const createUser = (name, email, passwordHash) => {
  const db = getDb();
  const statement = db.prepare(
    `INSERT INTO ${TABLE} (name, email, password_hash) VALUES (?, ?, ?)`
  );
  const result = statement.run(name, email, passwordHash);

  return {
    id: Number(result.lastInsertRowid),
    name,
    email,
    passwordHash
  };
};

export const getUserById = (id) => {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, email, plan_id as planId, created_at as createdAt FROM ${TABLE} WHERE id = ?`
    )
    .get(id);
};

export const UserModel = {
  findUserByEmail,
  createUser,
  getUserById
};
