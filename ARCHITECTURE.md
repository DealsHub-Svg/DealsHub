# 🎯 System Architecture & Data Flow Guide

## System Overview

Your Dealshub application is a full-stack marketplace platform deployed across multiple services.

```
┌────────────────────────────────────────────────────────────────────────┐
│                                INTERNET                                 │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────────┐  ┌──────────────┐  ┌─────────────────┐
        │  VERCEL EDGE      │  │ MOBILE APPS  │  │  DESKTOP/MOBILE │
        │  (CDN Cache)      │  │  (React      │  │  BROWSERS       │
        │                   │  │   Native)    │  │                 │
        └────────┬──────────┘  └──────┬───────┘  └────────┬────────┘
                 │                    │                    │
                 │ Static Assets      │ API Requests      │ API Requests
                 │ (JS, CSS, HTML)    │                   │
                 └────────────────────┼───────────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │   VERCEL PLATFORM           │
                       │   (https://dealshub-one...)   │
                       │                            │
                       │  ┌────────────────────┐   │
                       │  │ FRONTEND BUILD     │   │
                       │  │ (Vite + React)     │   │
                       │  │ dist/index.html    │   │
                       │  └────────┬───────────┘   │
                       │           │               │
                       │  ┌────────▼───────────┐   │
                       │  │ API ROUTES         │   │
                       │  │ /api/*             │   │
                       │  │ (Express.js        │   │
                       │  │  Serverless)       │   │
                       │  └────────┬───────────┘   │
                       │           │               │
                       └───────────┼───────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
        ┌──────────────────┐  ┌──────────┐  ┌────────────┐
        │ CLOUD DATABASE   │  │ GMAIL    │  │ GOOGLE     │
        │ (MySQL)          │  │ SMTP     │  │ GEOCODING  │
        │ PlanetScale/AWS  │  │ (Email)  │  │ API        │
        │                  │  │          │  │            │
        │ ┌──────────────┐ │  └──────────┘  └────────────┘
        │ │ users        │ │
        │ │ products     │ │
        │ │ orders       │ │
        │ │ locations    │ │
        │ │ reviews      │ │
        │ │ sessions     │ │
        │ └──────────────┘ │
        └──────────────────┘
```

---

## Component Breakdown

### 1. Client Layer
```
User's Device
├── Web Browser
│   ├── React Application
│   ├── Location Services API
│   └── Camera/Photos Access
│
├── Mobile App (Expo)
│   ├── React Native UI
│   ├── Native Location Access
│   └── Camera Integration
│
└── Device Storage
    ├── User Session
    ├── Preferences
    └── Location Cache
```

### 2. Frontend (Vite + React)
**Location:** Served by Vercel CDN
**URL:** https://dealshub-one.vercel.app

```
src/
├── App.jsx                 # Main app component
├── config.js               # API URL detection ⭐
├── components/
│   ├── Auth.jsx           # Login/Register
│   ├── DealDetail.jsx     # Deal pages
│   ├── InfluencerDashboard.jsx
│   ├── ServiceProviderDashboard.jsx
│   ├── NearbyProducts.jsx
│   └── ...
├── pages/
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── Influencers.jsx
│   └── Profile.jsx
└── utils/
    └── helpers.js
```

**Key Feature:** Automatic environment detection
```javascript
// src/config.js - Smart API URL selection
if (URL contains vercel.app) {
  return ''  // Use same-domain API
} else if (localhost) {
  return ''  // Use Vite proxy
} else {
  return 'https://ngrok-url'  // Use external URL
}
```

### 3. Backend API (Express.js)
**Location:** Vercel Serverless
**URL:** https://dealshub-one.vercel.app/api/*

```
server.js (Main Express Server)
├── CORS Configuration ⭐
│   └── Allows: dealshub-one.vercel.app, localhost:5173
│
├── User Endpoints
│   ├── POST /api/save-user
│   ├── POST /api/log-session
│   └── GET /api/user-location-history
│
├── Deal Endpoints
│   ├── GET /api/nearby-deals
│   ├── GET /api/deals-by-category
│   ├── GET /api/deal-categories
│   └── POST /api/save-deal
│
├── Product Endpoints
│   ├── POST /api/add-product
│   ├── GET /api/nearby-products
│   └── GET /api/provider-products
│
├── Order Endpoints
│   ├── POST /api/create-order
│   ├── GET /api/user-orders
│   └── PATCH /api/update-order-status
│
├── Authentication
│   ├── POST /api/provider-login
│   └── POST /api/register-service-provider
│
├── Utilities
│   ├── POST /api/geocode-address
│   └── GET /health (Health check)
│
└── Database Connection Pool
    └── mysql2 connection manager with retry logic
```

### 4. Database Layer
**Type:** MySQL (Relational Database)
**Hosted:** PlanetScale, AWS RDS, Azure MySQL, or similar

```
deals_hub (Database)
│
├── users table
│   ├── id (PK)
│   ├── name
│   ├── email (UK)
│   ├── picture
│   ├── provider
│   ├── latitude
│   ├── longitude
│   ├── location_accuracy
│   └── timestamps
│
├── service_providers table
│   ├── id (PK)
│   ├── business_name
│   ├── business_type
│   ├── phone
│   ├── provider_email
│   ├── latitude
│   ├── longitude
│   ├── address
│   ├── city
│   └── timestamps
│
├── products table
│   ├── id (PK)
│   ├── service_provider_id (FK)
│   ├── name
│   ├── price
│   ├── discounted_price
│   ├── category
│   ├── emoji
│   ├── quantity_available
│   ├── is_in_stock
│   ├── rating
│   ├── reviews_count
│   └── timestamps
│
├── orders table
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── product_id (FK)
│   ├── service_provider_id (FK)
│   ├── quantity
│   ├── total_price
│   ├── status
│   ├── delivery_method
│   ├── delivery_address
│   └── timestamps
│
├── login_sessions table
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── email
│   ├── provider
│   ├── latitude
│   ├── longitude
│   ├── location_name
│   ├── device_info (JSON)
│   └── created_at
│
├── deals table (for featured/curated deals)
├── locations table
├── reviews table
├── user_saved_deals table
└── deal_categories table
```

### 5. External Services

#### Gmail SMTP (Email)
```
Process: Order Confirmation Email
1. Frontend submits order
2. Backend creates order record
3. Backend sends email via nodemailer
4. Gmail SMTP relays email
5. User receives confirmation
```

#### Google Geocoding API
```
Process: Location Search
1. User searches for address
2. Frontend sends address
3. Backend queries Google API
4. Returns coordinates
5. Used for nearby matching
```

---

## Data Flow Examples

### Example 1: User Signs Up & Finds Deals

```
1. USER VISITS SITE
   ▼
   Browser: https://dealshub-one.vercel.app
   ▼
   Vite serves React app

2. USER LOGS IN (Google/Apple/Email)
   ▼
   Frontend: POST /api/save-user
   {name, email, picture, provider}
   ▼
   Backend: Express server receives request
   ▼
   Database: INSERT INTO users
   ▼
   Response: {userId, message}

3. BROWSER REQUESTS LOCATION
   ▼
   Frontend gets GPS coordinates
   {latitude, longitude}
   ▼
   Frontend: POST /api/log-session
   {email, provider, lat, lng, device_info}
   ▼
   Backend: Logs session, updates user location
   ▼
   Database: INSERT INTO login_sessions
   Database: UPDATE users set latitude, longitude

4. USER FINDS NEARBY DEALS
   ▼
   Frontend: GET /api/nearby-deals/user@email.com?radius=5
   ▼
   Backend: Calculates distance from user location
   ▼
   Database: SELECT ... WHERE distance <= 5km
   ▼
   Response: [deal1, deal2, deal3, ...]
   ▼
   Frontend: Displays deals on map
```

### Example 2: Business Creates Product

```
1. SERVICE PROVIDER REGISTERS
   ▼
   Frontend: POST /api/register-service-provider
   {business_name, phone, email, location}
   ▼
   Backend: Creates temppassword, sends email
   ▼
   Gmail SMTP: Sends login credentials

2. PROVIDER ADDS PRODUCT
   ▼
   Frontend: POST /api/add-product
   {provider_id, name, price, category, image}
   ▼
   Backend: Validates data
   ▼
   Database: INSERT INTO products
   ▼
   Response: {product_id}

3. PRODUCT APPEARS IN "NEARBY PRODUCTS"
   ▼
   Other users: GET /api/nearby-products/user@email
   ▼
   Backend: Queries products near user's location
   ▼
   Database: SELECT with distance calculation
   ▼
   Shows provider's products in results
```

### Example 3: Order Placement

```
1. USER PLACES ORDER
   ▼
   Frontend: POST /api/create-order
   {user_id, product_id, quantity, delivery_method}
   ▼
   Backend: Validates inventory
   ▼
   Database: INSERT INTO orders
   Database: UPDATE products (stock)
   ▼
   Backend: Sends confirmation email
   ▼
   Gmail SMTP: Email to user + provider

2. PROVIDER UPDATES ORDER STATUS
   ▼
   Backend: PATCH /api/update-order-status/123
   {status: 'shipped'}
   ▼
   Database: UPDATE orders SET status
   ▼
   Backend: Sends status update email

3. ORDER APPEARS IN USER HISTORY
   ▼
   Frontend: GET /api/user-orders/user@email
   ▼
   Backend: Queries user's orders
   ▼
   Database: SELECT from orders JOIN products
   ▼
   Shows order with delivery estimate
```

---

## Environment Detection (Smart Routing)

```javascript
// This runs in the browser AUTOMATICALLY

if (URL = dealshub-one.vercel.app) {
  API_BASE = ''  // Use relative /api/ paths
  // Browser requests: /api/nearby-deals
  // Automatically goes to: https://dealshub-one.vercel.app/api/nearby-deals
}

else if (URL = localhost:5173) {
  API_BASE = ''  // Use Vite proxy
  // Browser requests: /api/nearby-deals
  // Vite proxy: http://localhost:5001/api/nearby-deals
}

else if (URL = mobile app) {
  API_BASE = 'https://comeatable-tobi-bolometrically.ngrok-free.dev'
  // Browser requests: /api/nearby-deals
  // Actually goes to: https://ngrok-url/api/nearby-deals
}
```

---

## Request/Response Cycle

### To Production API

```
User Browser → HTTPS:443 → Vercel (dealshub-one.vercel.app)
                ▼
         [Route Handler]
         if /api/* → server.js
         else → dist/index.html
                ▼
         Express.js processes request
         CORS check ✓
         Validate input ✓
         Query database ✓
         Return JSON response
                ▼
         Browser receives response
         React updates UI
```

### To Database

```
Backend API → MySQL Connection Pool
             ├── Max 10 connections
             ├── Auto-reconnect on failure
             └── Query timeout protection
                ▼
         Cloud Database (PlanetScale/AWS)
         Executes SQL query
                ▼
         Returns result set
         Backend formats as JSON
         Sends to frontend
```

---

## Latency Expectations

```
                 LOCAL (Dev)         PRODUCTION (Vercel)
Location:         ~0ms               ~50-100ms
Browser:          http://localhost   https://
API Call:         1-10ms             50-200ms
Database:         5-20ms             100-500ms (depends on region)
Total:           ~10-40ms            ~200-700ms

For comparison:
- Perceptible latency: > 100ms
- Good UX: < 200ms
- Modern SPA apps: 200-500ms (typical)
```

---

## Security Flow

```
1. Request comes in
   ▼
CORS Check
   ├── Is origin in whitelist?
   │   └── dealshub-one.vercel.app ✓
   │   └── localhost:5173 ✓
   │   └── Mobile app (no origin) ✓
   └── Reject if not allowed ✗
   ▼
Request Validation
   ├── Check headers
   ├── Check Content-Type
   └── Check request format
   ▼
Authentication Check (if needed)
   ├── Verify JWT token
   └── Check user permissions
   ▼
Database Query (with parameterized statements)
   ├── Prevent SQL injection ✓
   ├── Limit results
   └── Transaction safety
   ▼
Response
   ├── Only send needed data
   ├── Never expose secrets
   └── Set security headers
```

---

## Deployment Flow

### Development
```
npm run dev:all
├── Backend: npm run server
│   └── node server.js → localhost:5001
│
└── Frontend: npm run dev
    └── vite --host → localhost:5173
       ├── Vite proxy: /api → localhost:5001
       └── Hot reload enabled
```

### Production
```
vercel --prod
├── Vercel detects package.json
├── Runs build:vercel script
│   └── vite build → dist/ folder
├── Uploads server.js
├── Uploads dist/
├── Configures using vercel.json
├── Sets environment variables
├── Creates serverless functions
└── Ready at: dealshub-one.vercel.app
   ├── Static: dist/* → CDN
   └── Dynamic: /api/* → server.js
```

---

## Key Features & How They Work

### 1. Nearby Deals
```
Algorithm: Haversine Distance Formula
SELECT * FROM deals
WHERE (6371 * acos(...)) <= radius_km
ORDER BY distance ASC
LIMIT 20

Uses: User's current lat/lng + location history
```

### 2. Service Provider Matching
```
Algorithm: Geospatial Distance + Rating
SELECT sp.* FROM service_providers sp
JOIN products p ON sp.id = p.service_provider_id
WHERE distance_km <= 5
ORDER BY sp.rating DESC, count DESC
```

### 3. Order Tracking
```
Status Flow:
pending → accepted → preparing → ready → 
shipped → in_transit → delivered
(Email notifications at each step)
```

### 4. Review System
```
Structure:
user_id → review → deal_id → product_id
Rating → Aggregated to average
Used for ranking deals and providers
```

---

## File Structure Reference

```
my-app/
├── server.js                          # Express backend
├── vite.config.js                     # Frontend build config
├── vercel.json                        # ⭐ Deployment config
├── .vercelignore                      # ⭐ Deploy optimization
├── package.json
├── .env                               # Local environment
├── .env.example                       # Reference guide
│
├── src/                               # Frontend code
│   ├── App.jsx
│   ├── config.js                      # ⭐ API URL detection
│   ├── main.jsx
│   ├── components/
│   ├── pages/
│   └── utils/
│
├── public/                            # Static assets
├── dist/                              # Built frontend (generated)
│
└── Documentation
    ├── PRODUCTION_README.md           # ⭐ Start here
    ├── DEPLOYMENT_CHECKLIST.md
    ├── VERCEL_SETUP.md
    ├── QUICK_DEPLOYMENT_GUIDE.md
    ├── API_ENDPOINTS.md
    └── This file (ARCHITECTURE.md)
```

---

## Monitoring & Debugging

### Frontend Errors
```
Check: Browser DevTools Console
- Network tab for API calls
- Application tab for storage
- React DevTools extension
```

### Backend Errors
```
Check: Vercel Dashboard → Function Logs
- API response status codes
- Database connection errors
- Email service errors
-Timeout issues
```

### Database Errors
```
Check: Database connection settings
- Can connect from Vercel IP?
- Correct credentials?
- Database exists?
- Tables created?
```

---

## Performance Optimization

Already implemented:
- ✅ Connection pooling (10 connections)
- ✅ Query result limits
- ✅ Index on frequently queried columns
- ✅ Gzip compression (Vercel)
- ✅ CDN for static assets (Vercel)
- ✅ Response caching headers
- ✅ Database transaction safety

---

## Summary

Your application is a **modern, scalable marketplace** that:
1. Serves frontendvia Vercel CDN (fast)
2. Runs APIs via Vercel Serverless (scalable)
3. Stores data in cloud MySQL (reliable)
4. Sends emails via Gmail (integrated)
5. Uses Google APIs (location services)

**All components work together** through:
- RESTful APIs
- Environment detection
- CORS policies
- Error handling
- Security measures

**Production deployment** requires:
- Database setup ⏳
- Email credentials ⏳
- Vercel environment variables ⏳
- Single command: `vercel --prod` ✅

---

**Now go deploy this awesome app! 🚀**
