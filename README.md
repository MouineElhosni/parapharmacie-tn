# E-Commerce FullStack

A complete e-commerce application built with **React (Vite) + Node.js (Express) + MySQL**.

## Features

- **User accounts** – register, login, JWT-based authentication, protected routes
- **Product catalog** – browse, search, filter by category, product detail pages
- **Shopping cart** – add/remove items, quantity controls, persisted in localStorage
- **Checkout** – place orders (requires login), linked to the logged-in user
- **Admin dashboard** – manage products (create, edit, delete, upload images) and view orders
- **Modern UI** – Tailwind CSS, responsive, loading/empty/error states

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 18, Vite, React Router 6, Axios, Tailwind CSS |
| Backend  | Node.js, Express 5, MySQL2, JWT, bcryptjs, Multer |
| Database | MySQL 8                          |

## Project Structure

```
E-Commerce-FullStack/
├── backend/
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # Auth logic
│   ├── middleware/             # Auth, admin, upload
│   ├── models/                 # User data access
│   ├── routes/                 # Products, auth, users, orders
│   ├── uploads/                # Product images
│   ├── database.sql            # Schema + seed data
│   └── server.js               # Express app
└── frontend/
    ├── src/
    │   ├── components/         # Navbar, Footer, Cards, etc.
    │   ├── context/            # Auth & Cart state
    │   ├── pages/              # Home, Shop, Product, Cart, Checkout, Login, Register, Admin
    │   └── services/api.js     # Axios instance + image helper
    ├── index.html
    └── vite.config.js
```

## Prerequisites

- Node.js 18+
- MySQL 8 (XAMPP, WAMP, or standalone)

## Setup

### 1. Database

Start MySQL, then create the schema and seed data:

```bash
mysql -u root -p < backend/database.sql
```

This creates the `ecommerce` database with `users`, `products`, `orders`, and
`order_items` tables and inserts sample data.

> Default accounts (password `admin123` for both):
> - Admin: `admin@ecommerce.com`
> - User:  `mouin@ecommerce.com`

### 2. Backend

```bash
cd backend
npm install
```

Configure `.env` (copy from the values below):

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce
JWT_SECRET=ChangeMeToASecureSecret
```

Start the API:

```bash
npm run dev     # with auto-reload
# or
npm start
```

The API runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` (already configured for local development).

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API Overview

| Method | Endpoint                  | Auth    | Description                     |
| ------ | ------------------------- | ------- | ------------------------------- |
| GET    | `/api/products`           | Public  | List products (search/category) |
| GET    | `/api/products/categories`| Public  | List categories                 |
| GET    | `/api/products/:id`       | Public  | Get single product              |
| POST   | `/api/products`           | Admin   | Create product                  |
| POST   | `/api/products/upload`    | Admin   | Upload product image            |
| PUT    | `/api/products/:id`       | Admin   | Update product                  |
| DELETE | `/api/products/:id`       | Admin   | Delete product                  |
| POST   | `/api/auth/register`      | Public  | Register user                   |
| POST   | `/api/auth/login`         | Public  | Login, returns JWT              |
| GET    | `/api/users/profile`      | User    | Get profile                     |
| POST   | `/api/orders`             | Public* | Create order (linked if logged in) |
| GET    | `/api/orders/my`          | User    | Current user's orders           |
| GET    | `/api/orders`             | Admin   | All orders                      |
| GET    | `/api/orders/:id`         | Admin   | Order with its items            |
| PUT    | `/api/orders/:id/status`  | Admin   | Update order status             |
| GET    | `/api/users`              | Admin   | List all users                  |
| PUT    | `/api/users/:id/role`     | Admin   | Promote/demote a user           |
| GET    | `/api/admin/stats`        | Admin   | Dashboard stats (revenue, counts, low stock, recent orders) |

*Public = works without a token; a valid token links the order to the user.

## Admin Dashboard

Log in as `admin@ecommerce.com` and open **Admin** in the navbar. Four sections:

- **Dashboard** – revenue, product/order/customer counts, low-stock alerts, recent orders
- **Products** – add, edit, delete products and upload images
- **Orders** – view order items and change order status (pending → processing → shipped → delivered / cancelled)
- **Users** – view registered users and promote/demote admins
