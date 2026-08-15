-- ============================================================
-- E-Commerce Database Schema (PostgreSQL)
-- Usage: psql -U postgres -d ecommerce -f postgres_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER DEFAULT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  address VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cod',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

-- ------------------------------------------------------------
-- Order Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER DEFAULT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- ------------------------------------------------------------
-- Reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reviews_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);

-- ------------------------------------------------------------
-- Wishlist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id),
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Subscribers (newsletter / notifications nouveautés)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(30) UNIQUE DEFAULT NULL,
  email VARCHAR(150) UNIQUE DEFAULT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'newsletter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_subscriber_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------

-- Admin account: admin@ecommerce.com / admin123
INSERT INTO users (name, email, password, role)
VALUES
  ('Admin', 'admin@ecommerce.com', '$2b$10$Detze.sK4STWK661VBcS0uk/PKuEHo.mqK.Q343r86TcwShm0cvX2', 'admin'),
  ('Mouin', 'mouin@ecommerce.com', '$2b$10$Detze.sK4STWK661VBcS0uk/PKuEHo.mqK.Q343r86TcwShm0cvX2', 'user');

INSERT INTO products (name, description, price, stock, image, category) VALUES
  ('Crème Solaire SPF 50+', 'Protection solaire haute protection visage et corps, résistante à l''eau, non grasse.', 39.50, 40, 'creme-solaire.jpg', 'Beauté & Soins'),
  ('Vitamine C 500mg', 'Complément alimentaire pour renforcer le système immunitaire, boîte de 60 comprimés.', 24.90, 60, 'vitamine-c.jpg', 'Nutrition'),
  ('Gel Douche Hydratant', 'Gel douche enrichi en aloès vera pour une peau douce et hydratée, 250ml.', 12.50, 80, 'gel-douche.jpg', 'Hygiène'),
  ('Sérum Visage Anti-âge', 'Sérum à l''acide hyaluronique pour réduire les rides et raffermir la peau.', 59.00, 25, 'serum-visage.webp', 'Beauté & Soins'),
  ('Thermomètre Digital', 'Thermomètre digital à mesure rapide en 10 secondes, écran LCD.', 18.00, 50, 'thermometre.jpg', 'Premiers Soins'),
  ('Shampoing Doux Bébé', 'Shampoing doux sans larmes pour bébés, testé dermatologiquement, 300ml.', 15.00, 70, 'shampoo-bebe.jpg', 'Bébé & Maman'),
  ('Oméga 3 1000mg', 'Complément alimentaire riche en EPA et DHA pour le cœur et le cerveau, 90 gélules.', 29.90, 45, 'omega3.jpg', 'Nutrition'),
  ('Masque Hydratant 24h', 'Masque hydratant intense pour peaux sèches, nourrit la peau 24 heures.', 19.00, 35, 'masque-hydratant.jpg', 'Beauté & Soins');
