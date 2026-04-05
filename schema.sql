-- ========================================
-- DEALS HUB APPLICATION DATABASE SCHEMA
-- ========================================

CREATE DATABASE IF NOT EXISTS deals_hub;
USE deals_hub;

-- 1. USERS TABLE (Core user profiles with location tracking)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  picture VARCHAR(500),
  provider ENUM('google', 'apple', 'email') DEFAULT 'email',
  phone VARCHAR(20),
  
  -- Location Data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy FLOAT,
  location_updated_at TIMESTAMP,
  last_location_name VARCHAR(500),
  
  -- Profile Info
  profile_completed BOOLEAN DEFAULT FALSE,
  bio TEXT,
  referral_code VARCHAR(20) UNIQUE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_location (latitude, longitude),
  INDEX idx_provider (provider),
  INDEX idx_created_at (created_at)
);

-- 2. LOGIN SESSIONS TABLE (Complete login tracking with location)
CREATE TABLE IF NOT EXISTS login_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  provider VARCHAR(50),
  
  -- Location at login
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy FLOAT,
  location_name VARCHAR(500),
  
  -- Device Information
  device_info JSON,
  user_agent TEXT,
  ip_address VARCHAR(45),
  platform VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Session Details
  session_duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_provider (provider)
);

-- 3. LOCATIONS TABLE (Stores, businesses, restaurants)
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(100),
  area VARCHAR(100),
  country VARCHAR(100),
  
  -- Store/Business Info
  business_type ENUM('restaurant', 'gym', 'salon', 'store', 'other') DEFAULT 'other',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Hours & Status
  opening_hours JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_coordinates (latitude, longitude),
  INDEX idx_city (city),
  INDEX idx_business_type (business_type)
);

-- 4. DEALS TABLE (All deals/offers)
CREATE TABLE IF NOT EXISTS deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  emoji VARCHAR(10),
  
  -- Pricing
  original_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  discount_percentage INT,
  
  -- Deal Details
  halal BOOLEAN DEFAULT FALSE,
  tags JSON,
  
  -- Media
  image_url VARCHAR(500),
  
  -- Stats
  rating FLOAT,
  reviews_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location_id (location_id),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_end_date (end_date)
);

-- 5. DEAL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS deal_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  emoji VARCHAR(10),
  icon_url VARCHAR(255),
  description TEXT,
  display_order INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_display_order (display_order)
);

-- 6. USER SAVED DEALS TABLE (Bookmarked deals)
CREATE TABLE IF NOT EXISTS user_saved_deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deal_id INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_deal (user_id, deal_id),
  INDEX idx_user_id (user_id),
  INDEX idx_saved_at (saved_at)
);

-- 7. INFLUENCERS TABLE
CREATE TABLE IF NOT EXISTS influencers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  
  -- Profile
  handle VARCHAR(100) UNIQUE,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  
  -- Stats
  followers_count INT DEFAULT 0,
  referrals_count INT DEFAULT 0,
  deal_shares_count INT DEFAULT 0,
  
  -- Referral Info
  referral_code VARCHAR(20) UNIQUE,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  
  -- Location
  primary_location_id INT,
  coverage_areas JSON,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (primary_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_handle (handle),
  INDEX idx_verified (verified)
);

-- 8. INFLUENCER STATS TABLE (Track influencer performance)
CREATE TABLE IF NOT EXISTS influencer_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  influencer_id INT NOT NULL,
  
  -- Daily/Monthly Stats
  stat_date DATE,
  new_referrals INT DEFAULT 0,
  deal_clicks INT DEFAULT 0,
  deal_conversions INT DEFAULT 0,
  earnings DECIMAL(10, 2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_influencer_date (influencer_id, stat_date),
  INDEX idx_influencer_id (influencer_id),
  INDEX idx_stat_date (stat_date)
);

-- 9. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id INT NOT NULL,
  referred_user_id INT,
  referral_code VARCHAR(20),
  
  -- Tracking
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  completed_at TIMESTAMP,
  
  -- Earnings
  commission_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES influencers(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 10. USER LOCATION HISTORY TABLE (Complete location tracking)
CREATE TABLE IF NOT EXISTS user_location_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name VARCHAR(500),
  location_accuracy FLOAT,
  
  -- Context
  event_type ENUM('login', 'manual_update', 'background_update', 'app_open') DEFAULT 'login',
  source ENUM('gps', 'ip', 'manual', 'default') DEFAULT 'gps',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_coordinates (latitude, longitude)
);

-- 11. NEARBY SERVICES TABLE (Auto-calculated distances)
CREATE TABLE IF NOT EXISTS nearby_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deal_id INT NOT NULL,
  location_id INT NOT NULL,
  
  -- Distance
  distance_km DECIMAL(8, 2),
  
  -- Relevance Score
  relevance_score DECIMAL(5, 2),
  
  -- Last Updated
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_deal (user_id, deal_id),
  INDEX idx_user_id (user_id),
  INDEX idx_distance_km (distance_km)
);

-- 12. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deal_id INT NOT NULL,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_deal_id (deal_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating)
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  
  title VARCHAR(255),
  message TEXT,
  notification_type ENUM('deal', 'referral', 'reward', 'system', 'offer') DEFAULT 'system',
  
  deal_id INT,
  related_data JSON,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- 14. SERVICE PROVIDERS TABLE (Shop/Business Owners)
CREATE TABLE IF NOT EXISTS service_providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  
  -- Business Details
  business_name VARCHAR(255) NOT NULL,
  business_type ENUM('restaurant', 'shop', 'gym', 'salon', 'other') DEFAULT 'other',
  description TEXT,
  
  -- Location & GPS
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(500),
  city VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(255),
  
  -- Auth Details
  provider_email VARCHAR(255) UNIQUE NOT NULL,
  provider_password_hash VARCHAR(255),
  
  -- Media
  business_logo VARCHAR(500),
  business_banner VARCHAR(500),
  
  -- Stats & Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating FLOAT DEFAULT 0,
  total_sales INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_business_type (business_type),
  INDEX idx_coordinates (latitude, longitude),
  INDEX idx_provider_email (provider_email)
);

-- 15. PRODUCTS TABLE (Items sold by dealers)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dealer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  emoji VARCHAR(10),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  dealer_name VARCHAR(255),
  dealer_phone VARCHAR(20),
  dealer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dealer_id (dealer_id),
  INDEX idx_category (category),
  INDEX idx_location (latitude, longitude),
  INDEX idx_created_at (created_at)
);

-- 16. ORDERS TABLE (Customer orders from service providers)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_provider_id INT NOT NULL,
  product_id INT,
  
  -- Order Details
  quantity INT,
  total_price DECIMAL(10, 2),
  
  -- Status
  status ENUM('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Delivery/Collection
  delivery_method ENUM('pickup', 'delivery') DEFAULT 'pickup',
  delivery_address VARCHAR(500),
  
  -- Tracking
  order_latitude DECIMAL(10, 8),
  order_longitude DECIMAL(11, 8),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_provider_id (service_provider_id),
  INDEX idx_status (status)
);

-- 17. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id)
);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update user location when login is recorded
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_user_location_on_login
AFTER INSERT ON login_sessions
FOR EACH ROW
BEGIN
  UPDATE users
  SET latitude = NEW.latitude,
      longitude = NEW.longitude,
      location_accuracy = NEW.location_accuracy,
      location_updated_at = NOW(),
      last_location_name = NEW.location_name
  WHERE id = NEW.user_id;
END$$
DELIMITER ;

-- Record location history on every login
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS record_location_history_on_login
AFTER INSERT ON login_sessions
FOR EACH ROW
BEGIN
  INSERT INTO user_location_history 
  (user_id, latitude, longitude, location_name, location_accuracy, event_type, source)
  VALUES 
  (NEW.user_id, NEW.latitude, NEW.longitude, NEW.location_name, NEW.location_accuracy, 'login', 'gps');
END$$
DELIMITER ;

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Products table for dealer services
INSERT IGNORE INTO deal_categories (name, emoji, display_order) VALUES
('Food & Dining', '🍛', 1),
('Fitness & Gym', '💪', 2),
('Beauty & Salon', '✂️', 3),
('Shopping', '🛍️', 4),
('Entertainment', '🎭', 5),
('Travel', '✈️', 6);

INSERT IGNORE INTO locations (name, address, latitude, longitude, city, area, business_type) VALUES
('Saffron Kitchen', 'Colombo 3', 6.9271, 79.8612, 'Colombo', 'Colombo 3', 'restaurant'),
('FitLife Gym', 'Nugegoda', 6.9250, 79.8620, 'Colombo', 'Nugegoda', 'gym'),
('Elite Salon', 'Bambalapitiya', 6.9326, 79.8497, 'Colombo', 'Bambalapitiya', 'salon');

INSERT IGNORE INTO deals (location_id, title, description, category, emoji, original_price, discounted_price, discount_percentage, halal, is_active) VALUES
(1, 'Biryani Feast - Large Pot', 'Authentic Sri Lankan biryani', 'Food & Dining', '🍛', 2800, 1499, 46, TRUE, TRUE),
(2, 'Personal Training - 10 Sessions', 'One-on-one training', 'Fitness & Gym', '💪', 15000, 8999, 40, TRUE, TRUE),
(3, 'Haircut + Blowdry', 'Premium haircut with styling', 'Beauty & Salon', '✂️', 3500, 1799, 49, TRUE, TRUE);
