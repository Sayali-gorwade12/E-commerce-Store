const path = require('path');
const fs = require('fs');

let DatabaseConstructor;

try {
  DatabaseConstructor = require('better-sqlite3');
} catch (err) {
  // Use Node.js built-in SQLite engine (node:sqlite DatabaseSync) with 100% compatible API
  const { DatabaseSync } = require('node:sqlite');

  DatabaseConstructor = class BetterSqlite3Compat extends DatabaseSync {
    constructor(filename, options) {
      super(filename, options || {});
    }

    pragma(pragmaStr) {
      this.exec(`PRAGMA ${pragmaStr};`);
    }

    transaction(fn) {
      return (...args) => {
        this.exec('BEGIN TRANSACTION;');
        try {
          const result = fn(...args);
          this.exec('COMMIT;');
          return result;
        } catch (error) {
          try {
            this.exec('ROLLBACK;');
          } catch (rbErr) {
            // Transaction might have already rolled back
          }
          throw error;
        }
      };
    }
  };
}

let dbInstance = null;

function getDatabase(dbPath) {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  const targetPath = dbPath || process.env.DATABASE_PATH || path.join(__dirname, 'shop.db');

  if (targetPath !== ':memory:') {
    const dir = path.dirname(path.resolve(targetPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseConstructor(targetPath);
  db.pragma('foreign_keys = ON');

  // Initialize tables
  initSchema(db);

  // Seed sample products if empty
  seedProductsIfEmpty(db);

  if (!dbPath) {
    dbInstance = db;
  }

  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      order_status TEXT NOT NULL DEFAULT 'Placed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);
}

function seedProductsIfEmpty(db) {
  const row = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (row && row.count > 0) {
    return;
  }

  const sampleProducts = [
    {
      name: 'AcousticPro Wireless Noise-Cancelling Headphones',
      description: 'Premium wireless over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear high fidelity sound.',
      price: 4999.00,
      category: 'Electronics',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      stock: 25
    },
    {
      name: 'Chronos Ultra Smartwatch Series 5',
      description: 'Sleek fitness and health tracker featuring AMOLED display, SpO2 sensor, sleep monitoring, GPS, and water resistance up to 50m.',
      price: 3499.00,
      category: 'Electronics',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      stock: 40
    },
    {
      name: 'Classic Vintage Leather Backpack',
      description: 'Handcrafted genuine leather backpack with padded 15.6-inch laptop compartment, antique brass hardware, and ergonomic shoulder straps.',
      price: 2799.00,
      category: 'Accessories',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      stock: 18
    },
    {
      name: 'Minimalist Oxford Cotton Casual Shirt',
      description: 'Tailored 100% breathable organic cotton shirt with a relaxed modern fit, button-down collar, and soft-washed texture.',
      price: 1299.00,
      category: 'Fashion',
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      stock: 35
    },
    {
      name: 'AromaPulse Ultrasonic Ceramic Diffuser',
      description: 'Elegant ceramic essential oil diffuser with ambient warm LED nightlight, whisper-quiet operation, and auto shut-off function.',
      price: 1899.00,
      category: 'Home & Living',
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
      stock: 30
    },
    {
      name: 'Polarized Aviator Sunglasses in Matte Black',
      description: 'Classic UV400 protective polarized lenses in an ultra-lightweight stainless steel frame with anti-reflective coating.',
      price: 1499.00,
      category: 'Accessories',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
      stock: 50
    },
    {
      name: 'ProBass Portable Waterproof Bluetooth Speaker',
      description: 'Compact IPX7 rugged waterproof speaker delivering punchy 360-degree sound, 16-hour playtime, and built-in microphone for calls.',
      price: 2199.00,
      category: 'Electronics',
      image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
      stock: 22
    },
    {
      name: 'Urban Glide Lightweight Running Shoes',
      description: 'Engineered breathable mesh upper with responsive EVA cushioning and high-traction rubber outsole for daily running and workouts.',
      price: 2999.00,
      category: 'Fashion',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      stock: 28
    },
    {
      name: 'PurePour Double-Wall French Press Coffee Maker',
      description: 'Insulated stainless steel coffee and tea press that keeps brew hot for hours without paper filters, retaining rich aromatic oils.',
      price: 1699.00,
      category: 'Home & Living',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      stock: 20
    },
    {
      name: 'Slimline RFID-Blocking Leather Cardholder',
      description: 'Slim bifold wallet crafted from full-grain leather with RFID shielding to safeguard credit cards and quick-access thumb slot.',
      price: 899.00,
      category: 'Accessories',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      stock: 45
    },
    {
      name: 'Lumina Ergonomic LED Desk Lamp',
      description: 'Modern desk lamp with adjustable gooseneck, 5 color temperature modes, 7 brightness levels, and built-in USB charging port.',
      price: 2499.00,
      category: 'Home & Living',
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      stock: 15
    },
    {
      name: 'Denim Heritage Slim Tapered Jeans',
      description: 'Comfort stretch denim crafted with durable twill weave, classic five-pocket styling, and reinforced seam stitching.',
      price: 2199.00,
      category: 'Fashion',
      image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
      stock: 32
    }
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of sampleProducts) {
    insert.run(p.name, p.description, p.price, p.category, p.image_url, p.stock);
  }
}

module.exports = {
  getDatabase,
  initSchema,
  seedProductsIfEmpty
};
