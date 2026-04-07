import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API_BASE } from '../config';

// REAL Google Logo SVG
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// REAL Apple Logo SVG - Official bitten apple
const AppleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-2.94 2.45-.88 0-1.47-.59-2.75-.59-1.23 0-1.62.59-2.62.59-1.44 0-2.58-1.55-3.44-2.65-.93-1.5-1.9-3.48-1.9-5.45 0-3.26 2.12-5.25 4.1-5.25 1.09 0 2 .48 2.82.48.8 0 2.08-.62 3.47-.62 2.13 0 3.99 1.53 4.92 3.68-.19.1-1.88 1.08-1.88 3.24 0 2.52 2.04 3.41 2.16 3.52-.16.5-.62 1.69-2.04 2.71zM12 3.5c.27-1.12-.08-2.65.68-2.65 1.33 0 2.85 1.08 2.85 2.65 0 1.52-1.5 2.4-2.85 2.4-1.13 0-1.23-1.6-.68-2.4z"/>
  </svg>
);

const Auth = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState('customer'); // customer or dealer

  // Check URL params for dealer redirect - HARD FIX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const emailFromUrl = params.get('email');
    console.log('URL Params - mode:', mode, 'email:', emailFromUrl); // DEBUG
    if (mode === 'dealer') {
      console.log('✅ Setting to dealer mode'); // DEBUG
      setLoginMode('dealer');
      setIsLogin(true);
      if (emailFromUrl) {
        setLoginEmail(decodeURIComponent(emailFromUrl));
      }
    }
  }, []);
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        onLogin({
          name: userInfo.name || "Google User",
          email: userInfo.email,
          picture: userInfo.picture,
          provider: 'google',
          userType: 'customer'
        });
      } catch (err) {
        console.error(err);
        setError('Google login failed. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  });

  const handleAppleSignIn = () => {
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID || 'com.dealsapp.web';
    const redirectUri = `${window.location.origin}/auth/apple/callback`;
    const scope = 'name email';
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=form_post`;
    window.location.href = appleAuthUrl;
  };

  const handleProviderRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim()) {
      setError('Enter business name');
      return;
    }
    if (!validateEmail(regEmail)) {
      setError('Enter valid email');
      return;
    }
    if (!regPassword || regPassword.length < 10) {
      setError('Phone must be 10+ digits');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Phones do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/register-business`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          shopName: regName.trim(),
          email: regEmail.trim(),
          phone: regPassword.trim(),
          location: 'Location',
          latitude: 0,
          longitude: 0,
          city: 'City',
          description: 'Business'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setLoginEmail(regEmail);
        setLoginPassword(data.generatedPassword);
        setIsLogin(true);
        alert('✅ Registered! Password: ' + data.generatedPassword);
      } else {
        setError(data.error || 'Failed');
      }
    } catch (err) {
      setError('Backend error');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginEmail)) {
      setError('Enter valid email');
      return;
    }
    if (!loginPassword) {
      setError('Enter password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/dealer-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('dealerInfo', JSON.stringify(data));
        onLogin({ ...data, userType: 'dealer' });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Backend error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!validateEmail(regEmail)) {
      setError('Please enter a valid email');
      return;
    }
    if (!validatePassword(regPassword)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const savedUser = { name: regName, email: regEmail, password: regPassword };
      localStorage.setItem('tempUser', JSON.stringify(savedUser));
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setLoginEmail(regEmail);
      setLoginPassword('');
      setIsLogin(true);
      setLoading(false);
    }, 500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginEmail)) {
      setError('Please enter a valid email');
      return;
    }
    if (!validatePassword(loginPassword)) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem('tempUser') || '{}');
      if (savedUser.email === loginEmail && savedUser.password === loginPassword) {
        onLogin({
          name: savedUser.name,
          email: savedUser.email,
          provider: 'email',
          userType: 'customer'
        });
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleDealerLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginEmail)) {
      setError('Please enter a valid email');
      return;
    }
    if (!loginPassword) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/dealer-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      onLogin({
        ...data,
        userType: 'dealer'
      });

    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient} />
      
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🍽️</div>
          <h1 style={styles.title}>Deals Hub</h1>
          <p style={styles.subtitle}>Premium deals at your doorstep</p>
        </div>

        {/* Dealer Login Form */}
        {loginMode === 'dealer' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
            <h2 style={styles.heading}>🏪 Dealer Login</h2>

            {/* Dealer Role Selector */}
            <div style={styles.roleSelector}>
              <button
                onClick={() => {
                  setLoginMode('customer');
                  setError('');
                }}
                style={{
                  ...styles.roleBtn,
                  ...styles.roleBtnInactive
                }}
              >
                <span style={styles.roleIcon}>👤</span>
                <span style={styles.roleText}>Customer</span>
              </button>
              <button
                onClick={() => {
                  setError('');
                }}
                style={{
                  ...styles.roleBtn,
                  ...styles.roleBtnActive
                }}
              >
                <span style={styles.roleIcon}>🏪</span>
                <span style={styles.roleText}>Dealer</span>
              </button>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleDealerLogin} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your-business@email.com"
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🔐 Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    style={styles.input}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? '👁️' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? '⏳ Logging in...' : '🔓 Login to Dashboard'}
              </button>
            </form>

            <p style={styles.dealerHelpText}>
              📧 Check your email for login credentials
            </p>
          </div>
        )}

        {/* Customer Login/Register Form */}
        {loginMode === 'customer' && (
        <>
        <h2 style={styles.heading}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {/* Customer Role Selector */}
        <div style={styles.roleSelector}>
          <button
            onClick={() => {
              setUserType('customer');
              setError('');
            }}
            style={{
              ...styles.roleBtn,
              ...(userType === 'customer' ? styles.roleBtnActive : styles.roleBtnInactive)
            }}
          >
            <span style={styles.roleIcon}>👤</span>
            <span style={styles.roleText}>Customer</span>
          </button>
          <button
            onClick={() => {
              setLoginMode('dealer');
              setError('');
            }}
            style={{
              ...styles.roleBtn,
              ...styles.roleBtnInactive
            }}
          >
            <span style={styles.roleIcon}>🏪</span>
            <span style={styles.roleText}>Dealer</span>
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Customer Form - Social Logins */}
        {userType === 'customer' && (
          <>
            <div style={styles.socialButtonsContainer}>
              <button
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                style={styles.socialButton}
              >
                <GoogleLogo />
                <span>Continue with Google</span>
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                style={styles.socialButton}
              >
                <AppleLogo />
                <span>Continue with Apple</span>
              </button>
            </div>

            <div style={styles.divider}>
              <span>or continue with email</span>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister} style={styles.form}>
              {!isLogin && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={isLogin ? loginEmail : regEmail}
                  onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={isLogin ? loginPassword : regPassword}
                    onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    style={styles.input}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? '👁️' : '👁️'}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? '⏳ Processing...' : isLogin ? 'Sign In Now' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {/* Provider Form */}
        {userType === 'provider' && (
          <form onSubmit={isLogin ? handleProviderLogin : handleProviderRegister} style={styles.form}>
            {!isLogin && (
              <div style={styles.formGroup}>
                <label style={styles.label}>🏪 Business Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your business name"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Business Email</label>
              <input
                type="email"
                value={isLogin ? loginEmail : regEmail}
                onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                placeholder="business@email.com"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🔒 Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={isLogin ? loginPassword : regPassword}
                  onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  style={styles.input}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? '👁️' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : isLogin ? 'Sign In Now' : 'Register Business'}
            </button>
          </form>
        )}

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleAuthMode}
            style={styles.toggleLink}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
        </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAFBFF',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: '#000',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0 0 0',
    fontWeight: '500'
  },
  roleSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    padding: '4px',
    background: '#F5F5F7',
    borderRadius: '12px'
  },
  roleBtn: {
    flex: 1,
    border: 'none',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  roleBtnActive: {
    background: '#FFFFFF',
    color: '#7C3AED',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  roleBtnInactive: {
    background: 'transparent',
    color: '#666'
  },
  roleIcon: {
    fontSize: '16px'
  },
  roleText: {
    fontSize: '13px'
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    color: '#000',
    textAlign: 'center'
  },
  errorBox: {
    background: '#FEE2E2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  socialButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    background: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000',
    transition: 'all 0.3s ease'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    fontSize: '12px',
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    justifyContent: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000',
    letterSpacing: '0.3px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#FAFBFF',
    color: '#000',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0 4px'
  },
  submitBtn: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginTop: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
    margin: '20px 0 0 0',
    fontWeight: '500'
  },
  toggleLink: {
    background: 'none',
    border: 'none',
    color: '#7C3AED',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px'
  }
};

export default Auth;
