-- ============================================================
-- E-Commerce Database Schema & Seed Data
-- Usage: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  address VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cod',
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Order Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reviews_product (product_id),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Wishlist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
