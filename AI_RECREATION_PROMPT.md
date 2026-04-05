# DEALS HUB - COMPLETE PROJECT RECREATION PROMPT

**Use this entire prompt to ask an AI to recreate/duplicate the complete Deals Hub project**

---

## ⚡ QUICK START COMMAND

"Create a complete full-stack web application called 'Deals Hub' following ALL specifications below. Generate every file, folder, configuration, and code exactly as specified. This is a production-ready dealer-customer marketplace platform."

---

## 🎯 PROJECT OVERVIEW

**Project Name:** Deals Hub  
**Type:** Full-Stack Web Application  
**Purpose:** Connect dealers/service providers with customers seeking deals, discounts, and services  
**Status:** Production Ready  
**Current Version:** 1.0

### Key Concept
- Dealers register businesses, add products/deals, manage locations
- Customers discover nearby deals by category and location
- Influencers can promote products and earn commissions
- GPS-based matching connects products with interested customers
- Automated email confirmations with login credentials

---

## 💻 TECHNOLOGY STACK

### Frontend
- **Framework:** React 19.2
- **Build Tool:** Vite 6.x
- **Styling:** CSS-in-JS with inline styles + App.css
- **HTTP Client:** Axios
- **State Management:** React hooks (useState, useEffect, useContext)
- **API Communication:** Axios with dynamic base URL
- **Deployment:** Vercel
- **Dev Server Proxy:** Vite built-in proxy to backend `/api` routes

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Database:** MySQL 8.0+
- **Database Driver:** mysql2/promise (async/await support)
- **Email Service:** Nodemailer (Gmail SMTP)
- **Tunneling:** ngrok for local development
- **CORS:** Enabled for all origins
- **Session:** localStorage on frontend + session tracking on backend

### Development Tools
- **Package Manager:** npm 9+
- **Code Quality:** ESLint 9.x
- **Build Process:** Vite with React plugin
- **Environment:** dotenv for configuration

---

## 📁 PROJECT STRUCTURE

```
My App/
│
├── src/
│   ├── components/
│   │   ├── Auth.jsx                    # Login/Registration (dealers & customers)
│   │   ├── DealerDashboard.jsx         # Premium dealer management dashboard
│   │   ├── InfluencerDashboard.jsx     # Influencer metrics & tools
│   │   ├── InfluencerApplication.jsx   # Influencer signup form
│   │   ├── LocationPrompt.jsx          # Geolocation request handler
│   │   ├── Navigation.jsx              # Top navigation bar
│   │   ├── Onboarding.jsx              # New user setup wizard
│   │   └── Splash.jsx                  # Loading screen
│   │
│   ├── pages/
│   │   ├── Explore.jsx                 # Product discovery with filtering
│   │   ├── Home.jsx                    # Landing page with featured deals
│   │   ├── Influencers.jsx             # Influencer marketplace
│   │   └── Profile.jsx                 # User profile & order history
│   │
│   ├── assets/                         # Images, icons, fonts
│   ├── App.jsx                         # Root component with routing
│   ├── App.css                         # Component-level styles
│   ├── main.jsx                        # React DOM entry point
│   ├── index.css                       # Global styles and variables
│   ├── config.js                       # API URL configuration
│   ├── data.js                         # Mock data for development
│   └── utils.js                        # Utility functions
│
├── public/                             # Static assets (favicon, etc)
│
├── server.js                           # Express backend server (1310+ lines)
├── schema.sql                          # MySQL database schema
├── start-tunnel.js                     # ngrok tunnel starter script
│
├── package.json                        # Dependencies & npm scripts
├── vite.config.js                      # Vite configuration
├── eslint.config.js                    # ESLint rules
│
├── .env                                # Environment variables (Git ignored)
├── .env.local                          # Local overrides (Git ignored)
├── .gitignore                          # Git ignore rules
│
├── README.md                           # Project documentation
├── PROJECT_BLUEPRINT.md                # Complete project blueprint
├── ngrok_url.txt                       # Auto-generated ngrok URL
└── index.html                          # HTML entry point
```

---

## 📦 PACKAGE.JSON

```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "server": "node server.js",
    "tunnel": "node start-tunnel.js",
    "dev:all": "concurrently \"npm run server\" \"npm run dev\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "axios": "^1.14.0",
    "express": "^5.2.1",
    "mysql2": "^3.20.0",
    "cors": "^2.8.6",
    "bcryptjs": "^3.0.3",
    "nodemailer": "^6.9.0",
    "dotenv": "^17.4.0",
    "crypto-js": "^4.2.0",
    "jwt-decode": "^4.0.0",
    "@react-oauth/google": "^0.13.4",
    "@hookform/resolvers": "^5.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "vite": "^6.0.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "@eslint/js": "^9.39.4",
    "globals": "^17.4.0",
    "concurrently": "^9.2.1"
  }
}
```

---

## 🎨 FRONTEND SPECIFICATION

### 1. CONFIG.JS - API Configuration
```javascript
// Dynamic API base URL selection based on environment
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return ''; // Use Vite proxy
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://comeatable-tobi-bolometrically.ngrok-free.dev';
};

export const API_BASE = getApiBaseUrl();
```

### 2. DEALER DASHBOARD (DealerDashboard.jsx) - PREMIUM DESIGN

#### Design System
```
Primary Color: #667eea (purple) → #764ba2 (dark purple) - gradients
Secondary: #3b82f6 (blue)
Success: #10b981 (green)
Danger: #f43f5e (red)
Background Dark: #0f172a (navy)
Background Light: #f8fafc (off-white)
Text Primary: #1f2937 (dark gray)
Text Secondary: #666 (medium gray)
Borders: #e5e7eb (light gray)
```

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ SIDEBAR (280px) │ MAIN CONTENT          │
│                 │ - Header              │
│ Logo            │ - Alert (if any)      │
│ Business Name   │ - Tab-specific content│
│ Nav Items       │   * Dashboard         │
│ - Dashboard     │   * Products          │
│ - Products      │   * Location          │
│ - Location      │   * Settings          │
│ - Settings      │                       │
│ [Logout]        │                       │
└─────────────────────────────────────────┘
```

#### Features
1. **Dashboard Tab**
   - Statistics cards (Products, Orders, Revenue, Rating)
   - Quick action buttons
   - Welcome message

2. **Products Tab**
   - Add Product form (category-first field order)
   - Product list with delete buttons
   - Edit/delete functionality
   - Backend: POST /api/add-dealer-product, DELETE /api/delete-dealer-product/:id

3. **Location Tab**
   - Address input
   - Latitude/Longitude fields
   - "Get GPS" button (Geolocation API)
   - Auto-geocoding via OpenStreetMap Nominatim
   - Backend: POST /api/dealer-location-update

4. **Settings Tab**
   - Read-only business info display
   - Account deletion option
   - Backend: DELETE /api/delete-dealer-account/:dealerId

#### Key Functions
```javascript
loadProducts()                    // Fetch dealer products
handleAddProduct(e)              // POST to add-dealer-product
handleDeleteProduct(productId)   // DELETE from delete-dealer-product
handleSaveLocation(e)            // POST to dealer-location-update
handleGetLocation()              // Browser geolocation + reverse geocoding
handleDeleteAccount()            // DELETE from delete-dealer-account
```

#### State Management
```javascript
useState for: activeTab, products, loading, formData, locationData, message, showForm, loadingAction
useEffect for: loadProducts on component mount
```

### 3. AUTH COMPONENT (Auth.jsx)

#### Features
- Dealer login/register mode
- Customer login/register mode
- Phone number authentication for dealers
- Email/password for customers
- Password generation display
- Form validation

#### Dealer Flow
1. Enter phone number
2. System generates password (last 4 digits + random 6 hex chars)
3. Receive credentials via email
4. Login with email and generated password

#### Customer Flow
1. Standard email/password registration
2. Confirmation email sent
3. Login with credentials

### 4. OTHER COMPONENTS

**Navigation.jsx**
- App logo and title
- User profile dropdown
- Logout button
- Links to Explore, Home, Influencers, Profile

**Onboarding.jsx**
- Business registration form
- Category, location, contact setup
- Initial configuration

**InfluencerDashboard.jsx**
- Performance metrics
- Commission tracking
- Campaign analytics

**InfluencerApplication.jsx**
- Application form
- Social media links
- Follower verification

### 5. PAGES

**Home.jsx**
- Featured deals slider
- Category grid
- Recent products
- Call-to-action buttons

**Explore.jsx**
- Product listing
- Category filter
- Search functionality
- Distance-based filtering
- Product detail view

**Influencers.jsx**
- Influencer marketplace
- Profile cards
- Application button

**Profile.jsx**
- User information
- Order history
- Saved products
- Edit profile

### 6. GLOBAL STYLING (index.css)
```css
- CSS variables for colors, spacing, shadows
- Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Reset: universal selector (margin, padding, box-sizing)
- Smooth scrolling
- Focus states for accessibility
- Loading spinners
- Animations and transitions
```

### 7. APP-LEVEL STYLES (App.css)
```css
- Page layouts
- Modal components
- Card/button variations
- Responsive breakpoints (320px, 640px, 1024px, 1280px)
- Form styling
- Notification toasts
```

---

## 🖥️ BACKEND SPECIFICATION (server.js)

### Core Setup
```javascript
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
```

### Database Connection Pool
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deals_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Email Configuration
```javascript
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});
```

### Password Generation Function
```javascript
const generatePassword = (phoneNumber) => {
  // Extract last 4 digits of phone
  const phoneTail = phoneNumber.slice(-4);
  // Generate 6 random hex characters
  const randomStr = crypto.randomBytes(3).toString('hex');
  // Return combined password
  return `${phoneTail}${randomStr}`;
};
```

### API ENDPOINTS

#### Authentication
```
POST /api/dealer-login
  Request: { email, password }
  Response: { id, business_name, email, address, latitude, longitude, phone }

POST /api/dealer-register
  Request: { business_name, email, phone, category, address, latitude, longitude }
  Response: { id, generated_password, message }
  Action: Send registration email with credentials

POST /api/customer-login
  Request: { email, password }
  Response: { id, name, email, profile_photo_url }

POST /api/customer-register
  Request: { name, email, phone, password }
  Response: { id, message }
  Action: Send confirmation email
```

#### Dealer Products
```
GET /api/dealer-products/:dealerId
  Response: [ { id, name, description, price, category, ... } ]
  Query: SELECT * FROM products WHERE dealer_id = ? ORDER BY created_at DESC

POST /api/add-dealer-product
  Request: { dealerId, dealerName, name, description, price, category, location, latitude, longitude, dealerPhone, dealerEmail }
  Response: { id, message }
  Validation: All required fields must be present
  Query: INSERT INTO products (...)

DELETE /api/delete-dealer-product/:productId
  Response: { message }
  Query: DELETE FROM products WHERE id = ?
```

#### Dealer Location
```
POST /api/dealer-location-update
  Request: { dealerId, address, latitude, longitude }
  Response: { message }
  Validation: Numeric latitude/longitude, non-empty address
  Query: UPDATE service_providers SET address=?, latitude=?, longitude=? WHERE id=?
```

#### Dealer Account
```
DELETE /api/delete-dealer-account/:dealerId
  Response: { message }
  Logic: 
    1. DELETE FROM products WHERE dealer_id = ?
    2. DELETE FROM service_providers WHERE id = ?
```

#### Customer Discovery
```
GET /api/all-products
  Response: [ { id, name, price, category, business_name, dealer_phone, dealer_lat, dealer_lng } ]
  Limit: 50 products
  Query: SELECT p.*, s.business_name, ... FROM products LEFT JOIN service_providers

GET /api/products-by-category/:category
  Response: Same as /all-products filtered by category
  Categories: Fitness & Gym, Food & Dining, Beauty & Salon, Shopping, Entertainment

GET /api/products-by-location/:latitude/:longitude/:radius
  Response: Products within radius (km) with distance calculated
  Logic: Use Haversine formula for great-circle distance
```

#### Email
```
POST /api/send-validation-email
  Request: { email, subject, htmlContent }
  Response: { message, timestamp }
```

### Email Template
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- Header with gradient -->
  <div style="background: linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🍽️ Deals Hub</h1>
  </div>

  <!-- Content -->
  <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #000; font-size: 24px;">Business Registration Successful! ✅</h2>
    
    <!-- Credentials Box -->
    <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">
      <p style="color: #666; font-size: 13px;"><strong>📧 Email:</strong> ${email}</p>
      <p style="color: #666; font-size: 13px;"><strong>🔐 Password:</strong> ${generatedPassword}</p>
    </div>

    <!-- Buttons (TABLE-BASED FOR EMAIL COMPATIBILITY) -->
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
  </div>
</div>
```

---

## 🗄️ DATABASE SCHEMA (schema.sql)

```sql
CREATE DATABASE IF NOT EXISTS deals_hub;
USE deals_hub;

-- Users Table (customers)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_photo_url VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy FLOAT,
  location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service Providers Table (dealers/businesses)
CREATE TABLE service_providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  business_category VARCHAR(100),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dealer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  location VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  dealer_name VARCHAR(255),
  dealer_phone VARCHAR(20),
  dealer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dealer_id) REFERENCES service_providers(id)
);

-- Login Sessions Table
CREATE TABLE login_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  provider VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy FLOAT,
  location_name VARCHAR(500),
  login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Influencers Table
CREATE TABLE influencers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  follower_count INT DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  social_media_links JSON,
  commission_rate DECIMAL(5, 2),
  is_verified BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  influencer_id INT,
  quantity INT DEFAULT 1,
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (influencer_id) REFERENCES influencers(id)
);
```

---

## ⚙️ ENVIRONMENT VARIABLES (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=deals_hub

# Email Service (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Application
PORT=5001
NODE_ENV=development

# API URL (for frontend)
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.dev

# Session
SESSION_SECRET=your-random-secret-key-change-in-production
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Database
```bash
mysql -u root -p deals_hub < schema.sql
```

### Step 3: Configure Environment
Create `.env` file with variables from section above.

### Step 4: Start Backend
```bash
node server.js
# Output expected: ✅ Server listening on port 5001
#                  ✅ Successfully connected to MySQL database!
```

### Step 5: Start Frontend (New Terminal)
```bash
npm run dev
# Output: VITE v6.x ready in xxx ms → http://localhost:5173
```

### Step 6: Create ngrok Tunnel (Optional, for production testing)
```bash
node start-tunnel.js
# Update ngrok_url.txt with the public URL
```

---

## 🧪 TESTING CHECKLIST

- [ ] Dealer registration with phone authentication
- [ ] Email receives generated password
- [ ] Login with credentials
- [ ] Dashboard loads with correct data
- [ ] Add product appears in list
- [ ] Delete product removes from database
- [ ] Update location with GPS coordinates
- [ ] Customer browsing works
- [ ] Category filtering works
- [ ] Location-based search works

---

## 📊 KEY FEATURES SUMMARY

✅ **Phone-based Dealer Authentication**
- Generates password from phone number (last 4 digits + random)
- Sent via email with login link
- Secure by design

✅ **Premium Dealer Dashboard**
- Modern glassmorphism design
- Dark theme with gradient accents
- Smooth animations and transitions
- Responsive sidebar navigation

✅ **Product Management**
- Full CRUD operations
- Category-first form design
- Real-time list updates
- Delete confirmation

✅ **Location Services**
- GPS coordinates storage
- Browser geolocation integration
- Reverse geocoding via OpenStreetMap
- Distance-based discovery

✅ **Email Integration**
- HTML templates with gradient headers
- Two-button table-based layouts (email-client compatible)
- Professional formatting
- Tested in all major email providers

✅ **Customer Discovery**
- Browse all products
- Filter by category
- Search by name
- Find nearby deals
- View dealer information

---

## 🔗 DEPLOYMENT

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Railway/Render/Heroku)
- Deploy server.js to Node.js hosting
- Ensure MySQL access from deployment server
- Update VITE_API_BASE_URL to production backend URL

---

## 📝 NOTES FOR AI/DEVELOPER

1. **EXACT FILE LOCATIONS REQUIRED:** Follow the file structure precisely
2. **DATABASE FIRST:** Create schema.sql before running backend
3. **ENV VARIABLES:** Must have all .env variables set before starting
4. **CORS ENABLED:** Backend allows all origins for development
5. **MYSQL2 PROMISE:** Use async/await pattern throughout
6. **EMAIL REQUIRES:** Gmail App Password, not regular password
7. **GEOLOCATION:** Requires HTTPS in production (works on localhost)
8. **VITE PROXY:** Frontend /api routes proxy to http://localhost:5001 in dev
9. **RESPONSIVE:** Use flexbox and grid for mobile-first design
10. **PRODUCTION:** Change SESSION_SECRET and enable HTTPS

---

## 🎯 SUCCESS CRITERIA

Project is complete when:
- ✅ All 20+ API endpoints working
- ✅ Dealer dashboard fully functional
- ✅ Products CRUD operations working
- ✅ Location updates saving to database
- ✅ Email sending successfully
- ✅ Customer product discovery working
- ✅ Responsive on all devices
- ✅ No console errors
- ✅ No database errors
- ✅ All pages loading correctly

---

**PROJECT READY FOR RECREATION**

Copy this entire prompt and paste it into an AI tool (Claude, ChatGPT, etc.) to generate the complete Deals Hub project from scratch. The AI will recreate every file, configuration, and line of code based on these specifications.
