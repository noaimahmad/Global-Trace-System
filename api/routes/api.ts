import express from 'express';
import { authenticate } from './auth.ts';
import db from '../../src/lib/sqlite.ts';
import { IpCheck, PhoneCheck, IndicatorCheck, Session, FraudReport, isConnected } from '../../src/lib/mongodb.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const router = express.Router();

router.get('/my-ip', (req, res) => {
  res.json({ ip: req.ip });
});

router.get('/session', authenticate, async (req: any, res) => {
  try {
    if (isConnected) {
      const sessions = await Session.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(10);
      return res.json({ sessions });
    }

    const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
      .all(req.user.id);
    return res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/phone-check', authenticate, async (req: any, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Missing phone number' });
  }

  const phone = parsePhoneNumberFromString(phoneNumber);
  if (!phone) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const data = {
    user_id: req.user.id,
    raw_input: phoneNumber,
    normalized_number: phone.number,
    country_code: phone.country || null,
    country_name: phone.country ? phone.getCountry() : null,
    validity: phone.isValid(),
    carrier_name: phone.getType() || null,
    line_type: phone.getType() || null,
    consent_confirmed: true
  };

  if (isConnected) {
    const report = new PhoneCheck(data);
    await report.save();
    return res.json({ report });
  }

  const stmt = db.prepare(
    'INSERT INTO phone_checks (user_id, raw_input, normalized_number, country_code, country_name, validity, carrier_name, line_type, consent_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(
    data.user_id,
    data.raw_input,
    data.normalized_number,
    data.country_code,
    data.country_name,
    data.validity ? 1 : 0,
    data.carrier_name,
    data.line_type,
    data.consent_confirmed ? 1 : 0
  );

  res.json({ id: info.lastInsertRowid, ...data });
});

export default router;
