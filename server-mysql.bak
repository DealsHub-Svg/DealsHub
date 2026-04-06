import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();

// CORS Configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://172.20.10.4:5173',
      'https://dealshub-one.vercel.app',
      'https://www.dealshub-one.vercel.app',
      'https://comeatable-tobi-bolometrically.ngrok-free.dev'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
};

app.use(cors(corsOptions));
app.use(express.json({limit: '10mb'}));

// Initialize Firebase Admin
let serviceAccount;
try {
  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || 
    './dealshub-701a3-firebase-adminsdk-fbsvc-5adc4d9d93.json';
  
  if (fs.existsSync(credentialsPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // For Vercel: credentials from environment variables
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
    };
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('✅ Firebase initialized successfully!');
  }
} catch (error) {
  console.error('⚠️  Firebase initialization error:', error.message);
}

const db = admin.firestore();

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

emailTransporter.verify((error, success) => {
  if (error) {
    console.log("⚠️  Email service not configured correctly:");
    console.error(error);
  } else {
    console.log("✅ Email service is ready!");
  }
});

// Distance calculation helper
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/', (req, res) => {
  res.send('✅ Dealshub Backend is running! Using Firebase Firestore.');
});

// Save user
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
    await db.collection('users').doc(email).set({
      google_id: google_id || null,
      name,
      email,
      picture,
      provider,
      last_location_name,
      latitude,
      longitude,
      location_accuracy: location_accuracy || null,
      location_updated_at: new Date(),
      last_login: new Date()
    }, { merge: true });

    console.log(`✅ User saved: ${email}`);
    res.status(200).json({ 
      message: 'User saved successfully',
      userId: email
    });
  } catch (error) {
    console.error('❌ Error saving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log session
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
    await db.collection('login_sessions').add({
      email,
      provider,
      latitude: latitude || null,
      longitude: longitude || null,
      location_accuracy: location_accuracy || null,
      location_name: location_name || null,
      device_info: device_info || {},
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      created_at: new Date()
    });

    console.log(`📍 Login session logged: ${email}`);
    res.status(200).json({ message: 'Session logged successfully' });
  } catch (error) {
    console.error('❌ Error logging session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user location history
app.get('/api/user-location-history/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const snapshot = await db.collection('login_sessions')
      .where('email', '==', email)
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();

    const sessions = [];
    snapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error('❌ Error fetching location history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby deals
app.get('/api/nearby-deals/:email', async (req, res) => {
  const { email } = req.params;
  const { radius = 5 } = req.query;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();
    if (!user.latitude || !user.longitude) {
      return res.status(400).json({ error: 'User location not available' });
    }

    const dealsSnapshot = await db.collection('deals')
      .where('is_active', '==', true)
      .limit(100)
      .get();

    const deals = [];
    dealsSnapshot.forEach(doc => {
      const deal = doc.data();
      const distance = calculateDistance(
        user.latitude,
        user.longitude,
        deal.latitude,
        deal.longitude
      );

      if (distance <= radius) {
        deals.push({
          id: doc.id,
          ...deal,
          distance
        });
      }
    });

    deals.sort((a, b) => a.distance - b.distance);
    res.status(200).json(deals.slice(0, 20));
  } catch (error) {
    console.error('❌ Error fetching nearby deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deals by category
app.get('/api/deals-by-category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const snapshot = await db.collection('deals')
      .where('category', '==', category)
      .where('is_active', '==', true)
      .orderBy('rating', 'desc')
      .limit(50)
      .get();

    const deals = [];
    snapshot.forEach(doc => {
      deals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(deals);
  } catch (error) {
    console.error('❌ Error fetching deals by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deal categories
app.get('/api/deal-categories', async (req, res) => {
  try {
    const snapshot = await db.collection('deal_categories')
      .where('is_active', '==', true)
      .orderBy('display_order', 'asc')
      .get();

    const categories = [];
    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save deal
app.post('/api/save-deal', async (req, res) => {
  const { email, deal_id } = req.body;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.collection('user_saved_deals').add({
      user_id: email,
      deal_id,
      saved_at: new Date()
    });

    res.status(200).json({ message: 'Deal saved successfully' });
  } catch (error) {
    console.error('❌ Error saving deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user saved deals
app.get('/api/user-saved-deals/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const snapshot = await db.collection('user_saved_deals')
      .where('user_id', '==', email)
      .orderBy('saved_at', 'desc')
      .get();

    const deals = [];
    for (const doc of snapshot.docs) {
      const saved = doc.data();
      const dealDoc = await db.collection('deals').doc(saved.deal_id).get();
      if (dealDoc.exists) {
        deals.push({
          id: dealDoc.id,
          ...dealDoc.data(),
          saved_at: saved.saved_at
        });
      }
    }

    res.status(200).json(deals);
  } catch (error) {
    console.error('❌ Error fetching saved deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add review
app.post('/api/add-review', async (req, res) => {
  const { email, deal_id, rating, review_text } = req.body;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dealDoc = await db.collection('deals').doc(deal_id).get();
    
    if (!dealDoc.exists) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await db.collection('reviews').add({
      deal_id,
      user_id: email,
      rating,
      review_text,
      created_at: new Date()
    });

    res.status(200).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register service provider
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
    const temp_password = Math.random().toString(36).slice(-8);
    const password_hash = crypto.createHash('sha256').update(temp_password).digest('hex');

    const docRef = await db.collection('service_providers').add({
      business_name,
      business_type,
      phone,
      provider_email: email,
      provider_password_hash: password_hash,
      latitude,
      longitude,
      address,
      city,
      description,
      created_at: new Date()
    });

    console.log(`📧 Provider registered: ${email}`);

    res.status(201).json({ 
      message: 'Service provider registered successfully',
      provider_id: docRef.id,
      temp_password,
      note: 'Check email for login credentials'
    });
  } catch (error) {
    console.error('❌ Error registering provider:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Provider login
app.post('/api/provider-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');
    
    const snapshot = await db.collection('service_providers')
      .where('provider_email', '==', email)
      .where('provider_password_hash', '==', password_hash)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const provider = snapshot.docs[0].data();
    
    res.status(200).json({
      provider_id: snapshot.docs[0].id,
      business_name: provider.business_name,
      business_type: provider.business_type,
      location: {
        latitude: provider.latitude,
        longitude: provider.longitude
      }
    });
  } catch (error) {
    console.error('❌ Error logging in provider:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add product
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
    
    const docRef = await db.collection('products').add({
      service_provider_id: provider_id,
      name,
      description,
      category,
      emoji,
      price,
      discount_percentage,
      discounted_price,
      quantity_available,
      product_type,
      is_halal,
      image_url,
      is_active: true,
      rating: 0,
      reviews_count: 0,
      created_at: new Date()
    });

    res.status(201).json({ 
      message: 'Product added successfully',
      product_id: docRef.id
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get products by provider
app.get('/api/provider-products/:provider_id', async (req, res) => {
  const { provider_id } = req.params;

  try {
    const snapshot = await db.collection('products')
      .where('service_provider_id', '==', provider_id)
      .where('is_active', '==', true)
      .orderBy('created_at', 'desc')
      .get();

    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get nearby products
app.get('/api/nearby-products/:email', async (req, res) => {
  const { email } = req.params;
  const { radius = 5 } = req.query;

  try {
    const userDoc = await db.collection('users').doc(email).get();
    
    if (!userDoc.exists || !userDoc.data().latitude) {
      return res.status(400).json({ error: 'User location not available' });
    }

    const userLat = userDoc.data().latitude;
    const userLng = userDoc.data().longitude;

    const providersSnapshot = await db.collection('service_providers')
      .where('is_active', '==', true)
      .limit(100)
      .get();

    const nearby = [];
    for (const providerDoc of providersSnapshot.docs) {
      const provider = providerDoc.data();
      const distance = calculateDistance(
        userLat,
        userLng,
        provider.latitude,
        provider.longitude
      );

      if (distance <= radius) {
        const productsSnapshot = await db.collection('products')
          .where('service_provider_id', '==', providerDoc.id)
          .where('is_active', '==', true)
          .limit(20)
          .get();

        productsSnapshot.forEach(productDoc => {
          const product = productDoc.data();
          nearby.push({
            provider_id: providerDoc.id,
            business_name: provider.business_name,
            business_type: provider.business_type,
            latitude: provider.latitude,
            longitude: provider.longitude,
            address: provider.address,
            city: provider.city,
            provider_rating: provider.rating || 0,
            product_id: productDoc.id,
            product_name: product.name,
            category: product.category,
            emoji: product.emoji,
            price: product.price,
            discounted_price: product.discounted_price,
            discount_percentage: product.discount_percentage,
            image_url: product.image_url,
            product_rating: product.rating || 0,
            reviews_count: product.reviews_count || 0,
            distance
          });
        });
      }
    }

    nearby.sort((a, b) => a.distance - b.distance);
    res.status(200).json(nearby.slice(0, 50));
  } catch (error) {
    console.error('❌ Error fetching nearby products:', error);
    res.status(500).json({ error: 'Failed to fetch nearby products' });
  }
});

// Create order
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
    const productDoc = await db.collection('products').doc(product_id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productDoc.data();
    const total_price = product.price * quantity;

    const orderRef = await db.collection('orders').add({
      user_id,
      service_provider_id: provider_id,
      product_id,
      quantity,
      total_price,
      delivery_method,
      delivery_address,
      order_latitude: user_latitude,
      order_longitude: user_longitude,
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json({ 
      message: 'Order created successfully',
      order_id: orderRef.id,
      total_price
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
app.get('/api/user-orders/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const snapshot = await db.collection('orders')
      .where('user_id', '==', email)
      .orderBy('created_at', 'desc')
      .get();

    const orders = [];
    for (const doc of snapshot.docs) {
      const order = doc.data();
      const provider = await db.collection('service_providers').doc(order.service_provider_id).get();
      const product = await db.collection('products').doc(order.product_id).get();

      orders.push({
        id: doc.id,
        ...order,
        business_name: provider.data()?.business_name,
        product_name: product.data()?.name,
        product_emoji: product.data()?.emoji
      });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.patch('/api/update-order-status/:order_id', async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  try {
    await db.collection('orders').doc(order_id).update({
      status,
      updated_at: new Date()
    });

    if (status === 'completed') {
      await db.collection('orders').doc(order_id).update({
        completed_at: new Date()
      });
    }

    res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Geocode address
app.post('/api/geocode-address', async (req, res) => {
  const { latitude, longitude, address } = req.body;

  try {
    if (latitude && longitude) {
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

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`✅ Firebase Firestore Backend Ready!`);
});
