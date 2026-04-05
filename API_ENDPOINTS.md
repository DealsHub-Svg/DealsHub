# Deals Hub API Endpoints Documentation

**Base URL:** `http://localhost:5001` (local) or `https://comeatable-tobi-bolometrically.ngrok-free.dev` (production)

---

## 🔐 Authentication Endpoints

### Save/Update User Profile
**POST** `/api/save-user`

Saves or updates user profile with location data.

**Request Body:**
```json
{
  "google_id": "string (optional)",
  "name": "string",
  "email": "string (unique)",
  "picture": "string (optional)",
  "provider": "google|apple|email",
  "last_location_name": "string",
  "latitude": "number",
  "longitude": "number",
  "location_accuracy": "number"
}
```

**Response:**
```json
{
  "message": "User saved successfully",
  "userId": "number"
}
```

### Log Login Session
**POST** `/api/log-session`

Records login session with location and device information.

**Request Body:**
```json
{
  "email": "string",
  "provider": "google|apple|email",
  "latitude": "number",
  "longitude": "number",
  "location_accuracy": "number",
  "location_name": "string",
  "device_info": {
    "userAgent": "string",
    "platform": "string",
    "language": "string",
    "timezone": "string"
  }
}
```

**Response:**
```json
{
  "message": "Session logged successfully"
}
```

---

## 📍 Location Endpoints

### Get User Location History
**GET** `/api/user-location-history/:email`

Retrieves last 10 location check-ins for a user.

**Response:**
```json
[
  {
    "latitude": "number",
    "longitude": "number",
    "location_name": "string",
    "location_accuracy": "number",
    "provider": "string",
    "created_at": "timestamp"
  }
]
```

---

## 🎯 Deals Endpoints

### Get Nearby Deals
**GET** `/api/nearby-deals/:email?radius=5`

Finds all active deals near user's location (default 5 km radius).

**Query Parameters:**
- `radius` (optional): Search radius in kilometers (default: 5)

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "category": "string",
    "emoji": "string",
    "original_price": "number",
    "discounted_price": "number",
    "discount_percentage": "number",
    "rating": "number",
    "reviews_count": "number",
    "location_name": "string",
    "latitude": "number",
    "longitude": "number",
    "city": "string",
    "distance_km": "number"
  }
]
```

### Get Deals by Category
**GET** `/api/deals-by-category/:category`

Retrieves all active deals in a specific category, sorted by rating.

**Response:** Same as nearby deals array

### Get All Deal Categories
**GET** `/api/deal-categories`

Retrieves all available deal categories.

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "emoji": "string",
    "description": "string",
    "display_order": "number"
  }
]
```

---

## 💾 User Bookmarks Endpoints

### Save Deal to Bookmarks
**POST** `/api/save-deal`

Add a deal to user's saved/bookmarked deals.

**Request Body:**
```json
{
  "email": "string",
  "deal_id": "number"
}
```

**Response:**
```json
{
  "message": "Deal saved successfully"
}
```

### Get User's Saved Deals
**GET** `/api/user-saved-deals/:email`

Retrieves all bookmarked deals for a user.

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "category": "string",
    "emoji": "string",
    "original_price": "number",
    "discounted_price": "number",
    "discount_percentage": "number",
    "rating": "number",
    "location_name": "string",
    "saved_at": "timestamp"
  }
]
```

---

## ⭐ Review Endpoints

### Add Review for Deal
**POST** `/api/add-review`

Submit a rating and review for a deal.

**Request Body:**
```json
{
  "email": "string",
  "deal_id": "number",
  "rating": "number (1-5)",
  "review_text": "string"
}
```

**Response:**
```json
{
  "message": "Review added successfully"
}
```

---

## 📊 Database Tables

### 13 Core Tables:
1. **users** - User profiles with location tracking
2. **login_sessions** - Login audit trail with device info
3. **locations** - Stores, businesses, restaurants
4. **deals** - All offers and discounts
5. **deal_categories** - Deal type classification
6. **user_saved_deals** - Bookmarked deals (many-to-many)
7. **influencers** - Creator profiles
8. **influencer_stats** - Performance metrics
9. **referrals** - Referral tracking
10. **user_location_history** - Complete location time-series
11. **nearby_services** - Distance calculations
12. **reviews** - User ratings
13. **notifications** - Alert system

### Automatic Triggers:
- ✅ **update_user_location_on_login** - Updates user's current location when they log in
- ✅ **record_location_history_on_login** - Records location history automatically

---

## 🗺️ Distance Calculation

Nearby deals use the Haversine formula (6371 km Earth radius) to calculate great-circle distance between user and deal locations.

**Formula:**
```
distance = 6371 * acos(
  cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1)) + 
  sin(radians(lat1)) * sin(radians(lat2))
)
```

---

## ✅ Sample Data

**Locations:**
- Saffron Kitchen (Colombo 3) - 6.9271, 79.8612
- FitLife Gym (Nugegoda) - 6.9250, 79.8620
- Elite Salon (Bambalapitiya) - 6.9326, 79.8497

**Categories:**
🍛 Food & Dining | 💪 Fitness & Gym | ✂️ Beauty & Salon | 🛍️ Shopping | 🎭 Entertainment | ✈️ Travel

**Sample Deals:**
- Biryani Feast - Large Pot (50% off)
- Personal Training - 10 Sessions (40% off)
- Haircut + Blowdry (50% off)

---

## 🔄 Integration Flow

1. User logs in → `/api/save-user` (stores location)
2. Session logged → `/api/log-session` (records device info)
3. Trigger fires → Auto-updates user location + records history
4. Browse deals → `/api/deals-by-category` or `/api/nearby-deals`
5. Find interesting → `/api/save-deal` (bookmark)
6. Try deal → `/api/add-review` (rate)
7. Track history → `/api/user-location-history` or `/api/user-saved-deals`

---

## 🚀 Status

✅ All 13 tables created with proper indexes
✅ Triggers auto-recording location on every login
✅ All 8 core endpoints functional
✅ Distance calculation optimized
✅ Sample data loaded
✅ Servers running on localhost:5001
