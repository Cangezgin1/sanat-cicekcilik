const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

// Public: belirli ayarlar
router.get('/public', (req, res) => {
  const keys = ['business_name', 'business_address', 'business_phone', 'instagram', 'work_start', 'work_end', 'google_rating', 'google_review_count', 'orders_enabled', 'meta_description'];
  const rows = db.prepare(`SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`)
    .all(...keys);
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json({ success: true, data: settings });
});

// Admin: tüm ayarlar
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json({ success: true, data: settings });
});

// Admin: ayar güncelle (bulk)
router.put('/', authMiddleware, (req, res) => {
  const updates = req.body;
  const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
  const updateMany = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      updateStmt.run(key, String(value));
    }
  });
  updateMany(updates);
  res.json({ success: true, message: 'Ayarlar güncellendi' });
});

module.exports = router;
