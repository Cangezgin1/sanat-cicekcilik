const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Kolay sorgu fonksiyonu
const db = {
  query: (text, params) => pool.query(text, params),
  
  // SQLite'a benzer synchronous-style için wrapper
  prepare: (text) => ({
    get: async (...params) => {
      const result = await pool.query(text, params)
      return result.rows[0] || null
    },
    all: async (...params) => {
      const result = await pool.query(text, params)
      return result.rows
    },
    run: async (...params) => {
      const result = await pool.query(text, params)
      return { lastInsertRowid: result.rows[0]?.id, changes: result.rowCount }
    },
  }),
}

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS districts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        district_id INTEGER,
        district_name TEXT NOT NULL,
        customer_note TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await seedData()
    console.log('✅ Veritabanı hazır')
  } catch (err) {
    console.error('❌ Veritabanı hatası:', err)
    throw err
  }
}

async function seedData() {
  // Admin kullanıcı
  const adminExists = await pool.query('SELECT id FROM admin_users WHERE username = $1', ['admin'])
  if (adminExists.rows.length === 0) {
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'sanat2024', 10)
    await pool.query('INSERT INTO admin_users (username, password) VALUES ($1, $2)', ['admin', adminPassword])
  }

  // Ayarlar
  const settingsCount = await pool.query('SELECT COUNT(*) FROM settings')
  if (parseInt(settingsCount.rows[0].count) > 0) return

  const defaultSettings = [
    ['whatsapp_number', '905012764747'],
    ['business_name', 'Sanat Çiçekçilik'],
    ['business_address', 'Yeşilkent Mh. Balıkyolu Cd. No:70/B Avcılar/İstanbul'],
    ['business_phone', '05432990430'],
    ['instagram', 'sanat_cicekcilik'],
    ['work_start', '10:00'],
    ['work_end', '23:30'],
    ['google_maps_place_id', 'ChIJISWFmrWgyhQRBWaxkwH5D5A'],
    ['google_maps_api_key', ''],
    ['google_rating', '4.9'],
    ['google_review_count', '128'],
    ['orders_enabled', '1'],
    ['meta_description', 'Avcılar\'ın en güzel çiçekçisi Sanat Çiçekçilik. Buket, aranjman, saksı çiçeği. Avcılar, Esenyurt, Beylikdüzü\'ne hızlı teslimat.'],
  ]

  for (const [key, value] of defaultSettings) {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, value]
    )
  }

  // Kategoriler
  const cats = [
    ['Buket', 'buket', 1],
    ['Aranjman', 'aranjman', 2],
    ['Saksı Çiçeği', 'saksi-cicegi', 3],
    ['Gelin Buketi', 'gelin-buketi', 4],
    ['Kır Çiçeği', 'kir-cicegi', 5],
    ['Yapay Çiçek', 'yapay-cicek', 6],
  ]
  for (const [name, slug, order] of cats) {
    await pool.query(
      'INSERT INTO categories (name, slug, sort_order) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
      [name, slug, order]
    )
  }

  // İlçeler
  const districts = ['Avcılar', 'Esenyurt', 'Beylikdüzü', 'Büyükçekmece', 'Esenkent', 'Bahçeşehir']
  for (let i = 0; i < districts.length; i++) {
    await pool.query(
      'INSERT INTO districts (name, active, sort_order) VALUES ($1, 1, $2) ON CONFLICT (name) DO NOTHING',
      [districts[i], i + 1]
    )
  }

  // Örnek ürünler
  const catRows = await pool.query('SELECT id, slug FROM categories')
  const catMap = {}
  catRows.rows.forEach(c => { catMap[c.slug] = c.id })

  const products = [
    ['Kırmızı Güller Buketi', 'El işi özenle hazırlanmış 11 adet kırmızı gül buketi.', 450, 'buket', 10],
    ['Pembe Papatya Aranjmanı', 'Taze pembe papatyalarla hazırlanmış şık masa aranjmanı.', 320, 'aranjman', 8],
    ['Orkide Saksısı', 'Uzun ömürlü, zarif beyaz orkide saksı çiçeği.', 550, 'saksi-cicegi', 5],
    ['Gelin Buketi Klasik', 'Beyaz güller ve yeşilliklerle hazırlanmış klasik gelin buketi.', 850, 'gelin-buketi', 3],
    ['Kır Çiçekleri Buketi', 'Doğadan ilham alan renkli kır çiçekleri karışımı buket.', 380, 'kir-cicegi', 12],
    ['Yapay Lale Aranjmanı', 'Solmayan, dayanıklı yapay lalelerle hazırlanmış şık aranjman.', 290, 'yapay-cicek', 15],
    ['Sarı Papatya Buketi', '15 adet taze sarı papatya buketi.', 280, 'buket', 20],
    ['Mor Sümbül Saksısı', 'Baharın kokusu mor sümbül saksı çiçeği.', 220, 'saksi-cicegi', 7],
    ['Kırmızı-Beyaz Aranjman', 'Özel günler için kırmızı ve beyaz güllerin muhteşem uyumu.', 520, 'aranjman', 6],
    ['Karışık Mevsim Buketi', 'Mevsimin en taze çiçekleriyle hazırlanan sürpriz buket.', 350, 'buket', 18],
  ]

  for (const [name, desc, price, catSlug, stock] of products) {
    await pool.query(
      'INSERT INTO products (name, description, price, category_id, stock, active) VALUES ($1, $2, $3, $4, $5, 1)',
      [name, desc, price, catMap[catSlug], stock]
    )
  }

  console.log('✅ Seed verisi eklendi')
}

module.exports = { pool, db, initDatabase }
