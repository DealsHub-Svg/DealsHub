# ⚡ Quick Reference - Production Deployment

## Your Vercel Link
```
🌐 https://dealshub-one.vercel.app
```

---

## 3 Things You Need

### 1. Database
- Use: **PlanetScale** (free, MySQL)
- Or: AWS RDS, Azure MySQL, DigitalOcean
- Get: Host, User, Password

### 2. Email
- Go to: https://myaccount.google.com/apppasswords
- Get: 16-character app password

### 3. API Key
- Get from: Google Cloud Console
- For: Search & geolocation features

---

## Deployment Steps

### Step 1: Add Variables to Vercel
Dashboard → Settings → Environment Variables

```
DB_HOST = (your database host)
DB_USER = (your db username)
DB_PASSWORD = (your db password)
DB_NAME = deals_hub
EMAIL_USER = your_email@gmail.com
EMAIL_PASSWORD = (16-char app password)
JWT_SECRET = manshaf_deals_hub_jwt_secure_2026_!@#
VITE_GOOGLE_MAPS_API_KEY = (your API key)
NODE_ENV = production
```

### Step 2: Deploy
```bash
cd /Users/manshafjamsith/Downloads/my-app
vercel --prod
```

### Step 3: Test
```bash
curl https://dealshub-one.vercel.app/api/health
```
Should return: `{"ok":true}`

### Step 4: Visit
```
https://dealshub-one.vercel.app
```

---

## Key Files

| File | Purpose |
|------|---------|
| `vercel.json` | Deployment config ✅ |
| `server.js` | Backend API ✅ |
| `src/config.js` | Auto-detect env ✅ |
| `.env` | Local dev vars |
| `.env.example` | Reference guide |

---

## If Something Breaks

| Error | Fix |
|-------|-----|
| 500 Database Error | Check DB credentials in Vercel env |
| 404 /api Not Found | Backend may not be deployed yet, wait 30s |
| Email Not Working | Use app password, not regular password |
| CORS Error | Already configured, check domain |
| Env vars undefined | Redeploy after setting them |

---

## Endpoints

All start with: `https://dealshub-one.vercel.app/api/`

**Test:** `/health`
**User:** `/save-user`, `/log-session`  
**Deals:** `/nearby-deals/:email`, `/deals-by-category/:category`
**Products:** `/nearby-products/:email`, `/add-product`
**Orders:** `/create-order`, `/user-orders/:email`

Full list in: `API_ENDPOINTS.md`

---

## Local Development Still Works

```bash
npm run dev:all
```

Runs on: http://localhost:5173
Production API uses relative `/api` paths (auto-detected environment)

---

## Monitoring

**Vercel Dashboard:**
- Deployments tab: See versions
- Function logs: Real-time API logs
- Analytics: Usage stats

**Check logs:**
```bash
vercel logs --prod
```

---

## Recommended Reading Order

1. This file (you're reading it!)
2. `DEPLOYMENT_CHECKLIST.md` (step-by-step)
3. `PRODUCTION_README.md` (detailed overview)
4. `VERCEL_SETUP.md` (Vercel specifics)
5. `API_ENDPOINTS.md` (all endpoints)

---

## Timeline

- Database: 5-10 min ⏱️
- Email setup: 5 min ⏱️
- Vercel vars: 5 min ⏱️
- Deploy: 5 min ⏱️
- Testing: 10 min ⏱️

**Total: ~30-45 minutes to production**

---

## Production Status

| Component | Status |
|-----------|--------|
| Frontend (React) | ✅ Live |
| Backend (API) | ⏳ Ready to deploy |
| Database | ⏳ Setup needed |
| Email | ⏳ Setup needed |
| All Code | ✅ Configured |

**→ Just need database + email credentials, then run `vercel --prod`**

---

## Contact & Support

- Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
- Read error messages in Vercel Function logs
- Review comments in `server.js` for config details

---

**Your app is READY TO GO!** 🚀
