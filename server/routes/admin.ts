import express from 'express';
import { authenticate } from './auth.js';
import db from '../../src/lib/sqlite.js';
import { User, FraudReport, IpCheck, PhoneCheck, IndicatorCheck, isConnected } from '../../src/lib/mongodb.js';

const router = express.Router();

// Admin middleware
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

router.use(authenticate, isAdmin);

router.get('/stats', async (req, res) => {
  if (isConnected) {
    try {
      const userCount = await User.countDocuments();
      const reportCount = await FraudReport.countDocuments();
      const ipCheckCount = await IpCheck.countDocuments();
      const phoneCheckCount = await PhoneCheck.countDocuments();
      const indicatorCheckCount = await IndicatorCheck.countDocuments();
      
      const reportsByCategory = await FraudReport.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } }
      ]);
      
      return res.json({
        users: userCount,
        reports: reportCount,
        checks: ipCheckCount + phoneCheckCount + indicatorCheckCount,
        reportsByCategory
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch stats from MongoDB' });
    }
  }

  try {
    const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const reportCount: any = db.prepare('SELECT COUNT(*) as count FROM fraud_reports').get();
    const ipCheckCount: any = db.prepare('SELECT COUNT(*) as count FROM ip_checks').get();
    const phoneCheckCount: any = db.prepare('SELECT COUNT(*) as count FROM phone_checks').get();
    const indicatorCheckCount: any = db.prepare('SELECT COUNT(*) as count FROM indicator_checks').get();
    
    const reportsByCategory = db.prepare('SELECT category, COUNT(*) as count FROM fraud_reports GROUP BY category').all();
    
    res.json({
      users: userCount.count,
      reports: reportCount.count,
      checks: ipCheckCount.count + phoneCheckCount.count + indicatorCheckCount.count,
      reportsByCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats from SQLite' });
  }
});

router.get('/reports', async (req, res) => {
  if (isConnected) {
    try {
      const reports = await FraudReport.find()
        .populate('user_id', 'name')
        .sort({ createdAt: -1 });
      
      const formattedReports = reports.map((r: any) => ({
        ...r.toObject(),
        id: r._id,
        user_name: r.user_id?.name || 'Unknown'
      }));
      
      return res.json(formattedReports);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch reports from MongoDB' });
    }
  }

  try {
    const reports = db.prepare(`
      SELECT fr.*, u.name as user_name 
      FROM fraud_reports fr
      LEFT JOIN users u ON fr.user_id = u.id
      ORDER BY fr.created_at DESC
    `).all();
    
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports from SQLite' });
  }
});

router.post('/reports/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isConnected) {
    try {
      await FraudReport.findByIdAndUpdate(id, { 
        status, 
        reviewed_at: new Date() 
      });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update status in MongoDB' });
    }
  }

  try {
    db.prepare('UPDATE fraud_reports SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status in SQLite' });
  }
});

router.get('/users', async (req, res) => {
  if (isConnected) {
    try {
      const users = await User.find({}, 'name email role createdAt');
      return res.json(users.map((u: any) => ({
        ...u.toObject(),
        id: u._id
      })));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch users from MongoDB' });
    }
  }

  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users from SQLite' });
  }
});

export default router;
