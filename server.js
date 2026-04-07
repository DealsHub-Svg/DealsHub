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
      'https://www.dealshub-one.vercel.app'
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

// Initialize Firebase Admin - Load credentials from file or environment variables
let serviceAccount;
try {
  // First try: Check if JSON file exists (for local development)
  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || 
    './dealshub-701a3-firebase-adminsdk-fbsvc-5adc4d9d93.json';
  
  if (fs.existsSync(credentialsPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('✅ Firebase credentials loaded from JSON file (local development)');
  } else {
    // Second try: Build from environment variables (for Vercel)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || "",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dealshub-701a3.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      };
      console.log('✅ Firebase credentials loaded from environment variables (Vercel deployment)');
    } else {
      throw new Error('No Firebase credentials found in file or environment variables');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('✅ Firebase Admin SDK initialized successfully!');
  } else {
    console.error('❌ No Firebase credentials available');
  }
} catch (error) {
  console.error('⚠️  Firebase initialization error:', error.message);
  console.error('Stack:', error.stack);
}

let db;
try {
  db = admin.firestore();
  console.log('✅ Firestore database initialized');
} catch (error) {
  console.error('❌ Firestore initialization failed:', error.message);
}

// Email Configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'dealshubmn@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'ftsarxwtxrlrrgtw'
  }
};

const emailTransporter = nodemailer.createTransport(emailConfig);

// Flag to track if real email is working
let emailServiceWorking = false;

// Verify email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.log("⚠️  Email service error - using FALLBACK MODE:");
    console.error(error.message);
    console.error('Email config user:', emailConfig.auth.user);
    console.log('📝 All emails will be logged to console and file');
    emailServiceWorking = false;
  } else {
    console.log("✅ Email service is ready!");
    console.log('Email configured as:', emailConfig.auth.user);
    emailServiceWorking = true;
  }
});

// Fallback email logger function
const logEmailFallback = (mailOptions) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    status: 'LOGGED_FALLBACK'
  };
  
  const logPath = path.join(process.cwd(), 'email-logs.json');
  try {
    let logs = [];
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(data);
    }
    logs.push(logEntry);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    console.log(`📧 Email logged to file: ${logEntry.to}`);
  } catch (err) {
    console.error('Error logging email:', err.message);
  }
  
  return logEntry;
};

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
  const status = {
    status: 'running',
    firebase: !!db,
    message: db ? '✅ Dealshub Backend is running with Firebase!' : '⚠️ Firebase not initialized'
  };
  res.json(status);
});

// Health check for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firebase_initialized: !!db,
    node_env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    email_configured: !!emailConfig.auth.user,
    email_user: emailConfig.auth.user,
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  const { recipient_email } = req.body;
  
  if (!recipient_email) {
    return res.status(400).json({ error: 'recipient_email required' });
  }
  
  const testMail = {
    from: emailConfig.auth.user,
    to: recipient_email,
    subject: '🧪 Dealshub Email Test',
    html: `<h1>Email Service Test</h1><p>If you're reading this, email is working!</p><p>Sent at ${new Date().toISOString()}</p>`
  };
  
  if (emailServiceWorking) {
    emailTransporter.sendMail(testMail, (error, info) => {
      if (error) {
        console.error('❌ Test email failed:', error);
        // Fallback to logging
        logEmailFallback(testMail);
        res.json({ message: 'Email logged (SMTP failed)', mode: 'fallback' });
      } else {
        console.log('✅ Test email sent:', info.response);
        res.json({ message: 'Test email sent!', info: info.response, mode: 'live' });
      }
    });
  } else {
    logEmailFallback(testMail);
    res.json({ message: 'Email logged to file (fallback mode)', mode: 'fallback', file: 'email-logs.json' });
  }
});

// Test deal creation email endpoint
app.post('/api/test-deal-email', async (req, res) => {
  const { dealEmail, dealName, dealPrice, dealCategory } = req.body;
  
  if (!dealEmail) {
    return res.status(400).json({ error: 'dealEmail required' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'dealshubmn@gmail.com',
    to: dealEmail,
    subject: '🎉 Your Deal Has Been Created Successfully!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        </style>
      </head>
      <body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: white; border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h1 style="font-size: 32px; font-weight: 800; color: #000; margin-bottom: 8px;">Deal Created!</h1>
            <p style="font-size: 16px; color: #666; margin-bottom: 0;">Your product is now live</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 40px 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 24px; color: #333;">
              Great news! Your deal <strong>"${dealName || 'New Deal'}"</strong> has been successfully created and is now visible to customers on Dealshub.
            </p>

            <!-- Deal Details Box -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px; border-radius: 12px; margin: 32px 0; color: white;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; opacity: 0.9;">Deal Summary</p>
              
              <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">DEAL NAME</p>
                <p style="font-size: 18px; font-weight: 600; word-break: break-word;">${dealName || 'New Deal'}</p>
              </div>

              <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">PRICE</p>
                <p style="font-size: 20px; font-weight: 700;">$${dealPrice || '0.00'}</p>
              </div>

              <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; border-left: 4px solid rgba(255,255,255,0.5);">
                <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">CATEGORY</p>
                <p style="font-size: 16px; font-weight: 600;">${dealCategory || 'General'}</p>
              </div>
            </div>

            <!-- CTA Button -->
            <center style="margin: 32px 0;">
              <a href="https://dealshub-one.vercel.app?mode=dealer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; transition: transform 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                📊 View Your Deal
              </a>
            </center>

            <!-- Features -->
            <div style="background: #f8f9fb; padding: 24px; border-radius: 12px; margin: 32px 0;">
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #000;">✨ What's Next</h3>
              <ul style="list-style: none; margin: 0;">
                <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Monitor deal performance in real-time</li>
                <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Edit or update your deal anytime</li>
                <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Track customer interest and engagement</li>
                <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Reach thousands of local customers</li>
                <li style="font-size: 14px; color: #555;">✓ Share your deal on social media</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: white; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #999; margin-bottom: 16px;">
              💡 Pro Tip: Update your deal regularly to attract more customers!
            </p>
            <p style="font-size: 12px; color: #bbb; margin: 0;">
              © 2026 Dealshub. All rights reserved.<br>
              <a href="https://dealshub-one.vercel.app" style="color: #667eea; text-decoration: none;">dealshub-one.vercel.app</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Send email with fallback
  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Deal confirmation email failed:', error.message);
      logEmailFallback(mailOptions);
      res.json({ message: 'Deal confirmation email logged', mode: 'fallback', file: 'email-logs.json' });
    } else {
      console.log('✅ Deal confirmation email sent to:', dealEmail);
      res.json({ message: 'Deal confirmation email sent!', mode: 'live' });
    }
  });
});

// Get logged emails (for debugging/verification)
app.get('/api/get-logged-emails', async (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'email-logs.json');
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      const emails = JSON.parse(data);
      res.json({ 
        total: emails.length,
        emails,
        message: 'These are emails that could not be sent via SMTP and were logged locally'
      });
    } else {
      res.json({ total: 0, emails: [], message: 'No emails logged yet' });
    }
  } catch (err) {
    console.error('Error reading email logs:', err);
    res.status(500).json({ error: 'Failed to read email logs' });
  }
});

// Get dealer credentials by email (for credential retrieval/verification)
app.post('/api/get-dealer-credentials', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Query for dealer by provider_email
    const snapshot = await db.collection('service_providers')
      .where('provider_email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No dealer account found with this email' });
    }

    const dealerDoc = snapshot.docs[0];
    const dealerData = dealerDoc.data();

    res.json({
      provider_id: dealerDoc.id,
      email: dealerData.provider_email,
      business_name: dealerData.business_name,
      phone: dealerData.phone,
      address: dealerData.address,
      city: dealerData.city,
      is_active: dealerData.is_active,
      verified: dealerData.verified,
      created_at: dealerData.created_at,
      note: '✅ Account found! Use your email and the temporary password sent via email to login to the Dealer Dashboard.'
    });
  } catch (error) {
    console.error('Error retrieving dealer credentials:', error);
    res.status(500).json({ error: 'Failed to retrieve credentials' });
  }
});

// Verify dealer login (authenticate)
app.post('/api/dealer-login-verify', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Query for dealer by email
    const snapshot = await db.collection('service_providers')
      .where('provider_email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const dealerDoc = snapshot.docs[0];
    const dealerData = dealerDoc.data();
    
    // Verify password hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (dealerData.provider_password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Login successful
    res.json({
      success: true,
      provider_id: dealerDoc.id,
      business_name: dealerData.business_name,
      email: dealerData.provider_email,
      phone: dealerData.phone,
      address: dealerData.address,
      latitude: dealerData.latitude,
      longitude: dealerData.longitude,
      city: dealerData.city,
      verified: dealerData.verified,
      message: '✅ Login successful! Welcome to your Dealer Dashboard.'
    });
  } catch (error) {
    console.error('Dealer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Resend verification email (get credentials email link)
app.post('/api/resend-verification-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Find dealer
    const snapshot = await db.collection('service_providers')
      .where('provider_email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No dealer account found' });
    }

    const dealerDoc = snapshot.docs[0];
    const dealerData = dealerDoc.data();

    // Create verification email
    const verificationMailOptions = {
      from: process.env.EMAIL_USER || 'dealshubmn@gmail.com',
      to: email,
      subject: '🔑 Your Dealshub Credentials - Verification Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          </style>
        </head>
        <body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background: white; border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 48px; margin-bottom: 16px;">🔑</div>
              <h1 style="font-size: 32px; font-weight: 800; color: #000; margin-bottom: 8px;">Your Login Credentials</h1>
              <p style="font-size: 16px; color: #666; margin-bottom: 0;">${dealerData.business_name}</p>
            </div>

            <!-- Main Content -->
            <div style="background: white; padding: 40px 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 24px; color: #333;">
                Here are your login credentials for the Dealshub Dealer Dashboard. Keep them safe!
              </p>

              <!-- Credentials Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px; border-radius: 12px; margin: 32px 0; color: white;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; opacity: 0.9;">Your Credentials</p>
                
                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                  <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">EMAIL (Username)</p>
                  <p style="font-size: 18px; font-weight: 600; word-break: break-all; font-family: 'Courier New', monospace;">${email}</p>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; border-left: 4px solid rgba(255,255,255,0.5);">
                  <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px; text-transform: uppercase;">Temporary Password</p>
                  <p style="font-size: 22px; font-weight: 700; letter-spacing: 3px; font-family: 'Courier New', monospace;">${dealerData.temp_password_display || '[Retrieved from system]'}</p>
                  <p style="font-size: 11px; opacity: 0.7; margin-top: 8px;">⚠️ Change this password after first login</p>
                </div>
              </div>

              <!-- How to Login -->
              <div style="background: #f8f9fb; padding: 24px; border-radius: 12px; margin: 32px 0;">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #000;">📱 How to Login</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 12px; font-size: 14px; color: #555;">Go to <strong>Dealer Dashboard</strong> on Dealshub</li>
                  <li style="margin-bottom: 12px; font-size: 14px; color: #555;">Select <strong>"Login as Dealer"</strong></li>
                  <li style="margin-bottom: 12px; font-size: 14px; color: #555;">Enter your email: <code style="background: white; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${email}</code></li>
                  <li style="margin-bottom: 12px; font-size: 14px; color: #555;">Enter temporary password</li>
                  <li style="font-size: 14px; color: #555;">You'll be prompted to change your password on first login</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <center style="margin: 32px 0;">
                <a href="https://dealshub-one.vercel.app?mode=dealer&email=${email}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; transition: transform 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🔐 Login to Dealer Dashboard
                </a>
              </center>

              <!-- Security Notice -->
              <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="font-size: 13px; color: #856404; margin: 0;">
                  <strong>⚠️ Security Notice:</strong> Never share your password with anyone. Dealshub support will never ask for your password.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: white; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 13px; color: #999; margin-bottom: 16px;">
                💡 Tip: Save this email for future reference
              </p>
              <p style="font-size: 12px; color: #bbb; margin: 0;">
                © 2026 Dealshub. All rights reserved.<br>
                <a href="https://dealshub-one.vercel.app" style="color: #667eea; text-decoration: none;">dealshub-one.vercel.app</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email with fallback
    emailTransporter.sendMail(verificationMailOptions, (error, info) => {
      if (error) {
        console.error('❌ Resend email failed:', error.message);
        logEmailFallback(verificationMailOptions);
        res.json({ 
          success: true,
          message: '✅ Verification email logged. Your credentials have been saved.',
          mode: 'fallback',
          email: email,
          note: 'Email logged locally. Check email or use the credentials below.'
        });
      } else {
        console.log('✅ Resend email sent to:', email);
        res.json({ 
          success: true,
          message: '✅ Verification email sent successfully!',
          mode: 'live',
          email: email
        });
      }
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

// Get specific user's logged emails
app.get('/api/get-user-emails/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const logPath = path.join(process.cwd(), 'email-logs.json');
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      const allEmails = JSON.parse(data);
      const userEmails = allEmails.filter(e => e.to === email);
      res.json({ 
        email,
        total: userEmails.length,
        emails: userEmails
      });
    } else {
      res.json({ email, total: 0, emails: [] });
    }
  } catch (err) {
    console.error('Error reading email logs:', err);
    res.status(500).json({ error: 'Failed to read email logs' });
  }
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
    if (!db) {
      console.error('❌ Database not initialized');
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
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
// Register Business (for dealers/service providers)
app.post('/api/register-business', async (req, res) => {
  const { 
    shopName,
    email, 
    phone, 
    location, 
    latitude, 
    longitude, 
    city,
    description,
    photoBase64
  } = req.body;

  try {
    // Check if database is available
    if (!db) {
      console.error('❌ Database not initialized');
      return res.status(500).json({ error: 'Database connection failed. Please try again later.' });
    }

    // Validate required fields
    if (!shopName || !email || !phone || !location || !city || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log(`📝 Processing registration for: ${email}`);

    // Generate temporary password
    const temp_password = Math.random().toString(36).slice(-8);
    const password_hash = crypto.createHash('sha256').update(temp_password).digest('hex');

    // Save to Firestore
    const docRef = await db.collection('service_providers').add({
      business_name: shopName,
      phone,
      provider_email: email,
      provider_password_hash: password_hash,
      temp_password: temp_password,  // Store password for retrieval
      temp_password_display: temp_password,  // Display version
      latitude: latitude || null,
      longitude: longitude || null,
      address: location,
      city,
      description,
      is_active: true,
      rating: 0,
      created_at: new Date(),
      verified: false
    });

    console.log(`✅ Business registered: ${email} (ID: ${docRef.id})`);

    // Send verification email with credentials
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dealshubmn@gmail.com',
      to: email,
      subject: '🎉 Welcome to Dealshub! Your Business Account is Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          </style>
        </head>
        <body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background: white; border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="font-size: 32px; font-weight: 800; color: #000; margin-bottom: 8px;">Welcome to Dealshub!</h1>
              <p style="font-size: 16px; color: #666; margin-bottom: 0;">${shopName}</p>
            </div>

            <!-- Main Content -->
            <div style="background: white; padding: 40px 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 24px; color: #333;">
                Your business account has been successfully created! 🚀 You're now ready to start creating deals and reaching thousands of customers.
              </p>

              <!-- Credentials Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px; border-radius: 12px; margin: 32px 0; color: white;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; opacity: 0.9;">Your Login Credentials</p>
                
                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                  <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">EMAIL</p>
                  <p style="font-size: 18px; font-weight: 600; word-break: break-all;">${email}</p>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; border-left: 4px solid rgba(255,255,255,0.5);">
                  <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">TEMPORARY PASSWORD</p>
                  <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">${temp_password}</p>
                </div>
              </div>

              <!-- CTA Button -->
              <center style="margin: 32px 0;">
                <a href="https://dealshub-one.vercel.app?mode=dealer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; transition: transform 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🔑 Login to Your Dealer's Dashboard
                </a>
              </center>

              <!-- Features -->
              <div style="background: #f8f9fb; padding: 24px; border-radius: 12px; margin: 32px 0;">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #000;">✨ Key Features</h3>
                <ul style="list-style: none; margin: 0;">
                  <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Create unlimited deals for your business</li>
                  <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Real-time analytics and performance tracking</li>
                  <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Reach thousands of local customers instantly</li>
                  <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Manage location and inventory easily</li>
                  <li style="font-size: 14px; color: #555;">✓ 24/7 customer support</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: white; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 13px; color: #999; margin-bottom: 16px;">
                💡 Pro Tip: Add a clear profile photo and detailed description to get more customer engagement!
              </p>
              <p style="font-size: 12px; color: #bbb; margin: 0;">
                © 2026 Dealshub. All rights reserved.<br>
                <a href="https://dealshub-one.vercel.app" style="color: #667eea; text-decoration: none;">dealshub-one.vercel.app</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email and wait for delivery with timeout
    const sendEmailPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Email send timeout'));
      }, 10000);

      emailTransporter.sendMail(mailOptions, (error, info) => {
        clearTimeout(timeout);
        if (error) {
          console.error('❌ Email sending failed for:', email);
          console.error('Error details:', error.message);
          console.error('Error code:', error.code);
          // Log to fallback instead of rejecting
          logEmailFallback(mailOptions);
          console.log('📝 Email logged to fallback system');
          resolve({ fallback: true, logged: true });
        } else {
          console.log('✅ Email sent successfully to:', email);
          console.log('Email sent at:', new Date().toISOString());
          console.log('SMTP Response:', info.response);
          resolve(info);
        }
      });
    });

    // Try to send email but don't block response
    try {
      await sendEmailPromise;
    } catch (err) {
      console.error('⚠️  Email delivery warning:', err.message);
      // Fallback: log the email
      logEmailFallback(mailOptions);
      console.log('📝 Email logged to fallback (catch handler)');
    }

    // Always return success response immediately
    res.status(201).json({ 
      message: 'Business registered successfully! Check your email for login credentials.',
      provider_id: docRef.id,
      email,
      temp_password,
      note: 'If you don\'t see the email in 5 minutes, check your Spam folder. Your temporary password: ' + temp_password
    });
  } catch (error) {
    console.error('❌ Error registering business:', error.message);
    console.error('Stack:', error.stack);
    
    // Don't expose internal error details to client
    let userMessage = 'Registration failed. Please try again.';
    if (error.message.includes('permission')) {
      userMessage = 'Database permission error. Please contact support.';
    } else if (error.message.includes('credentials')) {
      userMessage = 'Configuration error. Please contact support.';
    }
    
    res.status(500).json({ error: userMessage });
  }
});

// Legacy endpoint (keep for compatibility)
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
      temp_password: temp_password,
      temp_password_display: temp_password,
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

// Dealer login (alias for provider login)
app.post('/api/dealer-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`🔍 Dealer login attempt: ${email}`);
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');
    console.log(`🔐 Password hash: ${password_hash.substring(0, 10)}...`);
    
    // First, check if email exists
    const emailSnapshot = await db.collection('service_providers')
      .where('provider_email', '==', email)
      .get();
    
    console.log(`📧 Email found: ${!emailSnapshot.empty}`);
    
    if (emailSnapshot.empty) {
      console.log(`❌ No dealer found with email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const dealer = emailSnapshot.docs[0].data();
    console.log(`📝 Dealer found: ${dealer.business_name}, hash match: ${dealer.provider_password_hash === password_hash}`);
    
    if (dealer.provider_password_hash !== password_hash) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const providerId = emailSnapshot.docs[0].id;
    
    console.log(`✅ Dealer logged in successfully: ${email} (${dealer.business_name})`);

    res.status(200).json({
      id: providerId,
      provider_id: providerId,
      business_name: dealer.business_name,
      email: dealer.provider_email,
      address: dealer.address,
      city: dealer.city,
      latitude: dealer.latitude,
      longitude: dealer.longitude,
      provider_email: dealer.provider_email,
      phone: dealer.phone,
      description: dealer.description
    });
  } catch (error) {
    console.error('❌ Error logging in dealer:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
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

// ===== DEALER ENDPOINTS =====

// Add dealer product (Create New Deal)
app.post('/api/add-dealer-product', async (req, res) => {
  const { 
    dealerId, 
    dealerName,
    name, 
    description, 
    price, 
    category,
    location,
    latitude,
    longitude,
    dealerPhone,
    dealerEmail
  } = req.body;

  try {
    // Validate required fields
    if (!dealerId || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields: dealerId, name, price' });
    }

    // Check if dealer exists
    const dealerDoc = await db.collection('service_providers').doc(dealerId).get();
    if (!dealerDoc.exists) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Add product to Firestore
    const docRef = await db.collection('products').add({
      service_provider_id: dealerId,
      dealer_name: dealerName,
      name,
      description,
      category,
      price: parseFloat(price),
      location,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      dealer_phone: dealerPhone,
      dealer_email: dealerEmail,
      is_active: true,
      rating: 0,
      reviews_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log(`✅ Deal created by ${dealerName}: ${name}`);

    // Send deal creation confirmation email
    if (dealerEmail) {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'dealshubmn@gmail.com',
        to: dealerEmail,
        subject: '🎉 Your Deal Has Been Created Successfully!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            </style>
          </head>
          <body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <div style="background: white; border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h1 style="font-size: 32px; font-weight: 800; color: #000; margin-bottom: 8px;">Deal Created!</h1>
                <p style="font-size: 16px; color: #666; margin-bottom: 0;">Your product is now live</p>
              </div>

              <!-- Main Content -->
              <div style="background: white; padding: 40px 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; margin-bottom: 24px; color: #333;">
                  Great news! Your deal <strong>"${name}"</strong> has been successfully created and is now visible to customers on Dealshub.
                </p>

                <!-- Deal Details Box -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px; border-radius: 12px; margin: 32px 0; color: white;">
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; opacity: 0.9;">Deal Summary</p>
                  
                  <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                    <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">DEAL NAME</p>
                    <p style="font-size: 18px; font-weight: 600; word-break: break-word;">${name}</p>
                  </div>

                  <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid rgba(255,255,255,0.5);">
                    <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">PRICE</p>
                    <p style="font-size: 20px; font-weight: 700;">$${price}</p>
                  </div>

                  <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; border-left: 4px solid rgba(255,255,255,0.5);">
                    <p style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">CATEGORY</p>
                    <p style="font-size: 16px; font-weight: 600;">${category}</p>
                  </div>
                </div>

                <!-- CTA Button -->
                <center style="margin: 32px 0;">
                  <a href="https://dealshub-one.vercel.app?mode=dealer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; transition: transform 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    📊 View Your Deal
                  </a>
                </center>

                <!-- Features -->
                <div style="background: #f8f9fb; padding: 24px; border-radius: 12px; margin: 32px 0;">
                  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #000;">✨ What's Next</h3>
                  <ul style="list-style: none; margin: 0;">
                    <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Monitor deal performance in real-time</li>
                    <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Edit or update your deal anytime</li>
                    <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Track customer interest and engagement</li>
                    <li style="margin-bottom: 10px; font-size: 14px; color: #555;">✓ Reach thousands of local customers</li>
                    <li style="font-size: 14px; color: #555;">✓ Share your deal on social media</li>
                  </ul>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 13px; color: #999; margin-bottom: 16px;">
                  💡 Pro Tip: Update your deal regularly to attract more customers!
                </p>
                <p style="font-size: 12px; color: #bbb; margin: 0;">
                  © 2026 Dealshub. All rights reserved.<br>
                  <a href="https://dealshub-one.vercel.app" style="color: #667eea; text-decoration: none;">dealshub-one.vercel.app</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      // Send email with fallback
      emailTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Deal confirmation email failed:', error.message);
          // Log to fallback instead of failing
          logEmailFallback(mailOptions);
        } else {
          console.log('✅ Deal confirmation email sent to:', dealerEmail);
        }
      });
    }

    res.status(201).json({ 
      message: 'Deal created successfully!',
      product_id: docRef.id
    });
  } catch (error) {
    console.error('❌ Error creating dealer product:', error);
    res.status(500).json({ error: 'Failed to create deal. Please try again.' });
  }
});

// Get dealer products (Load deals)
app.get('/api/dealer-products/:dealer_id', async (req, res) => {
  const { dealer_id } = req.params;

  try {
    const snapshot = await db.collection('products')
      .where('service_provider_id', '==', dealer_id)
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
    console.error('❌ Error fetching dealer products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Delete dealer product
app.delete('/api/delete-dealer-product/:product_id', async (req, res) => {
  const { product_id } = req.params;

  try {
    const productDoc = await db.collection('products').doc(product_id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete the product
    await db.collection('products').doc(product_id).delete();

    console.log(`✅ Product deleted: ${product_id}`);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Update dealer location
app.post('/api/dealer-location-update', async (req, res) => {
  const { dealerId, address, latitude, longitude } = req.body;

  try {
    // Validate required fields
    if (!dealerId || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    // Check if dealer exists
    const dealerDoc = await db.collection('service_providers').doc(dealerId).get();
    if (!dealerDoc.exists) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Update dealer location
    await db.collection('service_providers').doc(dealerId).update({
      address,
      latitude: lat,
      longitude: lng,
      updated_at: new Date()
    });

    console.log(`✅ Location updated for dealer ${dealerId}`);

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete dealer account
app.delete('/api/delete-dealer-account/:dealerId', async (req, res) => {
  const { dealerId } = req.params;

  try {
    // Check if dealer exists
    const dealerDoc = await db.collection('service_providers').doc(dealerId).get();
    if (!dealerDoc.exists) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Get all products of this dealer
    const productsSnapshot = await db.collection('products')
      .where('service_provider_id', '==', dealerId)
      .get();

    // Delete all products
    const batch = db.batch();
    productsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the dealer account
    batch.delete(db.collection('service_providers').doc(dealerId));

    await batch.commit();

    console.log(`✅ Dealer account deleted: ${dealerId}`);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting dealer account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
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
