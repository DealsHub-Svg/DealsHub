# 🧪 Testing Guide - Complete Workflow

## ✅ PREREQUISITES

### Running Services (Already Started)
- ✅ Backend: http://localhost:5001
- ✅ Frontend: http://localhost:5175
- ✅ MySQL: Connected
- ✅ Email: Configured

---

## 🎯 TEST SCENARIO: GYM SERVICE MARKETPLACE

### What We'll Test:
1. Dealer registration and product creation
2. Product discovery on customer home page
3. All contact methods (call, WhatsApp, directions)
4. Customer inquiry email notification
5. Dealer account deletion

---

## 📝 STEP-BY-STEP TEST

### PART 1: Dealer Registration & Setup

#### Step 1.1: Go to Dealer Login
```
URL: http://localhost:5175?mode=dealer
Expected: Dealer login page appears with email/password form
```

#### Step 1.2: Create Dealer Account
> **Note**: Use your preferred test credentials
```
Email: gym@powerfit.test
Password: GymPower2024

OR if existing:
Email: (your registered dealer email)
Password: (last 4 digits of phone + 6 random hex)
```

#### Step 1.3: Enter Dealer Dashboard
```
Expected Display:
- Dealer name at top
- Address and contact info
- 4 tabs: Overview | Products | Settings
- Stats showing: 0 Products, 4.5 Rating
```

---

### PART 2: Add Gym Products

#### Step 2.1: Go to Products Tab
```
Click on "Products" tab
Expected: Form appears with fields:
  - Product/Service Name*
  - Price (₹)*
  - Type: Service/Product
  - Category dropdown
  - Description textarea
```

#### Step 2.2: Add First Product
```
Form Input:
  Name: 1-Month Membership
  Price: 2999
  Type: Service
  Category: Fitness & Gym
  Description: Unlimited gym access for one month

Click: "Add Product" button
Expected: 
  - Success message appears
  - Form clears
  - Product appears in "Your Products/Services" list
```

#### Step 2.3: Add Second Product
```
Form Input:
  Name: Personal Training Session (1 Hour)
  Price: 500
  Type: Service
  Category: Fitness & Gym
  Description: One-on-one training with certified trainer

Submit and verify appears in list
```

#### Step 2.4: Add Third Product
```
Form Input:
  Name: Annual Membership
  Price: 29999
  Type: Service
  Category: Fitness & Gym
  Description: Full year access with free registration

Submit and verify appears in list

Expected: Products tab now shows 3 products listed
```

---

### PART 3: Update Location

#### Step 3.1: Go to Settings Tab
```
Click: "Settings" tab
Expected: Three sections:
  1. Business Information (name, email, phone)
  2. Location (address, latitude, longitude)
  3. Danger Zone (delete account)
```

#### Step 3.2: Add GPS Location
```
Option A - Auto Detect:
  Click: "📍 Use My Current Location" button
  Expected: Latitude and longitude auto-fill
  
Option B - Manual Entry:
  Address: Sector 5, Bangalore
  Latitude: 12.9716
  Longitude: 77.5946
```

#### Step 3.3: Save Location
```
All three fields filled:
  ✓ Address
  ✓ Latitude  
  ✓ Longitude

Message confirms: "✅ Location updated"
```

---

### PART 4: Test As Customer

#### Step 4.1: Logout from Dealer
```
Click: "🚪 Logout" button (top right)
Expected: Redirected to Auth page
```

#### Step 4.2: Login As Customer
```
Method: Google/Apple/Email
Create new test account (different from dealer)

Expected: Home page appears
```

#### Step 4.3: Allow GPS Permission
```
Browser prompt: "Allow location?"
Click: "Allow"

Expected:
  - Message shows: "📍 Using your location: [your address]"
  - Page loads nearby dealer services
```

#### Step 4.4: Find Gym Products
```
Scroll down on home page
Expected: New section appears:
  "📦 Local Dealer Services"
  
Shows 3 product cards:
  1. PowerFit Gym - 1-Month Membership - ₹2999
  2. PowerFit Gym - PT Session (1hr) - ₹500
  3. PowerFit Gym - Annual Membership - ₹29999
  
Each card shows:
  ✓ Dealer name
  ✓ Address
  ✓ Product name & description
  ✓ Price
  ✓ 4 action buttons
```

---

### PART 5: Test Contact Methods

#### Step 5.1: Call Button
```
Click: "📞 Call" on any product
Expected: Phone dialer opens (mobile) or shows tel: link (desktop)
Verify: Phone number shown is dealer's number
```

#### Step 5.2: WhatsApp Button
```
Click: "💬 WhatsApp" on any product
Expected: New tab opens WhatsApp
Verify: WhatsApp conversation with dealer's number
```

#### Step 5.3: Directions Button
```
Click: "📍 Directions" on any product
Expected: New tab opens Google Maps
Verify: Map shows:
  - Gym location (Sector 5, Bangalore)
  - Correct GPS coordinates marked
  - Directions available
```

#### Step 5.4: Inquire Button
```
Click: "✉️ Inquire" on a product
Expected: Modal popup appears:
  - Heading: "Send Inquiry to PowerFit Gym"
  - Close (✕) button
  
Form fields visible:
  □ Your Email (text field)
  □ Your Phone (tel field)
  □ Message (textarea)
  □ Send Inquiry button
```

---

### PART 6: Test Customer Inquiry

#### Step 6.1: Fill Inquiry Form
```
Form values (use test data):
  Your Email: customer@test.com
  Your Phone: +91-8765432100
  Message: Hi, I'm interested in the 1-month membership. 
           Can you tell me more about the membership benefits?

Click: "Send Inquiry" button
Expected:
  - Success message: "✅ Inquiry sent! Dealer will contact you soon."
  - Modal closes
  - Form clears
```

#### Step 6.2: Check Dealer Email
```
Open email for dealer account (gym@powerfit.test)
Expected new email with:
  - Subject: "New Inquiry for 1-Month Membership"
  - From: noreply@dealsapp.com
  - Body contains:
    • Customer Email: customer@test.com
    • Customer Phone: +91-8765432100
    • Message: [exactly as typed]
    • Professional formatting with purple gradient
```

---

### PART 7: Test Product Deletion

#### Step 7.1: Go Back to Dealer
```
Re-login as dealer (gym@powerfit.test)
Click: "Products" tab
Expected: Shows 3 products
```

#### Step 7.2: Delete a Product
```
Find: "Personal Training Session (1 Hour)" product
Click: "🗑️" delete button
Expected: Modal confirmation appears
  "Delete Product?"
  "This action cannot be undone."
  
Click: "Delete" button
Expected:
  - Confirmation message
  - Product removed from list
  - Only 2 products remain
```

---

### PART 8: Test Account Deletion (Optional)

#### Step 8.1: Go to Settings
```
Click: "Settings" tab
Scroll to: "🚨 Danger Zone" section
```

#### Step 8.2: Delete Account
```
Click: "Delete Account" button
Browser confirms: "Are you sure? This will permanently delete..."

Click: "OK" to confirm
Expected:
  - Account deleted
  - Redirected to login page
  - Success message displayed
```

#### Step 8.3: Verify Cascade Delete
```
Login again as dealer (if re-created)
Check: All 3 products deleted from system
Verify: No trace of products remains
```

---

## 📊 EXPECTED RESULTS CHECKLIST

### Dealer Features
- [✓] Can add products with name, price, description
- [✓] Can set GPS location (auto-detect or manual)
- [✓] Can view added products in list
- [✓] Can delete individual products
- [✓] Can update profile information
- [✓] Can delete entire account
- [✓] Dashboard shows correct stats

### Customer Features
- [✓] Can find nearby dealer products on home page
- [✓] See dealer name, address, product info
- [✓] Can call dealer directly
- [✓] Can open WhatsApp chat
- [✓] Can get directions to gym
- [✓] Can send inquiry via email

### Email System
- [✓] Inquiry emails sent successfully
- [✓] Emails contain customer info
- [✓] Emails formatted professionally
- [✓] Dealer receives all inquiries

### Database
- [✓] Products stored and retrieved
- [✓] Location coordinates saved
- [✓] Products deleted when account removed
- [✓] No orphaned records remain

---

## 🐛 TROUBLESHOOTING

### Issue: Products Not Showing on Home
**Solution**:
1. Check GPS permission granted
2. Verify dealer added products
3. Check dealer has GPS coordinates
4. Open browser console for errors
5. Backend should return nearby products

### Issue: Can't Add Product
**Solution**:
1. Verify name and price entered (required fields)
2. Check category selection
3. Look for error message in red
4. Check backend logs (terminal)

### Issue: Call/WhatsApp Not Working
**Solution**:
- Call: Desktop browsers show tel: link (click it)
- WhatsApp: Install WhatsApp or use web.whatsapp.com
- Either way, the link is correct - app/browser will handle

### Issue: Google Maps Not Opening
**Solution**:
1. Check internet connection
2. Verify GPS coordinates are valid
3. Try a different browser
4. Check if maps.google.com is accessible

### Issue: Inquiry Email Not Received
**Solution**:
1. Check spam/junk folder
2. Verify dealer email address is correct
3. Check .env file has correct Gmail credentials
4. Look in backend console for email errors
5. Try resending inquiry

### Issue: Can't Login as Dealer
**Solution**:
1. Verify URL has `?mode=dealer` parameter
2. Check credentials (email + password)
3. Password format: Last 4 digits of phone + 6 hex chars
4. Try different browser
5. Clear browser cache

---

## ⏱️ ESTIMATED TEST TIME

| Task | Time |
|------|------|
| Dealer registration | 2 min |
| Add 3 products | 5 min |
| Set location | 2 min |
| Switch to customer | 1 min |
| Find products | 1 min |
| Test contacts (all 4) | 3 min |
| Send inquiry | 2 min |
| Check email | 1 min |
| **Total** | **~18 minutes** |

---

## 🎓 WHAT YOU'LL LEARN

After completing this test, you'll have verified:

1. **Full dealer onboarding workflow** ✓
2. **Multi-role authentication** (dealer vs customer) ✓
3. **Real-time product management** ✓
4. **GPS-based discovery** ✓
5. **Multiple contact methods** ✓
6. **Email notification system** ✓
7. **Database persistence** ✓
8. **Cascade operations** (delete account → delete products) ✓

---

## 📸 SCREENSHOTS TO CAPTURE

1. Dealer dashboard overview
2. Products tab with added items
3. Settings tab with GPS location
4. Home page with discovered products  
5. ProductCard component expanded
6. Contact modal form
7. Inquiry confirmation
8. Dealer email received

---

## ✨ SUCCESS CRITERIA

✅ Test passes when:
- All 3 products visible on customer home
- All 4 contact buttons work
- Inquiry email received by dealer
- Products deleted from DB when account removed
- No errors in browser console
- No errors in terminal logs

---

## 🚀 READY TO TEST!

Start at: **http://localhost:5175?mode=dealer**

Follow the steps above and you'll have a complete marketplace experience! 🎉

Any issues? Check the troubleshooting section or review the logs.
