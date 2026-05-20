const express = require('express')
const router = express.Router()
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM districts ORDER BY sort_order ASC')
  res.json({ success: true, data: result.rows })
})

router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT active FROM districts WHERE id = $1', [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'İlçe bulunamadı' })
  const newActive = result.rows[0].active ? 0 : 1
  await pool.query('UPDATE districts SET active = $1 WHERE id = $2', [newActive, req.params.id])
  res.json({ success: true, active: !!newActive })
})

module.exports = router
