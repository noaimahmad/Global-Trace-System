import { User, connectDB } from './src/lib/mongodb.ts';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

async function seed() {
  console.log('Seeding database...');

  try {
    await connectDB();

    // Create admin user
    const adminPassword = await bcrypt.hash('master123', 10);
    await User.findOneAndUpdate(
      { email: 'noaim@globaltrace.com' },
      { 
        name: 'System Admin', 
        password_hash: adminPassword, 
        role: 'admin', 
        email_verified: true 
      },
      { upsert: true, new: true }
    );

    // Create demo user
    const userPassword = await bcrypt.hash('anwar123', 10);
    await User.findOneAndUpdate(
      { email: 'anwar@globaltrace.com' },
      { 
        name: 'Anwar User', 
        password_hash: userPassword, 
        role: 'user', 
        email_verified: true 
      },
      { upsert: true, new: true }
    );

    console.log('Seed completed successfully.');
    console.log('Admin: noaim@globaltrace.com / master123');
    console.log('User: anwar@globaltrace.com / anwar123');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
