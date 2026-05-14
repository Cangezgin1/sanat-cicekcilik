const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

// Public
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC').all();
  res.json({ success: true, data: categories });
});

// Admin: tüm kategoriler
router.get('/admin/all', authMiddleware, (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `).all();
  res.json({ success: true, data: categories });
});

// Admin: ekle
router.post('/', authMiddleware, (req, res) => {
  const { name, sort_order } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Kategori adı gerekli' });
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-ğüşıöç]/gi, '').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
  try {
    const result = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)').run(name, slug + '-' + Date.now(), parseInt(sort_order) || 0);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, data: category });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Bu kategori zaten mevcut' });
  }
});

// Admin: güncelle
router.put('/:id', authMiddleware, (req, res) => {
  const { name, active, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
  db.prepare('UPDATE categories SET name=?, active=?, sort_order=? WHERE id=?').run(name || existing.name, active !== undefined ? (active ? 1 : 0) : existing.active, parseInt(sort_order) || existing.sort_order, req.params.id);
  res.json({ success: true, data: db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) });
});

// Admin: sil
router.delete('/:id', authMiddleware, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(req.params.id);
  if (count.c > 0) return res.status(400).json({ success: false, message: 'Bu kategoride ürün var, önce ürünleri taşıyın' });
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: toggle
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
  db.prepare('UPDATE categories SET active = ? WHERE id = ?').run(cat.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: !cat.active });
});

module.exports = router;
