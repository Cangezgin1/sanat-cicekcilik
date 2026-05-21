const express = require('express')
const router = express.Router()
const multer = require('multer')
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

// Cloudinary varsa onu kullan, yoksa local upload
let uploadMiddleware
let deleteImage

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2
  const { CloudinaryStorage } = require('multer-storage-cloudinary')

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sanat-cicekcilik',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  })

  uploadMiddleware = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

  deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return
    try {
      const parts = imageUrl.split('/')
      const filename = parts[parts.length - 1].split('.')[0]
      const publicId = `sanat-cicekcilik/${filename}`
      await cloudinary.uploader.destroy(publicId)
    } catch (e) {
      console.log('Cloudinary delete error:', e.message)
    }
  }
} else {
  const path = require('path')
  const fs = require('fs')
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads')
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (req, file, cb) => cb(null, `product_${Date.now()}${path.extname(file.originalname)}`)
  })
  uploadMiddleware = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })
  deleteImage = async () => {}
}

// Public: aktif ürünler
router.get('/', async (req, res) => {
  const { category } = req.query
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.stock > 0
  `
  const params = []
  if (category) { params.push(category); query += ` AND c.slug = $${params.length}` }
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
router.post('/', authMiddleware, uploadMiddleware.single('image'), async (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body
  if (!name || !price) return res.status(400).json({ success: false, message: 'İsim ve fiyat zorunlu' })
  const image_url = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null
  const result = await pool.query(
    `INSERT INTO products (name, description, price, category_id, image_url, stock, active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0]
  )
  res.json({ success: true, data: result.rows[0] })
})

// Admin: güncelle
router.put('/:id', authMiddleware, uploadMiddleware.single('image'), async (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body
  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })

  let image_url = existing.rows[0].image_url
  if (req.file) {
    await deleteImage(image_url)
    image_url = req.file.path || `/uploads/${req.file.filename}`
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
  await deleteImage(existing.rows[0].image_url)
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
