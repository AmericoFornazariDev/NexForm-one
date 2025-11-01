import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFilePath = path.resolve(__dirname, '../../nexform.db');
let dbInstance;

const ensureDatabaseFile = () => {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createTables = (db) => {
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      plan_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans (id)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      max_forms INTEGER,
      max_ai_tokens INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      qr_url TEXT,
      qr_code TEXT,
      ai_mode TEXT DEFAULT 'llama',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      data TEXT,
      ai_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    );

    CREATE TABLE IF NOT EXISTS sentiment_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      response_id INTEGER NOT NULL,
      sentiment TEXT CHECK(sentiment IN ('positivo','neutro','negativo')),
      confidence REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tone TEXT DEFAULT 'simpático',
      style TEXT DEFAULT 'curta',
      goal TEXT DEFAULT 'satisfação geral',
      ai_mode TEXT DEFAULT 'llama',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS merchant_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_required INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asked_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      response_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES merchant_questions (id) ON DELETE CASCADE,
      FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mq_form ON merchant_questions(form_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_ai_cfg_user ON ai_config(user_id);
    CREATE INDEX IF NOT EXISTS idx_asked_form ON asked_questions(form_id);
    CREATE INDEX IF NOT EXISTS idx_sent_form ON sentiment_analysis(form_id);
  `);
};

const ensureFormsQrCodeColumn = (db) => {
  const columns = db.prepare('PRAGMA table_info(forms)').all();
  const hasQrCode = columns.some((column) => column.name === 'qr_code');

  if (!hasQrCode) {
    db.exec('ALTER TABLE forms ADD COLUMN qr_code TEXT;');
  }
};

const seedPlans = (db) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM plans').get();
  if (row.count === 0) {
    const insert = db.prepare(
      'INSERT INTO plans (name, price, max_forms, max_ai_tokens) VALUES (?, ?, ?, ?)'
    );
    const plans = [
      ['Free', 0.0, 1, 500],
      ['Pro', 9.99, 10, 5000],
      ['Business', 29.99, null, 20000]
    ];
    const insertMany = db.transaction((records) => {
      for (const record of records) {
        insert.run(...record);
      }
    });
    insertMany(plans);
  }
};

export const getDb = () => {
  if (!dbInstance) {
    ensureDatabaseFile();
    dbInstance = new Database(dbFilePath);
    createTables(dbInstance);
    ensureFormsQrCodeColumn(dbInstance);
    seedPlans(dbInstance);
  }
  return dbInstance;
};

export const initDb = () => {
  getDb();
};
