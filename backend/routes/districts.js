const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

// Public
router.get('/', (req, res) => {
  const districts = db.prepare('SELECT * FROM districts ORDER BY sort_order ASC').all();
  res.json({ success: true, data: districts });
});

// Admin: toggle
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(req.params.id);
  if (!district) return res.status(404).json({ success: false, message: 'İlçe bulunamadı' });
  db.prepare('UPDATE districts SET active = ? WHERE id = ?').run(district.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: !district.active });
});

module.exports = router;
