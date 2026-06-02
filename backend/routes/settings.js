const express = require('express')
const router = express.Router()
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')
 
router.get('/public', async (req, res) => {
  const keys = ['business_name','business_address','business_phone','instagram','work_start','work_end','google_rating','google_review_count','orders_enabled','meta_description','whatsapp_number']
  const result = await pool.query(`SELECT key, value FROM settings WHERE key = ANY($1)`, [keys])
  const settings = {}
  result.rows.forEach(r => { settings[r.key] = r.value })
  res.json({ success: true, data: settings })
})
 
router.get('/', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT key, value FROM settings')
  const settings = {}
  result.rows.forEach(r => { settings[r.key] = r.value })
  res.json({ success: true, data: settings })
})
 
router.put('/', authMiddleware, async (req, res) => {
  const updates = req.body
  for (const [key, value] of Object.entries(updates)) {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [key, String(value)]
    )
  }
  res.json({ success: true, message: 'Ayarlar güncellendi' })
})
 
module.exports = router