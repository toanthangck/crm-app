import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database', 'crm.db');

let db: Database.Database;

function getDb(): Database.Database {
    if (!db) {
        const fs = require('fs');
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeDatabase(db);
    }
    return db;
}

function initializeDatabase(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales_rep',
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      size TEXT,
      website TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      company_id TEXT,
      owner_id TEXT,
      tags TEXT DEFAULT '[]',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'lead',
      contact_id TEXT,
      company_id TEXT,
      owner_id TEXT,
      expected_close TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      contact_id TEXT,
      deal_id TEXT,
      company_id TEXT,
      user_id TEXT,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      contact_id TEXT,
      deal_id TEXT,
      company_id TEXT,
      user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
}

export default getDb;
