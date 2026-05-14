const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      district_id INTEGER,
      district_name TEXT NOT NULL,
      customer_note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsCount.count > 0) return;

  const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'sanat2024', 10);
  db.prepare('INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)').run(
    process.env.ADMIN_USERNAME || 'admin',
    adminPassword
  );

  const defaultSettings = [
    ['whatsapp_number', '905432990430'],
    ['business_name', 'Sanat Çiçekçilik'],
    ['business_address', 'Yeşilkent Mh. Balıkyolu Cd. No:70/B Avcılar/İstanbul'],
    ['business_phone', '05432990430'],
    ['instagram', 'sanat_cicekcilik'],
    ['work_start', '10:00'],
    ['work_end', '23:30'],
    ['google_maps_place_id', ''],
    ['google_maps_api_key', ''],
    ['google_rating', '4.9'],
    ['google_review_count', '120'],
    ['orders_enabled', '1'],
    ['meta_description', 'Avcılar\'ın en güzel çiçekçisi Sanat Çiçekçilik. Buket, aranjman, saksı çiçeği ve daha fazlası. Avcılar, Esenyurt, Beylikdüzü, Büyükçekmece\'ye hızlı teslimat.'],
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([key, value]) => insertSetting.run(key, value));

  const categories = [
    ['Buket', 'buket', 1],
    ['Aranjman', 'aranjman', 2],
    ['Saksı Çiçeği', 'saksi-cicegi', 3],
    ['Gelin Buketi', 'gelin-buketi', 4],
    ['Kır Çiçeği', 'kir-cicegi', 5],
    ['Yapay Çiçek', 'yapay-cicek', 6],
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
  categories.forEach(([name, slug, order]) => insertCategory.run(name, slug, order));

  const districts = [
    ['Avcılar', 1, 1],
    ['Esenyurt', 1, 2],
    ['Beylikdüzü', 1, 3],
    ['Büyükçekmece', 1, 4],
    ['Esenkent', 1, 5],
    ['Bahçeşehir', 1, 6],
  ];

  const insertDistrict = db.prepare('INSERT OR IGNORE INTO districts (name, active, sort_order) VALUES (?, ?, ?)');
  districts.forEach(([name, active, order]) => insertDistrict.run(name, active, order));

  const products = [
    ['Kırmızı Güller Buketi', 'El işi özenle hazırlanmış 11 adet kırmızı gül buketi. Sevdiklerinize en güzel hediye.', 450, 1, 10, 1],
    ['Pembe Papatya Aranjmanı', 'Taze pembe papatyalarla hazırlanmış şık masa aranjmanı.', 320, 2, 8, 1],
    ['Orkide Saksısı', 'Uzun ömürlü, zarif beyaz orkide saksı çiçeği.', 550, 3, 5, 1],
    ['Gelin Buketi Klasik', 'Beyaz güller ve yeşilliklerle hazırlanmış klasik gelin buketi.', 850, 4, 3, 1],
    ['Kır Çiçekleri Buketi', 'Doğadan ilham alan renkli kır çiçekleri karışımı buket.', 380, 5, 12, 1],
    ['Yapay Lale Aranjmanı', 'Solmayan, dayanıklı yapay lalelerle hazırlanmış şık aranjman.', 290, 6, 15, 1],
    ['Sarı Papatya Buketi', '15 adet taze sarı papatya buketi. Neşe dolu hediye seçeneği.', 280, 1, 20, 1],
    ['Mor Sümbül Saksısı', 'Baharın kokusu mor sümbül saksı çiçeği.', 220, 3, 7, 1],
    ['Kırmızı-Beyaz Aranjman', 'Özel günler için kırmızı ve beyaz güllerin muhteşem uyumu.', 520, 2, 6, 1],
    ['Karışık Mevsim Buketi', 'Mevsimin en taze çiçekleriyle hazırlanan sürpriz buket.', 350, 1, 18, 1],
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, price, category_id, stock, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  products.forEach(p => insertProduct.run(...p));
}

module.exports = { db, initDatabase };
