const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

// Configure isolated test database
const testDbPath = path.join(__dirname, 'test.db');
if (fs.existsSync(testDbPath)) {
  try {
    fs.unlinkSync(testDbPath);
  } catch (e) {}
}

process.env.DATABASE_PATH = testDbPath;
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const { getDatabase } = require('../src/database/db');

describe('ShopSphere Full-Stack E-commerce API Tests', () => {
  let db;
  let server;
  let baseUrl;
  let testUserToken;
  let secondUserToken;
  let createdOrderId;
  let createdOrderNumber;
  let targetProduct;

  before(async () => {
    db = getDatabase(testDbPath);
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  async function api(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  // 1. Health endpoint
  it('1. Health endpoint responds with status UP and product count', async () => {
    const res = await api('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'UP');
    assert.strictEqual(res.body.data.database, 'SQLite');
    assert.ok(res.body.data.totalProducts >= 12, 'Should have seeded at least 12 products');
  });

  // 2. Product listing
  it('2. Product listing returns seeded products and pagination metadata', async () => {
    const res = await api('/api/v1/products');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 12);
    assert.ok(res.body.pagination.total >= 12);
    targetProduct = res.body.data[0];
  });

  // 3. Product details
  it('3. Product details returns the correct product by ID and handles invalid IDs', async () => {
    const res = await api(`/api/v1/products/${targetProduct.id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, targetProduct.id);
    assert.strictEqual(res.body.data.name, targetProduct.name);

    // Invalid product ID
    const notFound = await api('/api/v1/products/99999');
    assert.strictEqual(notFound.status, 404);
    assert.strictEqual(notFound.body.success, false);
  });

  // 4. User registration
  it('4. User registration succeeds with valid input and returns JWT token', async () => {
    const res = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        name: 'Arjun Sharma',
        email: 'arjun@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'arjun@example.com');
    assert.strictEqual(res.body.data.user.name, 'Arjun Sharma');
    testUserToken = res.body.data.token;
  });

  // 5. Duplicate email registration
  it('5. Duplicate email registration is rejected with status 400', async () => {
    const res = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        name: 'Arjun Clone',
        email: 'arjun@example.com',
        password: 'anotherpassword',
        confirmPassword: 'anotherpassword'
      }
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  // 6. Successful login
  it('6. Successful login returns JWT token and user info', async () => {
    const res = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'arjun@example.com',
        password: 'password123'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'arjun@example.com');
  });

  // 7. Invalid login
  it('7. Invalid login credentials are rejected with status 401', async () => {
    const res = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'arjun@example.com',
        password: 'wrongpassword'
      }
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 8. Protected endpoint without a token
  it('8. Protected endpoint rejects requests without a valid Bearer token', async () => {
    const res = await api('/api/v1/auth/me');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /token is missing/i);
  });

  // 9. Checkout without authentication
  it('9. Checkout rejects unauthenticated users with status 401', async () => {
    const res = await api('/api/v1/orders', {
      method: 'POST',
      body: {
        customer_name: 'Unauth User',
        phone: '9876543210',
        shipping_address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001',
        payment_method: 'Cash on Delivery',
        items: [{ product_id: targetProduct.id, quantity: 1 }]
      }
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 10. Successful order creation
  it('10. Successful order creation saves order and items atomically', async () => {
    const res = await api('/api/v1/orders', {
      method: 'POST',
      token: testUserToken,
      body: {
        customer_name: 'Arjun Sharma',
        phone: '9876543210',
        shipping_address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        payment_method: 'Cash on Delivery',
        items: [{ product_id: targetProduct.id, quantity: 2 }]
      }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.order_number);
    assert.strictEqual(res.body.data.order_status, 'Placed');
    createdOrderId = res.body.data.id;
    createdOrderNumber = res.body.data.order_number;
  });

  // 11. Rejection of insufficient stock
  it('11. Order creation rejects quantities exceeding available stock', async () => {
    const res = await api('/api/v1/orders', {
      method: 'POST',
      token: testUserToken,
      body: {
        customer_name: 'Arjun Sharma',
        phone: '9876543210',
        shipping_address: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        items: [{ product_id: targetProduct.id, quantity: 999999 }]
      }
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /insufficient stock/i);
  });

  // 12. Prevention of access to another user's order
  it('12. Prevents users from viewing another user\'s order', async () => {
    // Register second user
    const regRes = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
    });

    assert.strictEqual(regRes.status, 201);
    secondUserToken = regRes.body.data.token;

    // Second user attempts to access first user's order
    const accessRes = await api(`/api/v1/orders/${createdOrderId}`, {
      token: secondUserToken
    });

    assert.strictEqual(accessRes.status, 403);
    assert.strictEqual(accessRes.body.success, false);
    assert.match(accessRes.body.message, /permission|forbidden/i);
  });

  // 13. Database stock reduction after a successful order
  it('13. Product stock is reduced in the database after successful order', () => {
    const updatedProd = db.prepare('SELECT stock FROM products WHERE id = ?').get(targetProduct.id);
    assert.strictEqual(updatedProd.stock, targetProduct.stock - 2);
  });

  // 14. Database rollback when order creation fails
  it('14. Database transaction rolls back completely when an item is invalid', async () => {
    const stockBefore = db.prepare('SELECT stock FROM products WHERE id = ?').get(targetProduct.id).stock;

    const res = await api('/api/v1/orders', {
      method: 'POST',
      token: testUserToken,
      body: {
        customer_name: 'Arjun Sharma',
        phone: '9876543210',
        shipping_address: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        items: [
          { product_id: targetProduct.id, quantity: 1 },
          { product_id: 99999, quantity: 1 } // Non-existent product
        ]
      }
    });

    assert.strictEqual(res.status, 400);

    const stockAfter = db.prepare('SELECT stock FROM products WHERE id = ?').get(targetProduct.id).stock;
    assert.strictEqual(stockAfter, stockBefore, 'Stock should NOT be decreased on rolled back order');
  });

  // 15. Server-side price calculation
  it('15. Order total is strictly calculated on server using database prices', async () => {
    // Client sends spoofed fake cheap price (e.g. ₹1)
    const spoofedPrice = 1.00;
    const res = await api('/api/v1/orders', {
      method: 'POST',
      token: testUserToken,
      body: {
        customer_name: 'Arjun Sharma',
        phone: '9876543210',
        shipping_address: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        payment_method: 'Cash on Delivery',
        items: [{ product_id: targetProduct.id, quantity: 1, price: spoofedPrice }]
      }
    });

    assert.strictEqual(res.status, 201);
    // Verify the server calculated using actual database price
    assert.strictEqual(res.body.data.items[0].price, targetProduct.price);
    assert.notStrictEqual(res.body.data.items[0].price, spoofedPrice);
  });
});
