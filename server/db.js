// Database setup for the ACG e-learning pilot.
// Uses SQLite (via better-sqlite3) - a file-based, zero-config, open-source database.
// This keeps learner data, progress, and settings separate from app logic and content,
// per the project's requirement to keep content/logic/data decoupled for future LMS integration.

const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'acg_elearning.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  emp_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE(emp_id)
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  learner_id TEXT NOT NULL,
  screen_id TEXT NOT NULL,
  module TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE(learner_id, screen_id),
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  learner_id TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- 'practice_m1' | 'practice_m2' | 'final'
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  answers_json TEXT,
  started_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- 'security' | 'fire' | 'medical'
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL,
  hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`);

// ---- Seed default settings (admin-configurable, per Section 10 decisions) ----
const defaultSettings = {
  pass_score_percent: '80',
  max_attempts: '3',
  cooldown_minutes: '60',
  course_title: 'Emergency Preparedness & Environmental Awareness',
};
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(defaultSettings)) insertSetting.run(k, v);

// ---- Seed default contact directory (from source slide 11 - flagged for HR sign-off) ----
const contactCount = db.prepare('SELECT COUNT(*) AS c FROM contacts').get().c;
if (contactCount === 0) {
  const insertContact = db.prepare(
    'INSERT INTO contacts (category, label, value, sort_order) VALUES (?, ?, ?, ?)'
  );
  const seed = [
    ['security', 'Main Gate', '021-69660201/2, Ext 201/202, Mob: 8378997884', 1],
    ['security', 'APT Gate', '7506905750', 2],
    ['security', 'Metalcraft Gate', '8380062675', 3],
    ['security', 'Associate Capsules Gate', '8308822893', 4],
    ['fire', 'Main', '101', 1],
    ['fire', 'Wai', '02167-220022', 2],
    ['fire', 'Pune', '020-24458950', 3],
    ['medical', 'ACG Ambulance', '108 / 9689433580', 1],
    ['medical', 'Shri Seva Sadan Hospital/Ambulance Shirwal', '02169-244276 / 244110', 2],
  ];
  for (const row of seed) insertContact.run(...row);
}

// ---- Seed a default admin user (username: admin / password: ChangeMe123) ----
// PILOT NOTE: this default credential MUST be changed before any real deployment.
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get().c;
if (adminCount === 0) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword('ChangeMe123', salt);
  db.prepare('INSERT INTO admin_users (username, salt, hash) VALUES (?, ?, ?)').run(
    'admin',
    salt,
    hash
  );
  console.log('[seed] Default admin created -> username: admin / password: ChangeMe123 (CHANGE THIS)');
}

module.exports = { db, hashPassword };
