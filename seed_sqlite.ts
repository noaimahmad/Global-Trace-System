import db from './src/lib/sqlite.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding SQLite database...');

  try {
    const adminPassword = await bcrypt.hash('master123', 10);
    const userPassword = await bcrypt.hash('anwar123', 10);

    // Check if admin exists
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('noaim@globaltrace.com');
    if (!admin) {
      db.prepare('INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?)')
        .run('System Admin', 'noaim@globaltrace.com', adminPassword, 'admin', 1);
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('anwar@globaltrace.com');
    if (!user) {
      db.prepare('INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?)')
        .run('Anwar User', 'anwar@globaltrace.com', userPassword, 'user', 1);
    }

    console.log('Seed completed successfully.');
    console.log('Admin: noaim@globaltrace.com / master123');
    console.log('User: anwar@globaltrace.com / anwar123');
  } catch (err) {
    console.error('Seed failed:', err);
  }
}

seed();
