const express = require('express')
const router = express.Router()
const multer = require('multer')
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

// Memory storage - dosyayı RAM'de tut, sonra Cloudinary'e yükle
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

// Cloudinary'e yükle
async function uploadToCloudinary(buffer, mimetype) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null
  
  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sanat-cicekcilik', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] },
      (error, result) => { if (error) reject(error); else resolve(result.secure_url) }
    )
    stream.end(buffer)
  })
}

async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return
  try {
    const cloudinary = require('cloudinary').v2
    const parts = imageUrl.split('/')
    const filename = parts[parts.length - 1].split('.')[0]
    await cloudinary.uploader.destroy(`sanat-cicekcilik/${filename}`)
  } catch (e) {}
}

// Public: aktif ürünler
router.get('/', async (req, res) => {
  const { category } = req.query
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.stock > 0`
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
    WHERE p.id = $1 AND p.active = 1`, [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })
  res.json({ success: true, data: result.rows[0] })
})

// Admin: tüm ürünler
router.get('/admin/all', authMiddleware, async (req, res) => {
  const result = await pool.query(`SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.sort_order ASC, p.id DESC`)
  res.json({ success: true, data: result.rows })
})

// Admin: ekle
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, price, category_id, stock, active, sort_order } = req.body
  if (!name || !price) return res.status(400).json({ success: false, message: 'İsim ve fiyat zorunlu' })
  
  let image_url = null
  if (req.file) {
    try { image_url = await uploadToCloudinary(req.file.buffer, req.file.mimetype) } catch (e) {}
  }
  
  const { price_esenyurt, price_avcilar, price_beylikduzu, price_buyukcekmece, price_kucukcekmece, price_bahcesehir } = req.body
  const pe = price_esenyurt ? parseFloat(price_esenyurt) : parseFloat(price)
  const pa = price_avcilar ? parseFloat(price_avcilar) : parseFloat(price)
  const pb = price_beylikduzu ? parseFloat(price_beylikduzu) : parseFloat(price)
  const pbk = price_buyukcekmece ? parseFloat(price_buyukcekmece) : parseFloat(price)
  const pk = price_kucukcekmece ? parseFloat(price_kucukcekmece) : parseFloat(price)
  const pbh = price_bahcesehir ? parseFloat(price_bahcesehir) : parseFloat(price)
  
  const result = await pool.query(
    `INSERT INTO products (name, description, price, category_id, image_url, stock, active, sort_order,
      price_esenyurt, price_avcilar, price_beylikduzu, price_buyukcekmece, price_kucukcekmece, price_bahcesehir)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0,
     pe, pa, pb, pbk, pk, pbh]
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
    await deleteFromCloudinary(image_url)
    try { image_url = await uploadToCloudinary(req.file.buffer, req.file.mimetype) } catch (e) {}
  }

  const { price_esenyurt, price_avcilar, price_beylikduzu, price_buyukcekmece, price_kucukcekmece, price_bahcesehir } = req.body
  const pe = price_esenyurt ? parseFloat(price_esenyurt) : parseFloat(price)
  const pa = price_avcilar ? parseFloat(price_avcilar) : parseFloat(price)
  const pb = price_beylikduzu ? parseFloat(price_beylikduzu) : parseFloat(price)
  const pbk = price_buyukcekmece ? parseFloat(price_buyukcekmece) : parseFloat(price)
  const pk = price_kucukcekmece ? parseFloat(price_kucukcekmece) : parseFloat(price)
  const pbh = price_bahcesehir ? parseFloat(price_bahcesehir) : parseFloat(price)

  const result = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5,
     stock=$6, active=$7, sort_order=$8, updated_at=NOW(),
     price_esenyurt=$9, price_avcilar=$10, price_beylikduzu=$11,
     price_buyukcekmece=$12, price_kucukcekmece=$13, price_bahcesehir=$14
     WHERE id=$15 RETURNING *`,
    [name, description || '', parseFloat(price), category_id || null, image_url, parseInt(stock) || 0, active === '0' ? 0 : 1, parseInt(sort_order) || 0,
     pe, pa, pb, pbk, pk, pbh, req.params.id]
  )
  res.json({ success: true, data: result.rows[0] })
})

// Admin: sil
router.delete('/:id', authMiddleware, async (req, res) => {
  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
  if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' })
  await deleteFromCloudinary(existing.rows[0].image_url)
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
