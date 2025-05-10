import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('data', 'library.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

const adminExists = db
  .prepare('SELECT id FROM users WHERE username = ?')
  .get('admin');

if (!adminExists) {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  db.prepare(
    `
    INSERT INTO users (username, password, email, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run('admin', hashedPassword, 'admin@example.com', 'admin', 1);

  console.log('🛠 Default admin user created: admin / admin123');
} else {
  console.log('✅ Admin user already exists');
}
