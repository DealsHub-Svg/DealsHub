# Vercel Production Setup Guide

## Frontend Deployment Status ✅
Your frontend is already deployed at: **https://dealshub-one.vercel.app**

## Backend Deployment & Configuration

### Step 1: Backend Environment Variables on Vercel
Go to your Vercel Dashboard → Project Settings → Environment Variables and add:

```
DB_HOST=your_mysql_server_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=deals_hub
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
JWT_SECRET=your_secret_key
VITE_GOOGLE_MAPS_API_KEY=your_api_key
NODE_ENV=production
```

**Important Notes:**
- `EMAIL_PASSWORD`: Create an App Password at https://myaccount.google.com/apppasswords (not your regular Gmail password)
- `DB_HOST`: This must be accessible from Vercel (use cloud MySQL like PlanetScale, AWS RDS, or similar)
- `JWT_SECRET`: Keep this secure and unique

### Step 2: Deploy Backend to Vercel
From your project root:
```bash
vercel --prod
```

This uses the `vercel.json` configuration to deploy both frontend and backend.

### Step 3: Verify Backend is Running
After deployment completes, visit:
```
https://dealshub-one.vercel.app/api/health
```

Should return: `{"ok":true}`

## How It Works 🔄

### Development
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:5001` (Express server)
- API calls use Vite proxy: `/api/...` → proxied to `http://localhost:5001`

### Production (Vercel)
- Frontend: `https://dealshub-one.vercel.app`
- Backend: `https://dealshub-one.vercel.app` (same domain)
- API calls use relative paths: `/api/...` → serverless functions in Vercel

## File Structure
```
my-app/
├── server.js              # Backend API server
├── vercel.json           # Vercel deployment config
├── src/
│   ├── App.jsx          # Frontend
│   ├── config.js        # API URL config (auto-detects environment)
│   └── ...
├── vite.config.js       # Vite dev proxy config
└── package.json         # Dependencies
```

## API Endpoints Available 🔗

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/save-user` - Save user profile with location
- `POST /api/log-session` - Log login session

### Location
- `GET /api/user-location-history/:email` - Get location history
- `GET /api/nearby-deals/:email?radius=5` - Get deals near user

### Deals
- `GET /api/deals-by-category/:category` - Get deals by category
- `GET /api/deal-categories` - List all categories
- `POST /api/save-deal` - Bookmark a deal
- `GET /api/user-saved-deals/:email` - Get bookmarked deals
- `POST /api/add-review` - Add review for deal

### Products & Service Providers
- `POST /api/register-service-provider` - Register business
- `POST /api/provider-login` - Login as service provider
- `POST /api/add-product` - Add product listing
- `GET /api/provider-products/:provider_id` - Get provider's products
- `GET /api/nearby-products/:email?radius=5` - Get products near user

### Orders
- `POST /api/create-order` - Create new order
- `GET /api/user-orders/:email` - Get user's orders
- `PATCH /api/update-order-status/:order_id` - Update order status

### Location Services
- `POST /api/geocode-address` - Convert address ↔ coordinates

## Troubleshooting 🔧

### CORS Errors
The server is configured to accept requests from:
- `https://dealshub-one.vercel.app`
- `http://localhost:5173` (dev)
- `http://localhost:3000` (alternate dev)
- ngrok URLs
- Mobile apps (no origin)

If you see CORS errors:
1. Check the frontend is hitting the correct domain
2. Verify CORS origins in `server.js`
3. Check browser console for blocked requests

### Database Connection Failed
- Verify DB credentials on Vercel environment variables
- Ensure database is accessible from Vercel IP ranges
- Check firewall/security group rules allow Vercel

### Email Service Not Working
- Create Gmail App Password (not regular password)
- Enable 2FA on Gmail account
- Check `EMAIL_USER` and `EMAIL_PASSWORD` env vars

### API Calls Return 404
- Verify backend is deployed: Check `/api/health` endpoint
- Ensure frontend is using `/api/...` paths (not full URLs)
- Check `src/config.js` is detecting environment correctly

## Email Service Status ✅
When the backend starts, it will show:
```
✅ Email service is ready!
```

If not configured, you'll see:
```
⚠️  Email service not configured correctly
```

## Testing Production 🧪

### Via Browser
Visit: `https://dealshub-one.vercel.app`

### Via API Client (Postman/Insomnia)
Test endpoint:
```
GET https://dealshub-one.vercel.app/api/health
```

### Via cURL
```bash
curl https://dealshub-one.vercel.app/api/health
```

Expected response:
```json
{"ok":true}
```

## Performance Tips ⚡
1. Use Vercel's built-in caching for static assets
2. MySQL connection pool is configured (10 connections max)
3. API responses are optimized with LIMIT clauses
4. Images should be served from CDN

## Next Steps
1. ✅ Set environment variables on Vercel dashboard
2. ✅ Deploy backend to Vercel
3. ✅ Test API endpoints
4. ✅ Monitor logs in Vercel dashboard
5. ✅ Set up domain (optional custom domain)

For more help, check the main README.md or API_ENDPOINTS.md
