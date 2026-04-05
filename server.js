import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));

// Email Configuration - Using Gmail (user needs to set up in .env)
// For Gmail: Enable 2FA and use App Passwords (https://myaccount.google.com/apppasswords)
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration on startup
emailTransporter.verify((error, success) => {
  if (error) {
    console.log("⚠️  Email service not configured correctly:");
    console.error(error);
  } else {
    console.log("✅ Email service is ready!");
  }
});

// Utility function to generate password based on phone number
const generatePassword = (phoneNumber) => {
  // Use last 4 digits of phone + random 6 characters
  const phoneTail = phoneNumber.slice(-4);
  const randomStr = crypto.randomBytes(3).toString('hex');
  return `${phoneTail}${randomStr}`;
};

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection immediately on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL database!");
    
    // Initialize tables
    await initializeTables(connection);
    
    connection.release();
  } catch (err) {
    console.error("❌ MySQL Connection Failed!");
    console.error("Error Code:", err.code);
    console.error("Message:", err.sqlMessage || err.message);
  }
};

// Initialize/update database tables
const initializeTables = async (connection) => {
  try {
    // Check if users table has location columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='users' AND COLUMN_NAME IN ('latitude', 'longitude', 'location_accuracy')
    `);
    
    if (columns.length === 0) {
      console.log("📝 Adding location columns to users table...");
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN latitude DECIMAL(10, 8),
        ADD COLUMN longitude DECIMAL(11, 8),
        ADD COLUMN location_accuracy FLOAT,
        ADD COLUMN location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log("✅ Location columns added");
    }

    // Create login_sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS login_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        provider VARCHAR(50),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location_accuracy FLOAT,
        location_name VARCHAR(500),
        device_info JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log("✅ Login sessions table ready");
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error("⚠️  Table initialization note:", err.code);
    }
  }
};

testConnection();

app.get('/', (req, res) => {
  res.send('✅ Dealshub Backend is running! Endpoints: /api/save-user, /api/log-session');
});

// Endpoint to save or update user data with location
app.post('/api/save-user', async (req, res) => {
  const { 
    google_id, 
    name, 
    email, 
    picture, 
    provider, 
    last_location_name,
    latitude,
    longitude,
    location_accuracy
  } = req.body;

  try {
    const query = `
      INSERT INTO users (google_id, name, email, picture, provider, last_location_name, latitude, longitude, location_accuracy, location_updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      picture = VALUES(picture),
      last_location_name = VALUES(last_location_name),
      latitude = VALUES(latitude),
      longitude = VALUES(longitude),
      location_accuracy = VALUES(location_accuracy),
      location_updated_at = NOW(),
      last_login = CURRENT_TIMESTAMP
    `;
    
    const [result] = await pool.execute(query, [
      google_id || null, 
      name, 
      email, 
      picture, 
      provider, 
      last_location_name,
      latitude || null,
      longitude || null,
      location_accuracy || null
    ]);
    
    console.log(`✅ User saved/updated: ${email} @ ${latitude || 'default'}, ${longitude || 'default'}`);
    res.status(200).json({ 
      message: 'User saved successfully',
      userId: result.insertId || email
    });
  } catch (error) {
    console.error('❌ Error saving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to log login sessions with location
app.post('/api/log-session', async (req, res) => {
  const { 
    email,
    provider,
    latitude,
    longitude,
    location_accuracy,
    location_name,
    device_info
  } = req.body;

  try {
    // Get user ID from email
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    const userId = users.length > 0 ? users[0].id : null;
    
    // Insert login session
    const query = `
      INSERT INTO login_sessions 
      (user_id, email, provider, latitude, longitude, location_accuracy, location_name, device_info, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.execute(query, [
      userId,
      email,
      provider,
      latitude || null,
      longitude || null,
      location_accuracy || null,
      location_name || null,
      device_info ? JSON.stringify(device_info) : null,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ]);
    
    console.log(`📍 Login session logged: ${email} (${provider}) @ ${latitude}, ${longitude}`);
    res.status(200).json({ message: 'Session logged successfully' });
  } catch (error) {
    console.error('❌ Error logging session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's location history
app.get('/api/user-location-history/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const [sessions] = await pool.execute(`
      SELECT 
        latitude, 
        longitude, 
        location_name,
        location_accuracy,
        provider,
        created_at 
      FROM login_sessions 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [email]);
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('❌ Error fetching location history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby deals based on user location (within radius in km)
app.get('/api/nearby-deals/:email', async (req, res) => {
  const { email } = req.params;
  const { radius = 5 } = req.query; // Default 5 km radius
  
  try {
    const [user] = await pool.execute(
      'SELECT id, latitude, longitude FROM users WHERE email = ?',
      [email]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userLat = user[0].latitude;
    const userLng = user[0].longitude;
    
    if (!userLat || !userLng) {
      return res.status(400).json({ error: 'User location not available' });
    }
    
    // Get nearby deals using distance calculation
    const [deals] = await pool.execute(`
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category,
        d.emoji,
        d.original_price,
        d.discounted_price,
        d.discount_percentage,
        d.rating,
        d.reviews_count,
        l.name as location_name,
        l.latitude,
        l.longitude,
        l.city,
        (6371 * acos(cos(radians(?)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(?)) + sin(radians(?)) * sin(radians(l.latitude)))) AS distance_km
      FROM deals d
      JOIN locations l ON d.location_id = l.id
      WHERE d.is_active = TRUE
      AND (6371 * acos(cos(radians(?)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(?)) + sin(radians(?)) * sin(radians(l.latitude)))) <= ?
      ORDER BY distance_km ASC
      LIMIT 20
    `, [userLat, userLng, userLat, userLat, userLng, userLat, parseFloat(radius)]);
    
    res.status(200).json(deals);
  } catch (error) {
    console.error('❌ Error fetching nearby deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save deal to user's bookmarks
app.post('/api/save-deal', async (req, res) => {
  const { email, deal_id } = req.body;
  
  try {
    const [user] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await pool.execute(
      'INSERT IGNORE INTO user_saved_deals (user_id, deal_id) VALUES (?, ?)',
      [user[0].id, deal_id]
    );
    
    // Update saves_count on deals table
    await pool.execute(
      'UPDATE deals SET saves_count = saves_count + 1 WHERE id = ?',
      [deal_id]
    );
    
    res.status(200).json({ message: 'Deal saved successfully' });
  } catch (error) {
    console.error('❌ Error saving deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's saved deals
app.get('/api/user-saved-deals/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const [deals] = await pool.execute(`
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category,
        d.emoji,
        d.original_price,
        d.discounted_price,
        d.discount_percentage,
        d.rating,
        l.name as location_name,
        usa.saved_at
      FROM user_saved_deals usa
      JOIN users u ON usa.user_id = u.id
      JOIN deals d ON usa.deal_id = d.id
      JOIN locations l ON d.location_id = l.id
      WHERE u.email = ?
      ORDER BY usa.saved_at DESC
    `, [email]);
    
    res.status(200).json(deals);
  } catch (error) {
    console.error('❌ Error fetching saved deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add review for a deal
app.post('/api/add-review', async (req, res) => {
  const { email, deal_id, rating, review_text } = req.body;
  
  try {
    const [user] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [deal] = await pool.execute(
      'SELECT location_id FROM deals WHERE id = ?',
      [deal_id]
    );
    
    if (deal.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    await pool.execute(
      'INSERT INTO reviews (deal_id, user_id, location_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [deal_id, user[0].id, deal[0].location_id, rating, review_text]
    );
    
    // Update deals rating and reviews_count
    const [reviews] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE deal_id = ?',
      [deal_id]
    );
    
    await pool.execute(
      'UPDATE deals SET rating = ?, reviews_count = ? WHERE id = ?',
      [reviews[0].avg_rating, reviews[0].total_reviews, deal_id]
    );
    
    res.status(200).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all deals by category
app.get('/api/deals-by-category/:category', async (req, res) => {
  const { category } = req.params;
  
  try {
    const [deals] = await pool.execute(`
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category,
        d.emoji,
        d.original_price,
        d.discounted_price,
        d.discount_percentage,
        d.rating,
        d.reviews_count,
        l.name as location_name,
        l.city
      FROM deals d
      JOIN locations l ON d.location_id = l.id
      WHERE d.category = ? AND d.is_active = TRUE
      ORDER BY d.rating DESC, d.reviews_count DESC
      LIMIT 50
    `, [category]);
    
    res.status(200).json(deals);
  } catch (error) {
    console.error('❌ Error fetching deals by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all deal categories
app.get('/api/deal-categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT id, name, emoji, description, display_order
      FROM deal_categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `);
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========================================
// SERVICE PROVIDER ENDPOINTS
// ========================================

// Google Maps Address Lookup & Reverse Geocoding
app.post('/api/geocode-address', async (req, res) => {
  const { latitude, longitude, address } = req.body;
  
  try {
    if (latitude && longitude) {
      // Reverse geocoding (coordinates to address)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      
      res.status(200).json({
        address: data.address?.road || data.address?.shop || data.display_name,
        city: data.address?.city || data.address?.town,
        latitude,
        longitude
      });
    } else if (address) {
      // Forward geocoding (address to coordinates)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        res.status(200).json({
          address: data[0].display_name,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          city: data[0].address?.city || data[0].address?.town
        });
      } else {
        res.status(404).json({ error: 'Address not found' });
      }
    }
  } catch (error) {
    console.error('❌ Error geocoding:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Service Provider Registration (Business Owner)
app.post('/api/register-service-provider', async (req, res) => {
  const { 
    user_name,
    business_name, 
    business_type, 
    phone, 
    email, 
    latitude, 
    longitude, 
    address, 
    city,
    description 
  } = req.body;

  try {
    // Create temporary password
    const temp_password = Math.random().toString(36).slice(-8);
    const password_hash = crypto.createHash('sha256').update(temp_password).digest('hex');
    
    const [result] = await pool.execute(
      `INSERT INTO service_providers 
       (business_name, business_type, phone, provider_email, provider_password_hash, latitude, longitude, address, city, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [business_name, business_type, phone, email, password_hash, latitude, longitude, address, city, description]
    );
    
    // TODO: Send email with temp password to provider_email
    console.log(`📧 Provider registration email would be sent to ${email} with password: ${temp_password}`);
    
    res.status(201).json({ 
      message: 'Service provider registered successfully',
      provider_id: result.insertId,
      temp_password: temp_password,
      note: 'Check email for login credentials'
    });
  } catch (error) {
    console.error('❌ Error registering service provider:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Service Provider Login
app.post('/api/provider-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');
    
    const [provider] = await pool.execute(
      'SELECT id, business_name, business_type, latitude, longitude FROM service_providers WHERE provider_email = ? AND provider_password_hash = ?',
      [email, password_hash]
    );
    
    if (provider.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.status(200).json({
      provider_id: provider[0].id,
      business_name: provider[0].business_name,
      business_type: provider[0].business_type,
      location: {
        latitude: provider[0].latitude,
        longitude: provider[0].longitude
      }
    });
  } catch (error) {
    console.error('❌ Error logging in provider:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add Product (by service provider)
app.post('/api/add-product', async (req, res) => {
  const { 
    provider_id, 
    name, 
    description, 
    category, 
    emoji,
    price, 
    discount_percentage, 
    quantity_available,
    product_type,
    is_halal,
    image_url 
  } = req.body;

  try {
    const discounted_price = price * (1 - discount_percentage / 100);
    
    const [result] = await pool.execute(
      `INSERT INTO products 
       (service_provider_id, name, description, category, emoji, price, discount_percentage, discounted_price, quantity_available, product_type, is_halal, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [provider_id, name, description, category, emoji, price, discount_percentage, discounted_price, quantity_available, product_type, is_halal, image_url]
    );
    
    res.status(201).json({ 
      message: 'Product added successfully',
      product_id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get Products by Service Provider
app.get('/api/provider-products/:provider_id', async (req, res) => {
  const { provider_id } = req.params;

  try {
    const [products] = await pool.execute(
      `SELECT id, name, description, category, emoji, price, discounted_price, discount_percentage, 
              quantity_available, is_in_stock, rating, reviews_count, sold_count
       FROM products 
       WHERE service_provider_id = ? AND is_active = TRUE
       ORDER BY created_at DESC`,
      [provider_id]
    );
    
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Nearby Products by Location (like Uber, showing nearby shops)
app.get('/api/nearby-products/:email', async (req, res) => {
  const { email } = req.params;
  const { radius = 5 } = req.query;

  try {
    const [user] = await pool.execute(
      'SELECT latitude, longitude FROM users WHERE email = ?',
      [email]
    );
    
    if (user.length === 0 || !user[0].latitude) {
      return res.status(400).json({ error: 'User location not available' });
    }
    
    const userLat = user[0].latitude;
    const userLng = user[0].longitude;
    
    // Get nearby service providers with their products
    const [nearby] = await pool.execute(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.business_type,
        sp.latitude,
        sp.longitude,
        sp.address,
        sp.city,
        sp.rating,
        p.id as product_id,
        p.name as product_name,
        p.category,
        p.emoji,
        p.price,
        p.discounted_price,
        p.discount_percentage,
        p.image_url,
        p.rating as product_rating,
        p.reviews_count,
        (6371 * acos(cos(radians(?)) * cos(radians(sp.latitude)) * cos(radians(sp.longitude) - radians(?)) + sin(radians(?)) * sin(radians(sp.latitude)))) AS distance_km
      FROM service_providers sp
      JOIN products p ON sp.id = p.service_provider_id
      WHERE sp.is_active = TRUE AND p.is_active = TRUE AND p.is_in_stock = TRUE
      AND (6371 * acos(cos(radians(?)) * cos(radians(sp.latitude)) * cos(radians(sp.longitude) - radians(?)) + sin(radians(?)) * sin(radians(sp.latitude)))) <= ?
      ORDER BY distance_km ASC, p.rating DESC
      LIMIT 50
    `, [userLat, userLng, userLat, userLat, userLng, userLat, parseFloat(radius)]);
    
    res.status(200).json(nearby);
  } catch (error) {
    console.error('❌ Error fetching nearby products:', error);
    res.status(500).json({ error: 'Failed to fetch nearby products' });
  }
});

// Create Order
app.post('/api/create-order', async (req, res) => {
  const { 
    user_id, 
    provider_id, 
    product_id, 
    quantity, 
    delivery_method,
    delivery_address,
    user_latitude,
    user_longitude
  } = req.body;

  try {
    const [product] = await pool.execute(
      'SELECT price, discount_percentage FROM products WHERE id = ?',
      [product_id]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const total_price = product[0].price * quantity;
    
    const [result] = await pool.execute(
      `INSERT INTO orders 
       (user_id, service_provider_id, product_id, quantity, total_price, delivery_method, delivery_address, order_latitude, order_longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, provider_id, product_id, quantity, total_price, delivery_method, delivery_address, user_latitude, user_longitude]
    );
    
    res.status(201).json({ 
      message: 'Order created successfully',
      order_id: result.insertId,
      total_price: total_price
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get User Orders
app.get('/api/user-orders/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const [user] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [orders] = await pool.execute(`
      SELECT 
        o.id, o.status, o.total_price, o.delivery_method,
        sp.business_name, sp.latitude, sp.longitude, sp.address,
        p.name as product_name, p.emoji, o.quantity,
        o.created_at
      FROM orders o
      JOIN service_providers sp ON o.service_provider_id = sp.id
      JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [user[0].id]);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update Order Status (by service provider)
app.patch('/api/update-order-status/:order_id', async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  try {
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, order_id]
    );
    
    if (status === 'completed') {
      await pool.execute(
        'UPDATE orders SET completed_at = NOW() WHERE id = ?',
        [order_id]
      );
      
      // Update service provider stats
      const [order] = await pool.execute(
        'SELECT service_provider_id, total_price FROM orders WHERE id = ?',
        [order_id]
      );
      await pool.execute(
        'UPDATE service_providers SET total_sales = total_sales + 1 WHERE id = ?',
        [order[0].service_provider_id]
      );
    }
    
    res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Add Product Review (by customer)
app.post('/api/add-product-review', async (req, res) => {
  const { user_id, product_id, rating, review_text } = req.body;

  try {
    await pool.execute(
      'INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [product_id, user_id, rating, review_text]
    );
    
    // Update product rating
    const [reviews] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM product_reviews WHERE product_id = ?',
      [product_id]
    );
    
    await pool.execute(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [reviews[0].avg_rating, reviews[0].count, product_id]
    );
    
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Register Business/Dealer
app.post('/api/register-business', async (req, res) => {
  const { shopName, email, phone, location, latitude, longitude, city, description, photoBase64 } = req.body;

  try {
    // Check if email already registered as business
    const [existing] = await pool.execute(
      'SELECT id FROM service_providers WHERE provider_email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered as business' });
    }

    // Generate password based on phone number (last 4 digits + random)
    const generatedPassword = generatePassword(phone);

    // Store business details with coordinates
    const [result] = await pool.execute(
      'INSERT INTO service_providers (business_name, provider_email, provider_password_hash, phone, address, latitude, longitude, city, description, business_logo, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [shopName, email, generatedPassword, phone, location, latitude, longitude, city, description, 'logo_data', true]
    );

    // Send welcome email with credentials
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🍽️ Deals Hub</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Welcome to Your Business Dashboard</p>
        </div>

        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000; font-size: 24px; margin: 0 0 16px 0;">Business Registration Successful! ✅</h2>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Dear <strong>${shopName}</strong>,
          </p>

          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Your business has been successfully registered on Deals Hub! Here are your login credentials:
          </p>

          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <p style="color: #666; font-size: 13px; margin: 0 0 16px 0;"><strong>📧 Your Login Credentials:</strong></p>
            
            <div style="background: #f5f3ff; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
              <p style="color: #7c3aed; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Email/Username:</p>
              <p style="color: #000; font-size: 14px; font-family: monospace; margin: 0; word-break: break-all;"><strong>${email}</strong></p>
            </div>

            <div style="background: #f5f3ff; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
              <p style="color: #7c3aed; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Password (Generated from your phone):</p>
              <p style="color: #000; font-size: 14px; font-family: monospace; margin: 0;"><strong>${generatedPassword}</strong></p>
            </div>

            <div style="background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #fbbf24;">
              <p style="color: #78350f; font-size: 12px; margin: 0;">
                <strong>💡 Password Format:</strong> Generated using the last 4 digits of your phone number + secure random code
              </p>
            </div>
          </div>

          <p style="color: #666; font-size: 13px; background: #fef3c7; border-left: 4px solid #fbbf24; padding: 12px; border-radius: 4px; margin: 24px 0;">
            <strong>⚠️ Important:</strong> Save these credentials securely. You can change your password anytime in your dashboard settings. Log in immediately to update your password for security.
          </p>

          <h3 style="color: #000; font-size: 16px; margin: 24px 0 16px 0;">What You Can Do Now:</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>📦 Add and manage your products</li>
            <li>🏆 Create promotional deals</li>
            <li>📊 Track your sales and orders</li>
            <li>⭐ View customer reviews and ratings</li>
            <li>💰 Monitor your revenue and analytics</li>
            <li>🔔 Receive order notifications in real-time</li>
            <li>🔐 Change your password in settings</li>
          </ul>

          <table cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
            <tr>
              <td style="padding: 0 8px 0 0;">
                <a href="https://dealshub-one.vercel.app?mode=dealer" style="display: block; background: linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; width: 100%; box-sizing: border-box;">
                  ➡️ Login to Your Dashboard
                </a>
              </td>
              <td style="padding: 0 0 0 8px;">
                <a href="https://dealshub-one.vercel.app?mode=dealer" style="display: block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; width: 100%; box-sizing: border-box;">
                  🔙 Back to Dealer Dashboard
                </a>
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
            <strong>Need help?</strong> Contact our support team at <strong>support@dealshub.com</strong>
          </p>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 12px 0 0 0;">
            Best regards,<br/>
            <strong>Deals Hub Team 🍽️</strong>
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@dealshub.com',
      to: email,
      subject: '🎉 Welcome to Deals Hub - Your Business Account Created!',
      html: emailContent
    };

    // Send email asynchronously
    emailTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('⚠️  Email sending failed:', error.message);
        console.log('   → Email credentials not configured. Visit https://myaccount.google.com/apppasswords');
        console.log('   → User should check spam folder or contact support');
      } else {
        console.log('✅ Welcome email sent successfully to:', email);
      }
    });

    res.status(201).json({
      id: result.insertId,
      message: 'Business registered successfully! Check your email (including spam folder) for login credentials.',
      shopName: shopName,
      email: email,
      generatedPassword: generatedPassword
    });

  } catch (error) {
    console.error('❌ Error registering business:', error);
    res.status(500).json({ error: 'Failed to register business: ' + error.message });
  }
});

// Dealer Login
app.post('/api/dealer-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find dealer by email
    const [dealers] = await pool.execute(
      'SELECT * FROM service_providers WHERE provider_email = ? AND is_active = true',
      [email]
    );

    if (dealers.length === 0) {
      return res.status(401).json({ error: 'Email not registered as dealer' });
    }

    const dealer = dealers[0];

    // Check password
    if (dealer.provider_password_hash !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Successful login
    res.status(200).json({
      id: dealer.id,
      business_name: dealer.business_name,
      email: dealer.provider_email,
      phone: dealer.phone,
      address: dealer.address,
      latitude: dealer.latitude,
      longitude: dealer.longitude,
      city: dealer.city,
      description: dealer.description,
      rating: dealer.rating,
      total_sales: dealer.total_sales,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('❌ Error during dealer login:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// ====== DEALER PRODUCT ENDPOINTS ======

// Get dealer's products
app.get('/api/dealer-products/:dealerId', async (req, res) => {
  try {
    const { dealerId } = req.params;
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE dealer_id = ? ORDER BY created_at DESC',
      [dealerId]
    );
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching dealer products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add product for dealer
app.post('/api/add-dealer-product', async (req, res) => {
  try {
    const { dealerId, dealerName, name, description, price, category, location, latitude, longitude, dealerPhone, dealerEmail } = req.body;

    if (!dealerId || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (dealer_id, name, description, price, category, location, latitude, longitude, dealer_name, dealer_phone, dealer_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [dealerId, name, description, price, category, location, latitude, longitude, dealerName, dealerPhone, dealerEmail]
    );

    res.status(201).json({ 
      id: result.insertId,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Delete product
app.delete('/api/delete-dealer-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    await pool.execute('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Update dealer location
app.post('/api/dealer-location-update', async (req, res) => {
  try {
    const { dealerId, address, latitude, longitude } = req.body;

    if (!dealerId || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.execute(
      'UPDATE service_providers SET address = ?, latitude = ?, longitude = ? WHERE id = ?',
      [address, latitude, longitude, dealerId]
    );

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete dealer account
app.delete('/api/delete-dealer-account/:dealerId', async (req, res) => {
  try {
    const { dealerId } = req.params;

    // Delete all products first
    await pool.execute('DELETE FROM products WHERE dealer_id = ?', [dealerId]);

    // Delete dealer account
    await pool.execute('DELETE FROM service_providers WHERE id = ?', [dealerId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ====== CUSTOMER PRODUCT DISCOVERY ======

// Get all dealer products (for home page)
app.get('/api/all-products', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, s.business_name, s.phone as dealer_phone, s.email as dealer_email, 
              s.latitude as dealer_lat, s.longitude as dealer_lng, s.address as dealer_address
       FROM products p
       LEFT JOIN service_providers s ON p.dealer_id = s.id
       ORDER BY p.created_at DESC LIMIT 50`
    );
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get products by category
app.get('/api/products-by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [products] = await pool.execute(
      `SELECT p.*, s.business_name, s.phone as dealer_phone, s.email as dealer_email,
              s.latitude as dealer_lat, s.longitude as dealer_lng, s.address as dealer_address
       FROM products p
       LEFT JOIN service_providers s ON p.dealer_id = s.id
       WHERE p.category = ?
       ORDER BY p.created_at DESC`,
      [category]
    );
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get nearby products (by user location)
app.post('/api/nearby-dealer-products', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    // Haversine formula to find nearby products
    const [products] = await pool.execute(
      `SELECT p.*, s.business_name, s.phone as dealer_phone, s.email as dealer_email,
              s.latitude as dealer_lat, s.longitude as dealer_lng, s.address as dealer_address,
              (6371 * acos(cos(radians(?)) * cos(radians(s.latitude)) * cos(radians(?) - radians(s.longitude)) + sin(radians(?)) * sin(radians(s.latitude)))) AS distance
       FROM products p
       LEFT JOIN service_providers s ON p.dealer_id = s.id
       WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL
       HAVING distance <= ?
       ORDER BY distance ASC`,
      [latitude, longitude, latitude, radiusKm]
    );
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching nearby products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product details with dealer info
app.get('/api/product-detail/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const [products] = await pool.execute(
      `SELECT p.*, s.business_name, s.phone as dealer_phone, s.email as dealer_email,
              s.latitude as dealer_lat, s.longitude as dealer_lng, s.address as dealer_address,
              s.description as dealer_description, s.rating
       FROM products p
       LEFT JOIN service_providers s ON p.dealer_id = s.id
       WHERE p.id = ?`,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Send inquiry to dealer
app.post('/api/send-product-inquiry', async (req, res) => {
  try {
    const { productId, customerEmail, customerPhone, message } = req.body;

    if (!productId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get product and dealer info
    const [products] = await pool.execute(
      `SELECT p.*, s.business_name, s.email as dealer_email, s.phone as dealer_phone
       FROM products p
       LEFT JOIN service_providers s ON p.dealer_id = s.id
       WHERE p.id = ?`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // Send email to dealer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: product.dealer_email,
      subject: `New Inquiry for ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">📧 New Customer Inquiry</h2>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Customer Phone:</strong> ${customerPhone}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-left: 4px solid #667eea;">${message || 'Customer is interested in your service'}</p>
            <p style="color: #999; font-size: 12px;">Reply directly to ${customerEmail}</p>
          </div>
        </div>
      `
    };

    emailTransporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Email error:', error);
      }
    });

    res.json({ message: 'Inquiry sent to dealer' });
  } catch (error) {
    console.error('Error sending inquiry:', error);
    res.status(500).json({ error: 'Failed to send inquiry' });
  }
});

// Update dealer settings
app.post('/api/update-dealer-settings', async (req, res) => {
  try {
    const { dealerId, businessName, email, phone, address } = req.body;

    if (businessName) {
      await pool.execute(
        'UPDATE service_providers SET business_name = ? WHERE id = ?',
        [businessName, dealerId]
      );
    }

    if (email) {
      await pool.execute(
        'UPDATE service_providers SET email = ? WHERE id = ?',
        [email, dealerId]
      );
    }

    if (phone) {
      await pool.execute(
        'UPDATE service_providers SET phone = ? WHERE id = ?',
        [phone, dealerId]
      );
    }

    if (address) {
      await pool.execute(
        'UPDATE service_providers SET address = ? WHERE id = ?',
        [address, dealerId]
      );
    }

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
