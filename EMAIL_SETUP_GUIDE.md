# Email Setup Guide for DealHub

## Current Status ✅ Almost Complete

### ✅ Completed
1. **Email Updated:** manshafj83@gmail.com → dealshubmn@gmail.com
   - Updated in: .env, .env.production, .env.local, server.js
   
2. **Backend & Frontend Running:**
   - Frontend: http://localhost:5173 ✅
   - Backend API: http://localhost:5001 ✅
   - API Proxy working ✅
   - Firebase initialized ✅

3. **Vercel Configuration Ready:**
   - CORS configured for https://dealshub-one.vercel.app
   - vercel.json routes /api to server.js
   - Config.js automatically uses Vercel backend in production

### 🔴 Issue: Email Authentication Failing

**Error Message:**
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

This means Gmail is rejecting the app password. 

## How to Fix

### Step 1: Verify Gmail Account Setup
1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Verify **2-Step Verification is ENABLED** (red requirement!)
4. If not enabled:
   - Click "2-Step Verification"
   - Complete the setup process
   - Return to Security settings

### Step 2: Generate New App Password
1. In Security settings, scroll down to "App passwords"
2. If you don't see it, go to https://myaccount.google.com/apppasswords
3. Select:
   - App: "Mail"
   - Device: "Windows PC" (or your device type)
4. Google will generate a 16-character password with spaces like: `xxxx xxxx xxxx xxxx`

### Step 3: Update Password in .env Files
The password you get will have spaces like: `abcd efgh ijkl mnop`

**Remove the spaces** and use: `abcdefghijklmnop`

Update these files:
- `.env`
- `.env.production`
- `.env.local`

Change:
```
EMAIL_PASSWORD=bxdluqfxdxcdpdm
```

To your new password without spaces.

### Step 4: Restart Backend
Kill and restart the backend:
```bash
killall node
npm run dev  # or run the task again
```

Wait for the "✅ Email service is ready!" message.

### Step 5: Test Email
```bash
curl -X POST http://localhost:5001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"recipient_email":"your_test_email@gmail.com"}'
```

You should see:
```json
{
  "message": "Test email sent!",
  "info": "..."
}
```

## Common Issues

### Issue: "App passwords" option missing
**Solution:** 2FA is not enabled. Enable it first at https://myaccount.google.com/security

### Issue: "Invalid credentials" after multiple tries
**Solution:** 
- Try regenerating the app password (delete old one first)
- Make sure there are NO SPACES in the stored password
- Check for typos

### Issue: Email works locally but not on Vercel
**Solution:**
- The environment variable `EMAIL_PASSWORD` must be added to Vercel:
  1. Go to Vercel project settings
  2. Environment Variables
  3. Add: `EMAIL_PASSWORD=your_password_without_spaces`
  4. Redeploy

## Email Features Included

Once email is working, these features are enabled:

✅ **Business Registration Email** - Sends login credentials  
✅ **Service Provider Credentials** - Welcome email with temp password  
✅ **Test Email Endpoint** - `/api/test-email`  
✅ **Verification Emails** - For all registrations  

## Current Environment Variables

```
Email: dealshubmn@gmail.com
Password: bxdluqfxdxcdpdm (NEEDS CORRECT APP PASSWORD)
SMTP Host: smtp.gmail.com
SMTP Port: 465
SSL: Enabled
```

## Success Indicators

When properly configured:
1. `curl http://localhost:5001/api/health` shows:
   - `email_configured: true`
   - `email_user: dealshubmn@gmail.com`

2. Backend logs show:
   - `✅ Email service is ready!`

3. Test email succeeds without errors

## Support

If you still have issues:
1. Check Gmail security log: https://myaccount.google.com/security-checkup
2. Verify the account hasn't disabled "Less secure app access" (new Gmail usually doesn't need this)
3. Try regenerating app password
4. Ensure no spaces in the password value
