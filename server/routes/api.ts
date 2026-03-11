import express from 'express';
import { authenticate } from './auth.ts';
import db from '../../src/lib/sqlite.ts';
import { IpCheck, PhoneCheck, IndicatorCheck, Session, FraudReport, isConnected } from '../../src/lib/mongodb.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const router = express.Router();

// Mock Geolocation Data
const getMockGeo = (ip: string) => ({
  ip,
  city: 'San Francisco',
  region: 'California',
  country: 'United States',
  country_code: 'US',
  timezone: 'America/Los_Angeles',
  isp: 'Google LLC',
  asn: 'AS15169',
  lat: 37.7749,
  lon: -122.4194,
  vpn: false,
  proxy: false,
  tor: false
});

router.get('/my-ip', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const geo = getMockGeo(ip.toString());
  res.json(geo);
});

router.post('/check-ip', authenticate, async (req: any, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });

  const geo = getMockGeo(ip);
  
  if (isConnected) {
    try {
      const newIpCheck = new IpCheck({
        user_id: req.user.id,
        ip_address: geo.ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        timezone: geo.timezone,
        isp: geo.isp,
        asn: geo.asn,
        vpn_detected: geo.vpn,
        proxy_detected: geo.proxy,
        tor_detected: geo.tor
      });
      await newIpCheck.save();
    } catch (err) {
      console.error('Failed to save IP check to MongoDB:', err);
    }
  } else {
    try {
      db.prepare(`
        INSERT INTO ip_checks (user_id, ip_address, city, region, country, timezone, isp, asn, vpn_detected, proxy_detected, tor_detected)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, geo.ip, geo.city, geo.region, geo.country, geo.timezone, geo.isp, geo.asn, 
        geo.vpn ? 1 : 0, geo.proxy ? 1 : 0, geo.tor ? 1 : 0
      );
    } catch (err) {
      console.error('Failed to save IP check to SQLite:', err);
    }
  }

  res.json(geo);
});

router.post('/check-phone', authenticate, async (req: any, res) => {
  const { phone, consent } = req.body;
  if (!phone || !consent) return res.status(400).json({ error: 'Phone and consent required' });

  const phoneNumber = parsePhoneNumberFromString(phone);
  if (!phoneNumber) return res.status(400).json({ error: 'Invalid phone format' });

  const result = {
    valid: phoneNumber.isValid(),
    number: phoneNumber.format('E.164'),
    country: phoneNumber.country,
    type: phoneNumber.getType() || 'unknown',
    carrier: 'Mock Carrier'
  };

  if (isConnected) {
    try {
      const newPhoneCheck = new PhoneCheck({
        user_id: req.user.id,
        raw_input: phone,
        normalized_number: result.number,
        country_code: result.country,
        validity: result.valid,
        carrier_name: result.carrier,
        line_type: result.type,
        consent_confirmed: true
      });
      await newPhoneCheck.save();
    } catch (err) {
      console.error('Failed to save phone check to MongoDB:', err);
    }
  } else {
    try {
      db.prepare(`
        INSERT INTO phone_checks (user_id, raw_input, normalized_number, country_code, validity, carrier_name, line_type, consent_confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, phone, result.number, result.country, result.valid ? 1 : 0, result.carrier, result.type, 1
      );
    } catch (err) {
      console.error('Failed to save phone check to SQLite:', err);
    }
  }

  res.json(result);
});

router.post('/check-reputation', authenticate, async (req: any, res) => {
  const { indicator, type } = req.body;
  if (!indicator || !type) return res.status(400).json({ error: 'Indicator and type required' });

  const score = Math.floor(Math.random() * 100);
  const result = {
    indicator,
    type,
    score,
    summary: score > 70 ? 'High Risk' : score > 30 ? 'Medium Risk' : 'Low Risk',
    hits: score > 50 ? 3 : 0
  };

  if (isConnected) {
    try {
      const newIndicatorCheck = new IndicatorCheck({
        user_id: req.user.id,
        indicator_type: type,
        indicator_value: indicator,
        reputation_score: score,
        summary: result.summary,
        source_count: result.hits
      });
      await newIndicatorCheck.save();
    } catch (err) {
      console.error('Failed to save indicator check to MongoDB:', err);
    }
  } else {
    try {
      db.prepare(`
        INSERT INTO indicator_checks (user_id, indicator_type, indicator_value, reputation_score, summary, source_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, type, indicator, score, result.summary, result.hits
      );
    } catch (err) {
      console.error('Failed to save indicator check to SQLite:', err);
    }
  }

  res.json(result);
});

router.get('/history', authenticate, async (req: any, res) => {
  if (isConnected) {
    try {
      const ipChecks = await IpCheck.find({ user_id: req.user.id }).sort({ checked_at: -1 }).limit(10);
      const phoneChecks = await PhoneCheck.find({ user_id: req.user.id }).sort({ checked_at: -1 }).limit(10);
      const indicatorChecks = await IndicatorCheck.find({ user_id: req.user.id }).sort({ checked_at: -1 }).limit(10);
      return res.json({ ipChecks, phoneChecks, indicatorChecks });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch history from MongoDB' });
    }
  }

  try {
    const ipChecks = db.prepare('SELECT * FROM ip_checks WHERE user_id = ? ORDER BY checked_at DESC LIMIT 10').all(req.user.id);
    const phoneChecks = db.prepare('SELECT * FROM phone_checks WHERE user_id = ? ORDER BY checked_at DESC LIMIT 10').all(req.user.id);
    const indicatorChecks = db.prepare('SELECT * FROM indicator_checks WHERE user_id = ? ORDER BY checked_at DESC LIMIT 10').all(req.user.id);
    
    res.json({ ipChecks, phoneChecks, indicatorChecks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history from SQLite' });
  }
});

router.get('/sessions', authenticate, async (req: any, res) => {
  if (isConnected) {
    try {
      const sessions = await Session.find({ user_id: req.user.id }).sort({ createdAt: -1 });
      return res.json(sessions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch sessions from MongoDB' });
    }
  }

  try {
    const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions from SQLite' });
  }
});

router.post('/fraud-report', authenticate, async (req: any, res) => {
  const { category, indicator, description } = req.body;
  
  if (isConnected) {
    try {
      const newReport = new FraudReport({
        user_id: req.user.id,
        category,
        indicator_value: indicator,
        description
      });
      await newReport.save();
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save report to MongoDB' });
    }
  }

  try {
    db.prepare(`
      INSERT INTO fraud_reports (user_id, category, indicator_value, description)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, category, indicator, description);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save report to SQLite' });
  }
});

export default router;
