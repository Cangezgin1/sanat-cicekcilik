const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

// Public: sipariş oluştur (WhatsApp'a yönlendirme anında çağrılır)
router.post('/', (req, res) => {
  const { product_id, product_name, product_price, quantity, total_price, district_id, district_name, customer_note } = req.body;
  if (!product_name || !quantity || !district_name) {
    return res.status(400).json({ success: false, message: 'Eksik bilgi' });
  }

  const settings = {};
  db.prepare('SELECT key, value FROM settings').all().forEach(r => { settings[r.key] = r.value; });

  if (settings.orders_enabled === '0') {
    return res.status(400).json({ success: false, message: 'Siparişler şu an kapalı' });
  }

  // Çalışma saati kontrolü
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = (settings.work_start || '10:00').split(':').map(Number);
  const [endH, endM] = (settings.work_end || '23:30').split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return res.status(400).json({
      success: false,
      message: `Şu an siparişe kapalıyız. Çalışma saatlerimiz ${settings.work_start} - ${settings.work_end} arası.`
    });
  }

  const result = db.prepare(`
    INSERT INTO orders (product_id, product_name, product_price, quantity, total_price, district_id, district_name, customer_note, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(product_id || null, product_name, parseFloat(product_price), parseInt(quantity), parseFloat(total_price), district_id || null, district_name, customer_note || '');

  res.json({ success: true, order_id: result.lastInsertRowid });
});

// Admin: tüm siparişler
router.get('/admin/all', authMiddleware, (req, res) => {
  const { status, district, date_from, date_to, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (district) { query += ' AND district_name = ?'; params.push(district); }
  if (date_from) { query += ' AND DATE(created_at) >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND DATE(created_at) <= ?'; params.push(date_to); }

  const totalRow = db.prepare(`SELECT COUNT(*) as total FROM orders WHERE 1=1${status ? ' AND status=?' : ''}${district ? ' AND district_name=?' : ''}${date_from ? ' AND DATE(created_at)>=?' : ''}${date_to ? ' AND DATE(created_at)<=?' : ''}`).get(...params);

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const orders = db.prepare(query).all(...params);
  res.json({ success: true, data: orders, total: totalRow.total, page: parseInt(page), limit: parseInt(limit) });
});

// Admin: sipariş durumu güncelle
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Geçersiz durum' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Admin: istatistikler
router.get('/admin/stats', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const stats = {
    today: {
      total: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ?").get(today).c,
      completed: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ? AND status = 'completed'").get(today).c,
      cancelled: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ? AND status = 'cancelled'").get(today).c,
      pending: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ? AND status = 'pending'").get(today).c,
    },
    week: {
      total: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) >= ?").get(weekAgo).c,
      completed: db.prepare("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) >= ? AND status = 'completed'").get(weekAgo).c,
      revenue: db.prepare("SELECT COALESCE(SUM(total_price), 0) as s FROM orders WHERE DATE(created_at) >= ? AND status = 'completed'").get(weekAgo).s,
    },
    all_time: {
      total: db.prepare("SELECT COUNT(*) as c FROM orders").get().c,
      completed: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'completed'").get().c,
      revenue: db.prepare("SELECT COALESCE(SUM(total_price), 0) as s FROM orders WHERE status = 'completed'").get().s,
    },
    by_district: db.prepare("SELECT district_name, COUNT(*) as count FROM orders GROUP BY district_name ORDER BY count DESC").all(),
    by_product: db.prepare("SELECT product_name, COUNT(*) as count, SUM(quantity) as total_qty FROM orders GROUP BY product_name ORDER BY count DESC LIMIT 5").all(),
  };

  res.json({ success: true, data: stats });
});

module.exports = router;
