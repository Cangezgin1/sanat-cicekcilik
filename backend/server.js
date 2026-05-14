require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    callback(new Error('CORS politikası ihlali'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

const orderLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/orders', orderLimiter, require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Sanat Çiçekçilik API çalışıyor', timestamp: new Date().toISOString() });
});

app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'Endpoint bulunamadı' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Sunucu hatası' });
});

initDatabase();
app.listen(PORT, () => console.log(`✅ API başladı: http://localhost:${PORT}`));

module.exports = app;
