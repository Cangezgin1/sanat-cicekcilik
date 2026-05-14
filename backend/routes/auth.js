const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({ success: true, token, username: user.username });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Mevcut ve yeni şifre gerekli' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalı' });
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
  const valid = bcrypt.compareSync(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password = ? WHERE id = ?').run(hashed, req.user.id);
  res.json({ success: true, message: 'Şifre güncellendi' });
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, username: req.user.username });
});

module.exports = router;
