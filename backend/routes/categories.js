const express = require('express')
const router = express.Router()
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC')
  res.json({ success: true, data: result.rows })
})

router.get('/admin/all', authMiddleware, async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id ORDER BY c.sort_order ASC
  `)
  res.json({ success: true, data: result.rows })
})

router.post('/', authMiddleware, async (req, res) => {
  const { name, sort_order } = req.body
  if (!name) return res.status(400).json({ success: false, message: 'Kategori adı gerekli' })
  const slug = name.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, parseInt(sort_order) || 0]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (e) {
    res.status(400).json({ success: false, message: 'Bu kategori zaten mevcut' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  const { name, active, sort_order } = req.body
  const existing = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id])
  if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' })
  const result = await pool.query(
    'UPDATE categories SET name=$1, active=$2, sort_order=$3 WHERE id=$4 RETURNING *',
    [name || existing.rows[0].name, active !== undefined ? (active ? 1 : 0) : existing.rows[0].active, parseInt(sort_order) || existing.rows[0].sort_order, req.params.id]
  )
  res.json({ success: true, data: result.rows[0] })
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const count = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [req.params.id])
  if (parseInt(count.rows[0].count) > 0) return res.status(400).json({ success: false, message: 'Bu kategoride ürün var' })
  await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id])
  res.json({ success: true })
})

router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT active FROM categories WHERE id = $1', [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' })
  const newActive = result.rows[0].active ? 0 : 1
  await pool.query('UPDATE categories SET active = $1 WHERE id = $2', [newActive, req.params.id])
  res.json({ success: true, active: !!newActive })
})

module.exports = router
