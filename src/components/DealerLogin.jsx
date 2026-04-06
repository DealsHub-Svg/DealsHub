import React, { useState } from 'react';
import { API_BASE } from '../config';

const DealerLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('customer'); // customer or dealer

  const handleDealerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/dealer-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Success - pass dealer info back
      onLoginSuccess({
        ...data,
        userType: 'dealer'
      });

    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  if (loginMode === 'dealer') {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundGradient} />
        
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>🏪</div>
            <h1 style={styles.title}>Dealer Login</h1>
            <p style={styles.subtitle}>Access your business dashboard</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <small style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>
                💡 Password generated from your phone number
              </small>
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

          <div style={styles.divider}>
            <span>or</span>
          </div>

          <button
            onClick={() => {
              setLoginMode('customer');
              setError('');
            }}
            style={styles.switchBtn}
          >
            👤 Customer Login
          </button>

          <p style={styles.helpText}>
            📧 Received credentials via email after registration
          </p>
        </div>
      </div>
    );
  }

  // Customer login section (return to main auth)
  return null;
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
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    color: '#000',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    margin: '8px 0 0 0',
    fontWeight: '500'
  },
  errorBox: {
    background: '#FEE2E2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000'
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    background: '#FAFBFF',
    color: '#000',
    outline: 'none',
    transition: 'all 0.2s',
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
    marginTop: '8px',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
    cursor: 'pointer'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    fontSize: '12px',
    color: '#999',
    fontWeight: '500'
  },
  switchBtn: {
    padding: '12px 20px',
    border: '1px solid #E5E7EB',
    background: '#FAFBFF',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#000'
  },
  helpText: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: '16px 0 0 0'
  }
};

export default DealerLogin;
