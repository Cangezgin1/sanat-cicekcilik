const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Sadece resim dosyası yüklenebilir'));
  }
});

// Public: aktif ve stokta olan ürünleri getir
router.get('/', (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.stock > 0
  `;
  const params = [];
  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  query += ' ORDER BY p.sort_order ASC, p.id DESC';
  const products = db.prepare(query).all(...params);
  res.json({ success: true, data: products });
});

// Public: tek ürün
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.active = 1
  `).get(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
  res.json({ success: true, data: product });
});

// Admin: tüm ürünleri getir (pasifler dahil)
router.get('/admin/all', authMiddleware, (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sort_order ASC, p.id DESC
  `).all();
  res.json({ success: true, data: products });
});

// Admin: ürün ekle
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'İsim ve fiyat zorunlu' });
  }
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(`
    INSERT INTO products (name, description, price, category_id, image_url, stock, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, data: product });
});

// Admin: ürün güncelle
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });

  let image_url = existing.image_url;
  if (req.file) {
    if (existing.image_url) {
      const oldPath = path.join(__dirname, '..', existing.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    image_url = `/uploads/${req.file.filename}`;
  }

  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, category_id=?, image_url=?, stock=?, active=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0, req.params.id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: product });
});

// Admin: ürün sil
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
  if (existing.image_url) {
    const imgPath = path.join(__dirname, '..', existing.image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Ürün silindi' });
});

// Admin: aktif/pasif toggle
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
  db.prepare('UPDATE products SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(product.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: !product.active });
});

module.exports = router;
