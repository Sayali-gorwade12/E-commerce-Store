# ShopSphere — Full Stack E-commerce Store

[![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full%20Stack%20Internship-blue.svg)](https://codealpha.tech)
[![Task 1](https://img.shields.io/badge/Task-1%20Simple%20E--commerce%20Store-green.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20SQLite-orange.svg)](#)
[![Automated Tests](https://img.shields.io/badge/Tests-15%20Passed%20%7C%200%20Failed-success.svg)](#automated-testing)

A complete, responsive, full-stack e-commerce web application developed for **CodeAlpha Full Stack Development Internship — Task 1 (Simple E-commerce Store)**.

ShopSphere features a clean shopping interface built with **React & Vite**, backed by a secure **Node.js & Express REST API**, and persisted using a fast, self-contained **SQLite database** with atomic transactions and server-side stock reconciliation.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Project Architecture & Structure](#project-architecture--structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start & Installation](#quick-start--installation)
6. [Environment Variables](#environment-variables)
7. [Database Architecture & Seeding](#database-architecture--seeding)
8. [REST API Endpoints](#rest-api-endpoints)
9. [Automated Testing](#automated-testing)
10. [GitHub Submission Instructions](#github-submission-instructions)
11. [Deployment Guide](#deployment-guide)

---

## Key Features

### 🛍️ Customer Shopping Experience
- **Home Page**: Hero showcase banner, featured products, shop by category cards, value guarantees, and newsletter callouts.
- **Product Catalog (`/products`)**:
  - Live search by product name and description.
  - Category filtering pills (Electronics, Fashion, Home & Living, Accessories).
  - Multi-criteria sorting (Newest Arrivals, Price: Low to High, Price: High to Low, Name: A to Z).
  - Dynamic pagination metadata with responsive navigation controls.
- **Product Details (`/products/:id`)**:
  - High-resolution imagery with graceful fallback placeholder.
  - Real-time stock status counter and category badge.
  - Interactive quantity selector with automatic stock boundary limits.
  - Instant Add to Cart feedback and "Buy Now" direct checkout flow.
- **Shopping Cart (`/cart`)**:
  - Persistent cart state synchronized across refreshes via `localStorage`.
  - Item increment, decrement, and removal controls.
  - Visual free shipping progress bar (Free delivery on orders exceeding ₹999).
  - Safe decimal calculation via integer paise to eliminate floating-point rounding errors.

### 🔐 Authentication & Account Management
- **JWT-Based Authentication**: Secure Bearer token issued upon login and stored in client storage with automatic expiration checks.
- **Password Protection**: Passwords hashed securely using `bcryptjs` with salt rounds.
- **User Registration (`/register`)**: Full name, email format, password strength, and password confirmation validation.
- **User Login (`/login`)**: Quick credentials validation and automatic redirect back to previous intended checkout routes.
- **Profile Management (`/profile`)**: Update profile name, secure password modification requiring current password verification, and instant logout.

### 📦 Checkout & Atomic Order Processing
- **Secure Checkout (`/checkout`)**:
  - Requires user authentication; unauthenticated users are guided through login first.
  - Collects recipient full name, phone number, shipping address, city, state, and postal code.
  - Choice of payment options: **Cash on Delivery (COD)** (real working option) and **Demo Online Payment** (clearly simulated demo option).
  - **Server-Side Price Recalculation**: The server never trusts client-submitted totals; all unit prices and subtotals are re-queried directly from SQLite.
  - **Atomic Transaction**: SQLite transaction creates the order, inserts line items, and atomically reduces product inventory.
  - **Automatic Rollback**: Any error (insufficient stock, invalid product ID) immediately aborts the transaction with zero changes persisted.
- **Order Confirmation (`/order-confirmation/:orderNumber`)**: Displays unique order reference ID, items summary, and delivery address.
- **My Orders (`/orders`)**: Protected order history displaying all previous purchases belonging exclusively to the authenticated user with real-time status badges (`Placed`, `Shipped`, `Delivered`).

---

## Technology Stack

| Layer | Technologies & Packages |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide React Icons |
| **Styling** | Modern CSS3 (CSS Variables, Flexbox, CSS Grid, Responsive Breakpoints) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (`better-sqlite3` & Node.js built-in `node:sqlite` adapter) |
| **Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit` |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) with automated HTTP integration tests |

---

## Project Architecture & Structure

```text
CodeAlpha_EcommerceStore/
├── client/                      # Frontend React Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx       # Header navigation with cart badge & auth menu
│   │   │   ├── Footer.jsx       # Footer with value propositions & links
│   │   │   ├── ProductCard.jsx  # Individual product card with image & add to cart
│   │   │   ├── ProductGrid.jsx  # Responsive product grid
│   │   │   ├── SearchBar.jsx    # Live keyword search input
│   │   │   ├── CategoryFilter.jsx # Category pill selector
│   │   │   ├── SortDropdown.jsx # Sorting options dropdown
│   │   │   ├── QuantitySelector.jsx # Quantity + / - controls
│   │   │   ├── CartItem.jsx     # Cart item table row
│   │   │   ├── ProtectedRoute.jsx # Authentication guard
│   │   │   ├── LoadingSpinner.jsx # Loading state indicator
│   │   │   ├── ErrorMessage.jsx # Error banner with retry
│   │   │   └── EmptyState.jsx   # Empty catalog / cart display
│   │   ├── pages/               # Application Views
│   │   │   ├── HomePage.jsx     # Landing page with hero & highlights
│   │   │   ├── ProductsPage.jsx # Catalog with search, filter, sort & pagination
│   │   │   ├── ProductDetailPage.jsx # Product specifications & buy action
│   │   │   ├── CartPage.jsx     # Cart summary & free shipping progress
│   │   │   ├── RegisterPage.jsx # Account registration
│   │   │   ├── LoginPage.jsx    # Account login
│   │   │   ├── CheckoutPage.jsx # Address collection & order submission
│   │   │   ├── OrderConfirmationPage.jsx # Post-purchase receipt
│   │   │   ├── MyOrdersPage.jsx # User order history
│   │   │   └── ProfilePage.jsx  # Name & password management
│   │   ├── context/             # Global State
│   │   │   ├── AuthContext.jsx  # User session & authentication state
│   │   │   └── CartContext.jsx  # Shopping cart state & paise calculation
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with auth interceptor
│   │   ├── styles/
│   │   │   └── index.css        # Design system styles
│   │   ├── App.jsx              # Routing definition
│   │   └── main.jsx             # React DOM entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json              # SPA rewrite configuration for Vercel
│   ├── package.json
│   └── .env.example
├── server/                      # Backend Express & SQLite Application
│   ├── src/
│   │   ├── database/
│   │   │   └── db.js            # SQLite database connection, schema & auto-seed
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile, password
│   │   │   ├── productController.js # Catalog, categories, single item
│   │   │   └── orderController.js   # Atomic checkout transaction, my-orders
│   │   ├── middleware/
│   │   │   ├── auth.js          # Bearer JWT verification
│   │   │   └── errorHandler.js  # 404 handler and central error interceptor
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── utils/
│   │   │   └── money.js         # Paise-safe money calculation & shipping rules
│   │   ├── app.js               # Express app configuration & middleware
│   │   └── server.js            # Port listener & startup entry point
│   ├── tests/
│   │   └── ecommerce.test.js    # 15 automated integration tests
│   ├── package.json
│   ├── .env.example
│   └── .env
├── package.json                 # Root script orchestration
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node.js `v24.x`)
- **npm**: `v9.0.0` or higher
- **Operating System**: Windows, macOS, or Linux

---

## Quick Start & Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/CodeAlpha_EcommerceStore.git
cd CodeAlpha_EcommerceStore
```

### Step 2: Install Dependencies
You can install dependencies for both frontend and backend using root scripts:
```bash
# Install backend dependencies
npm --prefix server install

# Install frontend dependencies
npm --prefix client install
```

### Step 3: Run the Development Server
You can launch both the backend server and frontend client concurrently:

```bash
# Terminal 1: Start Backend (Port 5000)
npm --prefix server run dev

# Terminal 2: Start Frontend (Port 5173)
npm --prefix client run dev
```

Alternatively, from the project root:
```bash
npm run dev
```

### Step 4: Open in Your Browser
- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Environment Variables

### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_shopsphere_codealpha_2024_secure
CLIENT_URL=http://localhost:5173
DATABASE_PATH=./src/database/shop.db
```

### Frontend Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Database Architecture & Seeding

The SQLite database file is stored at `server/src/database/shop.db` and is **automatically initialized on the first server start**.

### Relational Schema

```sql
-- 1. Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE orders (
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

-- 4. Order Items Table
CREATE TABLE order_items (
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
```

### Auto-Seeded Demo Catalog
The database automatically seeds **12 realistic demo products** across 4 categories upon first run:
- **Electronics**: AcousticPro Noise-Cancelling Headphones, Chronos Ultra Smartwatch Series 5, ProBass Bluetooth Speaker
- **Fashion**: Minimalist Oxford Cotton Casual Shirt, Urban Glide Running Shoes, Denim Heritage Slim Tapered Jeans
- **Home & Living**: AromaPulse Ultrasonic Ceramic Diffuser, PurePour French Press Coffee Maker, Lumina Ergonomic LED Desk Lamp
- **Accessories**: Classic Vintage Leather Backpack, Polarized Aviator Sunglasses, Slimline RFID-Blocking Cardholder

---

## REST API Endpoints

### Base URL: `/api/v1`

| Category | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public | System status and database connectivity |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Create new customer account |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate user & receive JWT token |
| **Auth** | `GET` | `/api/v1/auth/me` | Protected | Fetch current logged-in user details |
| **Auth** | `PUT` | `/api/v1/auth/profile` | Protected | Update customer display name |
| **Auth** | `PUT` | `/api/v1/auth/change-password` | Protected | Securely change account password |
| **Products** | `GET` | `/api/v1/products` | Public | Get products with search, category & pagination |
| **Products** | `GET` | `/api/v1/products/:id` | Public | Retrieve single product details |
| **Products** | `GET` | `/api/v1/categories` | Public | Get all categories and product counts |
| **Orders** | `POST` | `/api/v1/orders` | Protected | Atomic order creation with stock decrement |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | Protected | Retrieve all orders for logged-in user |
| **Orders** | `GET` | `/api/v1/orders/:id` | Protected | Retrieve specific order details by ID/number |

---

## Automated Testing

The project includes an automated integration test suite covering **all 15 required verification scenarios**. Tests run against an isolated temporary test database (`tests/test.db`) to ensure the development database is never altered.

### Run Automated Tests
```bash
npm test
```
Or directly in the server directory:
```bash
npm --prefix server test
```

### Verified Test Results

```text
▶ ShopSphere Full-Stack E-commerce API Tests
  ✔ 1. Health endpoint responds with status UP and product count (129ms)
  ✔ 2. Product listing returns seeded products and pagination metadata (20ms)
  ✔ 3. Product details returns the correct product by ID and handles invalid IDs (15ms)
  ✔ 4. User registration succeeds with valid input and returns JWT token (315ms)
  ✔ 5. Duplicate email registration is rejected with status 400 (6ms)
  ✔ 6. Successful login returns JWT token and user info (115ms)
  ✔ 7. Invalid login credentials are rejected with status 401 (113ms)
  ✔ 8. Protected endpoint rejects requests without a valid Bearer token (4ms)
  ✔ 9. Checkout rejects unauthenticated users with status 401 (9ms)
  ✔ 10. Successful order creation saves order and items atomically (71ms)
  ✔ 11. Order creation rejects quantities exceeding available stock (6ms)
  ✔ 12. Prevents users from viewing another user's order (196ms)
  ✔ 13. Product stock is reduced in the database after successful order (0.4ms)
  ✔ 14. Database transaction rolls back completely when an item is invalid (8ms)
  ✔ 15. Order total is strictly calculated on server using database prices (71ms)
✔ ShopSphere Full-Stack E-commerce API Tests
ℹ tests 15 | suites 1 | pass 15 | fail 0
```

---

## GitHub Submission Instructions

To push this repository to GitHub for your CodeAlpha Internship submission:

1. Create a new repository on your GitHub account named **`CodeAlpha_EcommerceStore`** (leave "Initialize with README" unchecked).
2. Open PowerShell or Terminal in the project root:
   ```powershell
   # Add all files to staging
   git add .

   # Commit changes
   git commit -m "feat: complete ShopSphere full-stack e-commerce store for CodeAlpha Task 1"

   # Rename branch to main
   git branch -M main

   # Link your GitHub remote
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/CodeAlpha_EcommerceStore.git

   # Push to GitHub
   git push -u origin main
   ```

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository `CodeAlpha_EcommerceStore`.
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL + `/api/v1` (e.g. `https://shopsphere-api.onrender.com/api/v1`)
6. Deploy! The included `client/vercel.json` ensures SPA routes like `/products/:id` refresh smoothly without 404 errors.

### Backend Deployment (Render / Railway / VPS)
1. In [Render](https://render.com), create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: A long random secret key
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://shopsphere.vercel.app`)
   - `DATABASE_PATH`: `/var/data/shop.db` (if using a persistent disk)

> ⚠️ **Important SQLite Hosting Note:** Standard free-tier serverless instances (like basic Render or Heroku) use ephemeral filesystems, meaning SQLite databases reset on server restart. For persistent production deployments, attach a **Persistent Disk** on Render/Railway or host on a lightweight VPS (DigitalOcean, AWS EC2, or Linode).

---

## License & Credits

Developed with ❤️ by **CodeAlpha Full Stack Development Intern**.  
Icons provided by [Lucide React](https://lucide.dev/). Images sourced via Unsplash royalty-free collections.
