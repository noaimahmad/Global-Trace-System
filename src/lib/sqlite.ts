import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
let db: any;

try {
  db = new Database(dbPath);
  
  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      email_verified BOOLEAN DEFAULT 0,
      two_factor_enabled BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ip_address TEXT,
      approx_country TEXT,
      approx_region TEXT,
      browser TEXT,
      os TEXT,
      device_type TEXT,
      revoked_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS phone_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      raw_input TEXT,
      normalized_number TEXT,
      country_code TEXT,
      country_name TEXT,
      validity BOOLEAN,
      carrier_name TEXT,
      line_type TEXT,
      consent_confirmed BOOLEAN,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS ip_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      ip_address TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      timezone TEXT,
      isp TEXT,
      asn TEXT,
      vpn_detected BOOLEAN,
      proxy_detected BOOLEAN,
      tor_detected BOOLEAN,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS indicator_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      indicator_type TEXT,
      indicator_value TEXT,
      reputation_score INTEGER,
      summary TEXT,
      source_count INTEGER,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS fraud_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT,
      indicator_value TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (reviewed_by) REFERENCES users (id)
    );
  `);
} catch (err) {
  console.warn('SQLite initialization failed (Expected on read-only filesystems like Vercel):', err);
  db = {
    prepare: () => ({
      run: () => ({ lastInsertRowid: 0 }),
      get: () => null,
      all: () => []
    }),
    exec: () => {}
  };
}

export default db;
