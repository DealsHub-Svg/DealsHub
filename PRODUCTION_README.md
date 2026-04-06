# 🚀 Dealshub - Production Deployment Guide

**Frontend Live:** https://dealshub-one.vercel.app ✅

## What You Need to Know

Your application is a **full-stack app** deployed on Vercel with:
- **Frontend:** React + Vite (already running)
- **Backend:** Express API (to be deployed)
- **Database:** MySQL (needs setup)
- **Email:** Gmail SMTP (needs configuration)

### The Complete Architecture

```
User Browser
    ↓
https://dealshub-one.vercel.app (Vercel [Frontend])
    ↓
/api/...
    ↓
Backend API (Vercel [Serverless])
    ↓
MySQL Database (Cloud: PlanetScale/AWS/etc)
    ↓
Gmail SMTP (Email Service)
```

## Quick Start to Production

### 1️⃣ Database Setup (5-10 minutes)

**Option A: PlanetScale (Recommended - Free)**
```
1. Sign up: https://planetscale.com
2. Create organization and database "deals_hub"
3. Connect database
4. Copy credentials:
   - Host: xxxxx.mysql.planetscale.com
   - Username: xxxxx (for dev branch)
   - Password: (generate password)
```

**Option B: AWS RDS**
```
1. Create MySQL RDS instance
2. Size: db.t3.micro (free tier eligible)
3. Database name: deals_hub
4. Get endpoint, username, password
```

**Option C: Use Existing Database**
```
If you already have a MySQL database, use those credentials.
```

### 2️⃣ Email Service Setup (5 minutes)

**Using Gmail:**
```
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail + Windows Computer
3. Generate & copy 16-character password
4. You'll use this (not your Gmail password)
```

### 3️⃣ Environment Variables on Vercel (5 minutes)

**In Vercel Dashboard:**
```
Project Settings → Environment Variables
```

**Add these 9 variables:**

```
DB_HOST=your-db.mysql.planetscale.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=deals_hub
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
JWT_SECRET=manshaf_deals_hub_jwt_secure_2026_!@#
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
NODE_ENV=production
```

### 4️⃣ Deploy Backend (2 minutes)

**From terminal:**
```bash
cd /Users/manshafjamsith/Downloads/my-app
vercel --prod
```

**Wait for completion:**
```
✅ Created github-username/project
✅ Deployed to https://dealshub-one.vercel.app
```

### 5️⃣ Verify Everything (2 minutes)

**Test the API:**
```bash
# Health check (should return {"ok":true})
curl https://dealshub-one.vercel.app/api/health

# Create test user
curl -X POST https://dealshub-one.vercel.app/api/save-user \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","provider":"email","latitude":40.7128,"longitude":-74.0060}' 
```

**Visit the site:**
```
https://dealshub-one.vercel.app
```

Should see login screen and app loading.

## Files & Configuration

### Key Files Updated for Production
```
✅ vercel.json              - Deployment configuration
✅ server.js               - CORS configured for Vercel domain
✅ vite.config.js          - Build optimization
✅ src/config.js           - Auto-detects environment
✅ package.json            - Build scripts added
✅ .env.example            - Environment reference
✅ .vercelignore           - Optimize deployment
✅ VERCEL_SETUP.md         - Detailed Vercel guide
✅ DEPLOYMENT_CHECKLIST.md - Step-by-step checklist
```

### What Changed

1. **CORS Configuration** - Now accepts requests from:
   - https://dealshub-one.vercel.app
   - http://localhost:5173 (dev)
   - Mobile apps

2. **API URL Detection** - Automatically uses:
   - Empty string (relative paths) in production ✨
   - Vite proxy for development
   - Configurable URLs for mobile testing

3. **Environment Variables** - Added support for:
   - Production database (not localhost)
   - Email service credentials
   - API keys

## Development vs Production

### Development (Local)
```
Frontend: http://localhost:5173 (Vite dev)
Backend: http://localhost:5001 (Node.js)
Proxy: Vite proxies /api to http://localhost:5001

Run: npm run dev:all
```

### Production (Vercel)
```
Frontend: https://dealshub-one.vercel.app (Vercel)
Backend: https://dealshub-one.vercel.app/api/* (Vercel Serverless)
Database: Cloud MySQL (PlanetScale/AWS/etc)

Deploy: vercel --prod
```

## API Endpoints Available

### Core User Endpoints
- `POST /api/save-user` - Save/update user profile
- `POST /api/log-session` - Log login with location
- `GET /api/user-location-history/:email` - Location history

### Deals & Shopping
- `GET /api/nearby-deals/:email` - Deals near user (radius: 5km default)
- `GET /api/deals-by-category/:category` - Browse by category
- `GET /api/deal-categories` - List categories
- `POST /api/save-deal` - Bookmark deal
- `GET /api/user-saved-deals/:email` - Saved deals
- `POST /api/add-review` - Review products

### Service Providers
- `POST /api/register-service-provider` - Business registration
- `POST /api/provider-login` - Business login
- `POST /api/add-product` - Add product
- `GET /api/provider-products/:id` - Business products
- `GET /api/nearby-products/:email` - Products nearby

### Orders & Transactions
- `POST /api/create-order` - Place order
- `GET /api/user-orders/:email` - Order history
- `PATCH /api/update-order-status/:id` - Update order

### Other
- `POST /api/geocode-address` - Address lookup
- `GET /api/health` - Health check

## Troubleshooting

### "Cannot find module" errors
```
Solution: npm install was not run
Fix: Let Vercel's build process handle it (automatic)
```

### Database connection fails
```
Symptoms: 500 errors, "Cannot connect to database"
Fixes:
1. Verify DB_HOST, DB_USER, DB_PASSWORD on Vercel
2. Check database is accessible from Vercel (firewall rules)
3. Ensure database exists
```

### Email service not ready
```
Symptoms: "Email service not configured correctly"
Fixes:
1. Verify EMAIL_USER is correct Gmail address
2. Use app password (not regular Gmail password)
3. Enable 2FA on Gmail first
4. Redeploy after fixing env vars
```

### API returning 404
```
Symptoms: /api/health returns 404
Fixes:
1. Wait 30 seconds after deployment
2. Check Vercel build succeeded (check Function logs)
3. Verify backend deployed (should show "Deployed" status)
```

### CORS errors in browser
```
Symptoms: "Access to XMLHttpRequest denied by CORS"
Fixes:
1. Check you're accessing https://dealshub-one.vercel.app
2. CORS already configured for this domain
3. Check server.js CORS whitelist if using different domain
```

## Monitoring & Debugging

### Vercel Dashboard
```
1. Go to https://vercel.com/dashboard
2. Select "dealshub-one" project
3. View:
   - Deployments: See all versions
   - Function logs: Real-time API logs
   - Analytics: Usage stats
   - Settings: Env vars, domains
```

### Check Production Logs
```bash
# Use Vercel CLI to stream logs
vercel logs --prod
```

### Test Endpoint
```bash
# Simple health check
curl https://dealshub-one.vercel.app/api/health

# With full details
curl -v https://dealshub-one.vercel.app/api/health
```

## Performance Optimization

✅ Already configured in this setup:
- Connection pooling (10 connections)
- Response caching headers
- CORS optimization
- Gzip compression (Vercel automatic)
- Database query limits
- Error handling & recovery

## Security

✅ Already configured:
- CORS whitelist (not allowing all origins)
- Environment variables (not hardcoded secrets)
- Database credentials encrypted in Vercel
- Email passwords encrypted in Vercel
- JWT secret for auth
- HTTPS enforced

⚠️ Additional recommendations:
- Rotate JWT_SECRET periodically
- Monitor Vercel function logs for errors
- Backup database regularly
- Use strong database passwords

## Mobile App Integration

If you have a mobile app (Expo), it can connect to:
```
https://dealshub-one.vercel.app/api/...
```

Update mobile app config to use production URL after deployment.

## Next Steps

1. ✅ Read DEPLOYMENT_CHECKLIST.md
2. ✅ Get database credentials
3. ✅ Get Gmail app password
4. ✅ Set environment variables on Vercel
5. ✅ Run `vercel --prod`
6. ✅ Test using curl
7. ✅ Visit https://dealshub-one.vercel.app
8. ✅ Report any issues

## Support Documents

- **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment guide
- **VERCEL_SETUP.md** - Detailed Vercel configuration
- **API_ENDPOINTS.md** - Complete API reference
- **QUICK_START.md** - Quick reference

---

**Status:** ✅ Ready to deploy!

All code is configured. Just need database setup, email credentials, and run `vercel --prod`.

**Total time to production:** ~30-45 minutes
