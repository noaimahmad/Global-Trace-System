import express from 'express';
import { authenticate } from './auth.ts';
import db from '../../src/lib/sqlite.ts';
import { User, FraudReport, IpCheck, PhoneCheck, IndicatorCheck, isConnected } from '../../src/lib/mongodb.ts';

const router = express.Router();

router.use(authenticate);

router.get('/users', async (req, res) => {
  try {
    if (isConnected) {
      const users = await User.find().limit(100);
      return res.json({ users });
    }

    const users = db.prepare('SELECT * FROM users LIMIT 100').all();
    return res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    if (isConnected) {
      const reports = await FraudReport.find().limit(100);
      return res.json({ reports });
    }

    const reports = db.prepare('SELECT * FROM fraud_reports LIMIT 100').all();
    return res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
