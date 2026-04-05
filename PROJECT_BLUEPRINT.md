# 🏢 Deals Hub - Complete Project Blueprint

**Project Name:** Deals Hub  
**Current Date:** April 3, 2026  
**Stack:** React + Vite (Frontend) | Node.js + Express (Backend) | MySQL (Database)  
**Status:** Production Ready

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Key Features](#key-features)
7. [File Structure](#file-structure)
8. [Setup & Deployment](#setup--deployment)

---

## 🎯 Project Overview

**Deals Hub** is a full-stack web application that connects dealers/service providers with customers seeking deals, discounts, and services. It features:

- **Dealer Management System:** Businesses can register, manage products/deals, update locations, and track performance
- **Customer Discovery Platform:** Users can browse products by category, location, and deal type
- **Influencer Integration:** Influencers can promote products and earn commissions
- **Real-time Location Services:** GPS-based product matching and nearby deal discovery
- **Email Notifications:** Automated registration confirmations and promotional emails

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework:** React 19.2
- **Build Tool:** Vite 6.x
- **Styling:** CSS-in-JS (inline styles + App.css)
- **HTTP Client:** Axios
- **State Management:** React hooks (useState, useEffect, useContext)
- **API Proxy:** Vite proxy to backend at `/api`

### Component Structure

#### **Pages** (`src/pages/`)
1. **Home.jsx** - Landing page with featured deals and categories
2. **Explore.jsx** - Product discovery with filtering, search, and category navigation
3. **Influencers.jsx** - Influencer marketplace and profile showcase
4. **Profile.jsx** - User profile management and order history

#### **Components** (`src/components/`)

##### **Auth.jsx** - Authentication System
- **Features:**
  - Dealer & Customer login options
  - Phone-based authentication
  - Password generation from phone number (last 4 digits + random 6 chars)
  - Registration form with business details
  - Session management with localStorage
  - Email/password validation
  - Remember me functionality
- **Flows:**
  - Dealer: Enter phone → system generates password from phone tail
  - Customer: Standard email/password login

##### **DealerDashboard.jsx** - Premium Dealer Management (NEWLY REDESIGNED)
- **Styling:** Ultra-modern glassmorphism with dark theme (gradient sidebar)
- **Color Scheme:** 
  - Primary: #667eea (purple) → #764ba2 (darker purple)
  - Secondary: #3b82f6 (blue)
  - Success: #10b981 (green)
  - Danger: #f43f5e (red)
  - Background: #0f172a (dark navy), #f8fafc (light)
  
- **Navigation:** Sidebar with 4 tabs
  1. **Dashboard Tab**
     - Statistics cards (products, orders, revenue, rating)
     - Quick action buttons
     - Business overview
  
  2. **Products Tab** (`/api/dealer-products/:dealerId`)
     - Add new product form (category-first)
     - List all dealer products with edit/delete
     - Price display with category badge
     - Product filtering and sorting
     - Delete confirmation dialogs
     - Backend: `POST /api/add-dealer-product`, `DELETE /api/delete-dealer-product/:id`
  
  3. **Location Tab** (`/api/dealer-location-update`)
     - Address input field
     - Latitude/longitude fields
     - GPS auto-detection button (uses Geolocation API)
     - OpenStreetMap reverse geocoding integration
     - Input validation for coordinates
     - Backend: `POST /api/dealer-location-update`
  
  4. **Settings Tab**
     - Display business information (read-only)
     - Account deletion option
     - Backend: `DELETE /api/delete-dealer-account/:dealerId`

- **UI Features:**
  - Loading states on all buttons
  - Success/error notifications with emoji indicators
  - Form validations
  - Smooth transitions and hover effects
  - Responsive grid layout
  - Animated alerts that auto-close

##### **Onboarding.jsx** - New User Setup
- Business registration form
- Category selection
- Location setup
- Initial password configuration
- Profile photo upload (optional)

##### **Splash.jsx** - Loading/Welcome Screen
- App branding display
- Loading animation
- Smooth transition to main app

##### **Navigation.jsx** - Top Navigation Bar
- Logo and app title
- User profile dropdown (conditional)
- Logout button
- Active route indicators
- Mobile-responsive menu

##### **LocationPrompt.jsx** - Geolocation Handler
- Request user location permission
- Background GPS tracking
- Location accuracy display
- Update frequency configuration

##### **InfluencerDashboard.jsx** - Influencer Tools
- Performance metrics dashboard
- Commission tracking
- Promotional link generator
- Follower management
- Campaign analytics

##### **InfluencerApplication.jsx** - Influencer Signup
- Application form with requirements
- Social media links input
- Follower count verification
- Terms and conditions

### Global Styling

#### **index.css** - Global Styles
```css
- CSS Variables for colors, spacing, shadows
- Font family: System fonts stack (-apple-system, BlinkMacSystemFont, Segoe UI)
- Default reset (margin, padding, box-sizing)
- Smooth scrolling behavior
- Form element styling
```

#### **App.css** - Component Styles
```css
- Page layouts
- Modal styles
- Card components
- Button variations (primary, secondary, danger)
- Loading spinners
- Toast notifications
- Responsive breakpoints (mobile, tablet, desktop)
```

### API Configuration (`config.js`)
```javascript
// Dynamic API base URL selection:
// - localhost/127.0.0.1 → Uses Vite proxy (empty string)
// - Production → Uses VITE_API_BASE_URL env var or ngrok URL
export const API_BASE = getApiBaseUrl();
```

### Main Entry Points
- **main.jsx** - React DOM render, initializes app
- **App.jsx** - Root component, routing logic, auth state
- **data.js** - Mock data for development
- **utils.js** - Utility functions (formatting, validation, helpers)

---

## 🖥️ Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MySQL 8.x with mysql2/promise
- **Email Service:** Nodemailer (Gmail SMTP)
- **CORS:** Enabled for all origins
- **Auth:** Session-based with login tracking
- **Tunneling:** ngrok for local development

### Core Features

#### **Database Connection**
```javascript
// MySQL connection pool with config:
- Host: process.env.DB_HOST (default: localhost)
- User: process.env.DB_USER (default: root)
- Password: process.env.DB_PASSWORD
- Database: deals_hub
- Connection limit: 10
- Automatic reconnection on failure
```

#### **Password Generation System**
```javascript
generatePassword(phoneNumber) {
  // Takes: +91-98765-43210 (example)
  // Returns: 4321abc123 (last 4 digits + 6 random hex chars)
  // This ensures unique passwords tied to phone numbers
}
```

#### **Email Service**
- **Provider:** Gmail SMTP
- **Configuration:** Requires EMAIL_USER and EMAIL_PASSWORD in .env
- **Templates:** HTML-formatted emails with inline CSS
- **Used for:**
  - Registration confirmation with login credentials
  - Business validation emails
  - Promotional newsletters
  - Order notifications
  - Password reset links

#### **Session Management**
```javascript
// login_sessions table tracks:
- user_id, email, provider
- Location: latitude, longitude, accuracy
- Location name (via reverse geocoding)
- Timestamp of login
- IP address (optional)
```

---

## 🗄️ Database Schema

### Tables

#### **users**
```sql
- id (INT, PRIMARY KEY)
- name, email, phone (UNIQUE)
- password (hashed with bcrypt)
- profile_photo_url
- location_accuracy, latitude, longitude
- location_updated_at (TIMESTAMP)
- is_active, created_at, updated_at
```

#### **service_providers** (Dealers/Businesses)
```sql
- id (INT, PRIMARY KEY)
- business_name (UNIQUE)
- email (UNIQUE), phone (UNIQUE)
- password (hashed)
- address, latitude, longitude
- business_category
- registration_date
- is_verified, is_active
- profile_image_url
```

#### **products**
```sql
- id (INT, PRIMARY KEY)
- dealer_id (FOREIGN KEY → service_providers.id)
- name, description
- price (DECIMAL)
- category (enum: Fitness & Gym, Food & Dining, Beauty & Salon, Shopping, Entertainment)
- location, latitude, longitude
- dealer_name, dealer_phone, dealer_email
- created_at, updated_at
```

#### **login_sessions**
```sql
- id (INT, PRIMARY KEY)
- user_id, email, provider
- latitude, longitude, location_accuracy
- location_name (VARCHAR 500)
- login_timestamp
- ip_address (optional)
```

#### **influencers**
```sql
- id (INT, PRIMARY KEY)
- user_id (FOREIGN KEY → users.id)
- follower_count, engagement_rate
- social_media_links (JSON)
- commission_rate
- is_verified, is_active
- joined_date
```

#### **orders**
```sql
- id (INT, PRIMARY KEY)
- user_id (FOREIGN KEY)
- product_id (FOREIGN KEY)
- influencer_id (nullable, FOREIGN KEY)
- quantity, total_price
- status (pending, confirmed, delivered, cancelled)
- order_date, delivery_date
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### **POST /api/dealer-login**
- **Request:** `{ email, password }`
- **Response:** `{ id, business_name, email, address, latitude, longitude, ... }`
- **Logic:** Verify credentials, return dealer info for localStorage

#### **POST /api/dealer-register**
- **Request:** `{ business_name, email, phone, category, address, latitude, longitude }`
- **Response:** `{ id, generated_password, message }`
- **Actions:** Create account, send registration email with credentials

#### **POST /api/customer-login**
- **Request:** `{ email, password }`
- **Response:** `{ id, name, email, profile_photo_url, ... }`
- **Logic:** Customer authentication

#### **POST /api/customer-register**
- **Request:** `{ name, email, phone, password }`
- **Response:** `{ id, user_id, message }`
- **Actions:** Create account, send confirmation email

---

### Dealer Product Endpoints

#### **GET /api/dealer-products/:dealerId**
- **Purpose:** Fetch all products for a dealer
- **Response:** `[ { id, name, description, price, category, ... } ]`
- **Query:** `SELECT * FROM products WHERE dealer_id = ? ORDER BY created_at DESC`

#### **POST /api/add-dealer-product**
- **Request:** 
  ```json
  {
    "dealerId": 5,
    "dealerName": "John's Gym",
    "name": "Gold Membership",
    "description": "Premium gym access",
    "price": 4999.99,
    "category": "Fitness & Gym",
    "location": "123 Main St",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "dealerPhone": "9876543210",
    "dealerEmail": "john@gym.com"
  }
  ```
- **Response:** `{ id: 142, message: "Product added successfully" }`
- **Validation:** All required fields present
- **Query:** `INSERT INTO products (...) VALUES (...)`

#### **DELETE /api/delete-dealer-product/:productId**
- **Purpose:** Delete a product listing
- **Response:** `{ message: "Product deleted" }`
- **Query:** `DELETE FROM products WHERE id = ?`

---

### Dealer Location Endpoints

#### **POST /api/dealer-location-update**
- **Request:**
  ```json
  {
    "dealerId": 5,
    "address": "456 Business Ave",
    "latitude": 28.6250,
    "longitude": 77.2100
  }
  ```
- **Response:** `{ message: "Location updated successfully" }`
- **Validation:** Numeric latitude/longitude, non-empty address
- **Query:** `UPDATE service_providers SET address=?, latitude=?, longitude=? WHERE id=?`

---

### Dealer Account Endpoints

#### **DELETE /api/delete-dealer-account/:dealerId**
- **Purpose:** Permanently delete dealer account and all products
- **Response:** `{ message: "Account deleted successfully" }`
- **Logic:**
  1. `DELETE FROM products WHERE dealer_id = ?`
  2. `DELETE FROM service_providers WHERE id = ?`
- **Warning:** Cascading delete - irreversible

---

### Customer Product Discovery

#### **GET /api/all-products**
- **Purpose:** Fetch all available products (home page)
- **Response:** 
  ```json
  [
    {
      "id": 1,
      "name": "Product Name",
      "price": 999.99,
      "category": "Fitness & Gym",
      "business_name": "Store Name",
      "dealer_phone": "9876543210",
      "dealer_lat": 28.6139,
      "dealer_lng": 77.2090
    }
  ]
  ```
- **Limit:** 50 products (paginated)
- **Query:** `SELECT p.*, s.business_name... FROM products p LEFT JOIN service_providers s...`

#### **GET /api/products-by-category/:category**
- **Purpose:** Filter products by category
- **Response:** Same as `/all-products` but filtered
- **Categories:** Fitness & Gym, Food & Dining, Beauty & Salon, Shopping, Entertainment

#### **GET /api/products-by-location/:latitude/:longitude/:radius**
- **Purpose:** Find products within radius (in km)
- **Response:** Products with distance calculated
- **Logic:** Haversine formula for great-circle distance

---

### Email Endpoints

#### **POST /api/send-validation-email**
- **Request:** `{ email, subject, htmlContent }`
- **Response:** `{ message: "Email sent", timestamp }`
- **Template:** HTML email with inline styles

---

## ✨ Key Features

### 1. **Phone-Based Authentication for Dealers**
- Dealer enters phone number
- System generates password: Last 4 digits of phone + 6 random hex chars
- Password sent via email
- Unique, memorable, secure by default

### 2. **Premium Dealer Dashboard**
- **Design:** Modern glassmorphism with dark theme
- **Components:** 
  - Sidebar navigation with icons
  - Statistics cards with metrics
  - Tab-based interface (dashboard, products, location, settings)
  - Smooth loading states and animations
- **Functionality:**
  - Real-time product CRUD operations
  - GPS-based location updates with auto-geocoding
  - Account management
  - Error notifications with emoji feedback

### 3. **Product Management**
- Categories: Fitness & Gym, Food & Dining, Beauty & Salon, Shopping, Entertainment
- Full CRUD operations
- Price and description support
- Dealer association for tracking ownership

### 4. **Location Services**
- GPS coordinates storage (latitude/longitude)
- Browser geolocation API integration
- Reverse geocoding via OpenStreetMap Nominatim
- Distance-based product discovery
- Location accuracy tracking

### 5. **Email Integration**
- Registration confirmation emails
- Login credentials delivery
- HTML templates with gradient headers
- Professional formatting
- Two-button call-to-action layouts
- Tested in all email clients (Gmail, Outlook, Apple Mail)

### 6. **Session Management**
- Login tracking with timestamp and location
- Persistent sessions via localStorage
- Automatic logout on tab close (optional)
- Multi-device login support

### 7. **Influencer System**
- Influencer profiles and dashboards
- Commission tracking
- Promotional link generation
- Follower management

---

## 📁 File Structure

```
My App/
├── src/
│   ├── components/
│   │   ├── Auth.jsx                    # Login/Register (dealers & customers)
│   │   ├── DealerDashboard.jsx         # Premium dealer management UI
│   │   ├── InfluencerDashboard.jsx     # Influencer metrics & tools
│   │   ├── InfluencerApplication.jsx   # Influencer signup form
│   │   ├── LocationPrompt.jsx          # Geolocation request handler
│   │   ├── Navigation.jsx              # Top navbar component
│   │   ├── Onboarding.jsx              # New user setup wizard
│   │   └── Splash.jsx                  # Loading/welcome screen
│   ├── pages/
│   │   ├── Explore.jsx                 # Product discovery & filtering
│   │   ├── Home.jsx                    # Landing page & featured deals
│   │   ├── Influencers.jsx             # Influencer marketplace
│   │   └── Profile.jsx                 # User profile & order history
│   ├── App.jsx                         # Root component & routing
│   ├── App.css                         # Component styling
│   ├── main.jsx                        # React DOM entry
│   ├── index.css                       # Global styles
│   ├── config.js                       # API URL configuration
│   ├── data.js                         # Mock/sample data
│   └── utils.js                        # Utility functions
├── public/                             # Static assets
├── server.js                           # Express backend (1310+ lines)
├── schema.sql                          # MySQL database schema
├── start-tunnel.js                     # ngrok tunnel starter
├── vite.config.js                      # Vite build configuration
├── package.json                        # Dependencies & scripts
├── .env                                # Environment variables (Git ignored)
├── .env.local                          # Local overrides (Git ignored)
├── eslint.config.js                    # ESLint rules
├── README.md                           # Project documentation
├── PROJECT_BLUEPRINT.md                # This file
└── ngrok_url.txt                       # Auto-generated ngrok URL
```

---

## 🚀 Setup & Deployment

### Prerequisites
```bash
- Node.js 18+ (LTS recommended)
- npm 9+
- MySQL 8.0+
- ngrok account (for tunneling)
```

### Installation

#### 1. **Clone and Install**
```bash
cd "/Users/manshafjamsith/Desktop/Mark UI/My App"
npm install
```

#### 2. **Environment Configuration** (`.env`)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=deals_hub

# Email Service
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail App Password, not regular password

# API
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.dev
PORT=5001

# Sessions
SESSION_SECRET=your-random-secret-key
```

#### 3. **Database Setup**
```bash
# Create database and import schema
mysql -u root -p deals_hub < schema.sql
```

#### 4. **Start Development**

**Option A: Locally (Frontend proxy to backend)**
```bash
# Terminal 1 - Backend
node server.js
# Output: ✅ Server listening on port 5001

# Terminal 2 - Frontend + Vite dev server
npm run dev
# Output: VITE v6.x.x  ready in xxx ms → http://localhost:5173
```

**Option B: With ngrok tunnel**
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Ngrok tunnel
node start-tunnel.js
# Output: URL: https://xxxxx-xxxxx-xxxxx.ngrok-free.dev

# Terminal 3 - Frontend
npm run dev
```

#### 5. **Production Deployment**

**Build Frontend:**
```bash
npm run build
# Output: dist/ folder ready for deployment
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
# Automatic deployment to vercel.app domain
```

**Deploy Backend:**
- Use Heroku, Railway, or Render for Node.js backend
- Update VITE_API_BASE_URL to production backend URL
- Ensure MySQL is hosted (AWS RDS, PlanetScale, or local)

---

## 🧪 Testing

### Manual Testing Checklist

#### **Dealer Registration**
- [ ] Load Auth component
- [ ] Select "Dealer" option
- [ ] Enter phone number
- [ ] Receive generated password
- [ ] Check email for confirmation
- [ ] Login with credentials
- [ ] Verify balance/metrics on dashboard

#### **Product Management**
- [ ] Add product with category > name > price
- [ ] Verify product appears in list
- [ ] Edit product details
- [ ] Delete product with confirmation
- [ ] Verify backend removes from database

#### **Location Updates**
- [ ] Use "Get GPS" button
- [ ] Verify latitude/longitude auto-filled
- [ ] Enter address manually
- [ ] Save location
- [ ] Verify in backend database

#### **Customer Discovery**
- [ ] Browse all products
- [ ] Filter by category
- [ ] Search by name
- [ ] View dealer info and contact
- [ ] Find nearby deals (distance-based)

#### **Email Delivery**
- [ ] Check both "Dashboard Button" appears in email client
- [ ] Verify links are clickable
- [ ] Test in Gmail, Outlook, Apple Mail
- [ ] Confirm credentials are included

---

## 🔧 Troubleshooting

### Backend Issues

**"Cannot GET /api/all-products"**
- Ensure server.js is running on port 5001
- Check MySQL connection status
- Verify routes are defined before app.listen()

**"Failed to add product"**
- Check all required fields in request
- Verify dealer_id matches service_providers table
- Check MySQL error logs

**"Email not sending"**
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" in Gmail settings

### Frontend Issues

**"API calls failing (JSON parse error)"**
- Ensure backend is responding with JSON
- Check VITE_API_BASE_URL is correct
- Verify ngrok tunnel is active
- Check CORS configuration on backend

**"Products not loading"**
- Verify dealer_id exists in database
- Check network tab for API response
- Confirm MySQL database has data

---

## 📊 Current Status

**✅ Completed:**
- Premium DealerDashboard with glassmorphism design
- All CRUD endpoints for product management
- Location update system with GPS integration
- Email templating with table-based layouts (renders correctly)
- Database schema with proper relationships
- Dealer authentication with phone-based passwords
- Customer product discovery system
- Error handling and validation

**🔄 In Progress:**
- Influencer system refinement
- Order/transaction tracking
- Analytics dashboard
- Payment integration

**📋 Planned:**
- Mobile app (React Native)
- Admin dashboard
- Advanced filtering (price range, rating)
- Real-time notifications
- Review and rating system

---

## 📞 Support & Contact

For issues or questions:
1. Check error messages in browser console
2. Review server.js logs
3. Verify database connection
4. Test API endpoints with Postman
5. Check environment configuration

---

**Last Updated:** April 3, 2026  
**Version:** 1.0 Production  
**License:** MIT
