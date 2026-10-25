require('dotenv').config();
const app = require('./app');
const { getDatabase } = require('./database/db');

const PORT = process.env.PORT || 5000;

// Initialize database on startup
try {
  getDatabase();
  console.log(' SQLite database successfully connected & initialized.');
} catch (err) {
  console.error(' Failed to initialize SQLite database:', err);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` ShopSphere Backend Server Running on Port ${PORT}`);
  console.log(` Health Check : http://localhost:${PORT}/api/health`);
  console.log(` API Base     : http://localhost:${PORT}/api/v1`);
  console.log(` Client URL   : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`===============================================`);
});

module.exports = server;
