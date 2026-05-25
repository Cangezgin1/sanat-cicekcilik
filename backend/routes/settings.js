const express = require('express')
const router = express.Router()
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

router.get('/public', async (req, res) => {
  const keys = ['business_name','business_address','business_phone','instagram','work_start','work_end','google_rating','google_review_count','orders_enabled','meta_description']
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

// AI açıklama üret (Gemini - ücretsiz)
router.post('/ai-description', authMiddleware, async (req, res) => {
  const { productName } = req.body
  if (!productName) return res.status(400).json({ success: false, message: 'Ürün adı gerekli' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ success: false, message: 'API key eksik' })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bir çiçekçi dükkanı için "${productName}" ürününün kısa, çekici ve Türkçe bir açıklamasını yaz. Maksimum 2 cümle olsun. Sadece açıklamayı yaz, başka bir şey ekleme.`
            }]
          }]
        })
      }
    )
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    res.json({ success: true, description: text.trim() })
  } catch (e) {
    res.status(500).json({ success: false, message: 'AI açıklama oluşturulamadı' })
  }
})
