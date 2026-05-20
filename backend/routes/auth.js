const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../database')
const authMiddleware = require('../middleware/auth')

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' })
  
  const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' })

  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' })

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
  res.json({ success: true, token, username: user.username })
})

router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Şifreler gerekli' })
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter' })

  const result = await pool.query('SELECT * FROM admin_users WHERE id = $1', [req.user.id])
  const user = result.rows[0]
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı' })
  }

  const hashed = bcrypt.hashSync(newPassword, 10)
  await pool.query('UPDATE admin_users SET password = $1 WHERE id = $2', [hashed, req.user.id])
  res.json({ success: true, message: 'Şifre güncellendi' })
})

router.post('/reset-password', async (req, res) => {
  const { answer, newPassword } = req.body
  if (!answer || answer.toLowerCase().trim() !== 'sanat') {
    return res.status(401).json({ success: false, message: 'Güvenlik sorusu cevabı hatalı' })
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalı' })
  }
  const hashed = bcrypt.hashSync(newPassword, 10)
  await pool.query('UPDATE admin_users SET password = $1 WHERE id = 1', [hashed])
  res.json({ success: true, message: 'Şifre güncellendi' })
})

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, username: req.user.username })
})

module.exports = router
