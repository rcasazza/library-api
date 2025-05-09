import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure DB folder exists
const dbPath = path.resolve('data', 'library.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Create books table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    user TEXT NOT NULL
  );
`);

export default db;
