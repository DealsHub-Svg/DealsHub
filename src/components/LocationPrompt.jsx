import React, { useState, useEffect } from 'react';

const LocationPrompt = ({ onLocationGranted }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('');

  useEffect(() => {
    // Check current permission status on mount
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setPermissionStatus(result.state); // 'granted', 'denied', 'prompt'
        })
        .catch(() => setPermissionStatus('unknown'));
    }
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please use a modern browser.');
      setLoading(false);
      return;
    }

    // Request high accuracy location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`Location Acquired: ${lat}, ${lng} (±${Math.round(accuracy)}m)`);
        
        // Pass coordinates back to App
        onLocationGranted({ 
          lat, 
          lng,
          accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        setLoading(false);
        let message = '';

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access was denied. Please enable location services in your device settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your device cannot determine your location. Try moving to an open area or enabling High Accuracy mode.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again with better connectivity.";
        } else {
          message = `Error: ${error.message}`;
        }

        setErrorMsg(message);
      },
      { 
        timeout: 15000, 
        enableHighAccuracy: true,
        maximumAge: 0 
      }
    );
  };

  const useFallbackLocation = () => {
    console.log('Using default location (Colombo, Sri Lanka)');
    onLocationGranted({ 
      lat: 6.9271, 
      lng: 79.8612,
      isDefault: true,
      timestamp: new Date().toISOString()
    });
  };

  const skipLocation = () => {
    console.log('Location skipped by user');
    onLocationGranted({ 
      lat: 6.9271, 
      lng: 79.8612,
      skipped: true,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="auth-screen" style={{background: 'var(--bg)'}}>
      <div className="auth-card" style={{maxWidth: '480px', padding: '40px 32px'}}>
        {/* Icon */}
        <div style={{
          fontSize: '72px',
          marginBottom: '28px',
          textAlign: 'center',
          animation: 'float 3s ease-in-out infinite'
        }}>
          📍
        </div>
        
        {/* Heading */}
        <div style={{textAlign: 'center', marginBottom: '24px'}}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '8px',
            lineHeight: '1.2'
          }}>
            Find Deals Near You
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            margin: '0'
          }}>
            We use your real location to find the best halal food, gyms, and services right in your neighborhood. We never sell your data.
          </p>
        </div>

        {/* Permission Status Badge */}
        {permissionStatus && permissionStatus !== 'unknown' && (
          <div style={{
            background: permissionStatus === 'granted' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${permissionStatus === 'granted' ? '#10B981' : '#F59E0B'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: permissionStatus === 'granted' ? '#10B981' : '#F59E0B',
            textAlign: 'center'
          }}>
            {permissionStatus === 'granted' ? 'Location access granted' : 
             permissionStatus === 'denied' ? 'Location access denied' : 
             'Location permission not set'}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderLeft: '4px solid #EF4444',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#EF4444',
            fontWeight: '500',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Info Points */}
        <div style={{
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)'}}>
            <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
              <span>🗺️</span>
              <span>Real-time location tracking for nearby services</span>
            </div>
            <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
              <span>🔐</span>
              <span>Your location data is encrypted and never shared</span>
            </div>
            <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
              <span>📱</span>
              <span>Works on mobile, tablet, and desktop</span>
            </div>
          </div>
        </div>

        {/* Main Button */}
        <button 
          className="btn btn-primary btn-lg w-full"
          onClick={requestLocation}
          disabled={loading}
          style={{
            marginBottom: '12px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <span style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></span>
              Finding your location...
            </span>
          ) : (
            '📍 Turn On Location'
          )}
        </button>

        {/* Fallback Option */}
        {errorMsg && (
          <button 
            className="btn btn-outline w-full"
            onClick={useFallbackLocation}
            disabled={loading}
            style={{
              marginBottom: '12px',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            📍 Use Default Location (Colombo)
          </button>
        )}

        {/* Skip Button */}
        <button 
          className="btn btn-outline w-full"
          onClick={skipLocation}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          ⏭️ Skip For Now
        </button>

        {/* Help Text */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Pro Tip: Enable location in your device settings for the best experience finding nearby deals
        </div>
      </div>
    </div>
  );
};

export default LocationPrompt;
