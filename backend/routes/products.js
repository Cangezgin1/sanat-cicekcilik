const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `product_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Sadece resim yüklenebilir'))
    }
  }
})

// Public: aktif ürünler
router.get('/', async (req, res) => {
  const { category } = req.query
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.stock > 0
  `
  const params = []
  if (category) {
    params.push(category)
    query += ` AND c.slug = $${params.length}`
  }
  query += ' ORDER BY p.sort_order ASC, p.id DESC'
  const result = await pool.query(query, params)
  res.json({ success: true, data: result.rows })
})

// Public: tek ürün
router.get('/:id', async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1 AND p.active = 1
  `, [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })
  res.json({ success: true, data: result.rows[0] })
})

// Admin: tüm ürünler
router.get('/admin/all', authMiddleware, async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sort_order ASC, p.id DESC
  `)
  res.json({ success: true, data: result.rows })
})

// Admin: ekle
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body
  if (!name || !price) return res.status(400).json({ success: false, message: 'İsim ve fiyat zorunlu' })
  const image_url = req.file ? `/uploads/${req.file.filename}` : null
  const result = await pool.query(
    `INSERT INTO products (name, description, price, category_id, image_url, stock, active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0]
  )
  res.json({ success: true, data: result.rows[0] })
})

// Admin: güncelle
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body
  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })

  let image_url = existing.rows[0].image_url
  if (req.file) {
    if (image_url) {
      const oldPath = path.join(__dirname, '..', image_url)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    image_url = `/uploads/${req.file.filename}`
  }

  const result = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5,
     stock=$6, active=$7, sort_order=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
    [name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0, req.params.id]
  )
  res.json({ success: true, data: result.rows[0] })
})

// Admin: sil
router.delete('/:id', authMiddleware, async (req, res) => {
  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })
  if (existing.rows[0].image_url) {
    const imgPath = path.join(__dirname, '..', existing.rows[0].image_url)
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
  }
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
  res.json({ success: true })
})

// Admin: toggle
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT active FROM products WHERE id = $1', [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })
  const newActive = result.rows[0].active ? 0 : 1
  await pool.query('UPDATE products SET active = $1, updated_at = NOW() WHERE id = $2', [newActive, req.params.id])
  res.json({ success: true, active: !!newActive })
})

module.exports = router
