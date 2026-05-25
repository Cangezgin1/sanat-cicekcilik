const express = require('express')
const router = express.Router()
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

router.post('/', async (req, res) => {
  const { product_id, product_name, product_price, quantity, total_price, district_id, district_name, customer_note } = req.body
  if (!product_name || !quantity || !district_name) return res.status(400).json({ success: false, message: 'Eksik bilgi' })

  const settingsResult = await pool.query('SELECT key, value FROM settings')
  const settings = {}
  settingsResult.rows.forEach(r => { settings[r.key] = r.value })

  if (settings.orders_enabled === '0') return res.status(400).json({ success: false, message: 'Siparişler şu an kapalı' })

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = (settings.work_start || '10:00').split(':').map(Number)
  const [eh, em] = (settings.work_end || '23:30').split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em

  let isOpen = endMin < startMin
    ? (currentMinutes >= startMin || currentMinutes <= endMin)
    : (currentMinutes >= startMin && currentMinutes <= endMin)

  if (!isOpen) return res.status(400).json({ success: false, message: `Çalışma saatlerimiz ${settings.work_start} - ${settings.work_end}` })

  const result = await pool.query(
    `INSERT INTO orders (product_id, product_name, product_price, quantity, total_price, district_id, district_name, customer_note, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING id`,
    [product_id || null, product_name, parseFloat(product_price), parseInt(quantity), parseFloat(total_price), district_id || null, district_name, customer_note || '']
  )
  res.json({ success: true, order_id: result.rows[0].id })
})

router.get('/admin/all', authMiddleware, async (req, res) => {
  const { status, district, date_from, date_to, page = 1, limit = 20 } = req.query
  let where = 'WHERE 1=1'
  const params = []

  if (status) { params.push(status); where += ` AND status = $${params.length}` }
  if (district) { params.push(district); where += ` AND district_name = $${params.length}` }
  if (date_from) { params.push(date_from); where += ` AND DATE(created_at) >= $${params.length}` }
  if (date_to) { params.push(date_to); where += ` AND DATE(created_at) <= $${params.length}` }

  const countResult = await pool.query(`SELECT COUNT(*) FROM orders ${where}`, params)
  const total = parseInt(countResult.rows[0].count)

  params.push(parseInt(limit))
  params.push((parseInt(page) - 1) * parseInt(limit))
  const result = await pool.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

  res.json({ success: true, data: result.rows, total, page: parseInt(page), limit: parseInt(limit) })
})

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body
  if (!['pending', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ success: false, message: 'Geçersiz durum' })
  
  // Mevcut siparişi al
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
  const order = orderResult.rows[0]
  if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })

  const prevStatus = order.status

  // Durumu güncelle
  await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id])

  // Stok düşme/geri yükleme mantığı
  if (order.product_id) {
    if (status === 'completed' && prevStatus !== 'completed') {
      // Teslim edildi → stok düş
      await pool.query(
        'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
        [order.quantity, order.product_id]
      )
    } else if (prevStatus === 'completed' && status !== 'completed') {
      // Teslim edildi'den geri alındı → stok geri ekle
      await pool.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [order.quantity, order.product_id]
      )
    }
  }

  res.json({ success: true })
})

router.get('/admin/stats', authMiddleware, async (req, res) => {
  // Türkiye saati (UTC+3)
  const tzOffset = 3 * 60 * 60 * 1000
  const now = new Date(Date.now() + tzOffset)
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() + tzOffset - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [todayTotal, todayCompleted, todayCancelled, todayPending,
         weekTotal, weekCompleted, weekRevenue,
         allTotal, allCompleted, allRevenue,
         byDistrict, byProduct] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1", [today]),
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status='completed'", [today]),
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status='cancelled'", [today]),
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status='pending'", [today]),
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) >= $1", [weekAgo]),
    pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) >= $1 AND status='completed'", [weekAgo]),
    pool.query("SELECT COALESCE(SUM(total_price),0) FROM orders WHERE DATE(created_at) >= $1 AND status='completed'", [weekAgo]),
    pool.query("SELECT COUNT(*) FROM orders"),
    pool.query("SELECT COUNT(*) FROM orders WHERE status='completed'"),
    pool.query("SELECT COALESCE(SUM(total_price),0) FROM orders WHERE status='completed'"),
    pool.query("SELECT district_name, COUNT(*) as count FROM orders GROUP BY district_name ORDER BY count DESC"),
    pool.query("SELECT product_name, COUNT(*) as count, SUM(quantity) as total_qty FROM orders GROUP BY product_name ORDER BY count DESC LIMIT 5"),
  ])

  res.json({
    success: true,
    data: {
      today: { total: +todayTotal.rows[0].count, completed: +todayCompleted.rows[0].count, cancelled: +todayCancelled.rows[0].count, pending: +todayPending.rows[0].count },
      week: { total: +weekTotal.rows[0].count, completed: +weekCompleted.rows[0].count, revenue: +weekRevenue.rows[0].coalesce },
      all_time: { total: +allTotal.rows[0].count, completed: +allCompleted.rows[0].count, revenue: +allRevenue.rows[0].coalesce },
      by_district: byDistrict.rows,
      by_product: byProduct.rows,
    }
  })
})

module.exports = router

// Admin: sipariş sil (sadece pending veya cancelled)
router.delete('/:id', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
  const order = result.rows[0]
  if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' })
  if (order.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Teslim edilmiş siparişler silinemez' })
  }
  await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id])
  res.json({ success: true })
})
