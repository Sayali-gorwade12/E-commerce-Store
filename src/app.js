const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { getDatabase } = require('./database/db');

const app = express();

// Security headers
app.use(helmet());

// Permissive CORS configuration supporting any localhost port in development
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, mobile, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, 3000) or clientUrl
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === clientUrl) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Health check endpoint (GET /api/health)
app.get('/api/health', (req, res) => {
  try {
    const db = getDatabase();
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();

    return res.status(200).json({
      success: true,
      message: 'ShopSphere API is healthy and operational.',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'SQLite',
        totalProducts: productCount ? productCount.count : 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connectivity error.',
      error: error.message
    });
  }
});

// Mount API v1 routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/categories', (req, res, next) => {
  const productController = require('./controllers/productController');
  productController.getCategories(req, res, next);
});

// 404 and centralized error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
