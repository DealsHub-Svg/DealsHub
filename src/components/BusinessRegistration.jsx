import React, { useState, useRef } from 'react';
import { API_BASE } from '../config';

const BusinessRegistration = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    phone: '',
    location: '',
    latitude: null,
    longitude: null,
    city: '',
    description: '',
    productPhoto: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        productPhoto: file
      }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          // Fetch location name from coordinates
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(r => r.json())
            .then(data => {
              const locationName = data.address?.road || data.address?.city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setFormData(prev => ({
                ...prev,
                location: locationName
              }));
            })
            .catch(() => {
              setFormData(prev => ({
                ...prev,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
            });
        },
        (error) => {
          setError('Could not get location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation not supported. Please enter location manually.');
    }
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) {
      setError('Shop name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Valid phone number is required (min 10 digits)');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Business description is required');
      return false;
    }
    if (formData.latitude === null || formData.longitude === null) {
      setError('Please click the GPS button to set your business location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Send registration without large base64 image
      console.log('Sending registration request to:', `${API_BASE}/api/register-business`);

      const response = await fetch(`${API_BASE}/api/register-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          shopName: formData.shopName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          city: formData.city,
          description: formData.description
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        setError(data.error || data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('✅ Business registered successfully! Check your email for login credentials.');
      
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please check your connection and try again. Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        <div style={styles.header}>
          <h2 style={styles.title}>Register Your Business</h2>
          <p style={styles.subtitle}>Start selling to Local Deals Hub customers</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Shop Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Shop/Business Name *</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleInputChange}
              placeholder="e.g., Fresh Bakery Store"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="business@email.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+94771234567"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* City */}
          <div style={styles.formGroup}>
            <label style={styles.label}>City *</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              style={styles.input}
              disabled={loading}
            >
              <option value="">Select City</option>
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Matara">Matara</option>
              <option value="Negombo">Negombo</option>
              <option value="Ratnapura">Ratnapura</option>
              <option value="Kurunegala">Kurunegala</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Address *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, Downtown"
                style={{...styles.input, minHeight: '80px', resize: 'none', flex: 1}}
                disabled={loading}
              />
              <button
                type="button"
                onClick={getLocation}
                style={{
                  ...styles.locationBtn,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
                title="Get current location"
              >
                📍
              </button>
            </div>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Click 📍 to auto-detect location using GPS
            </small>
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your business, products, and services..."
              style={{...styles.input, minHeight: '100px', resize: 'none'}}
              disabled={loading}
            />
          </div>

          {/* Photo Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Shop Photo/Logo <span style={{color: '#999', fontSize: '12px'}}>(Optional)</span></label>
            <div
              style={styles.photoUploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.productPhoto ? (
                <div style={styles.photoPreview}>
                  <span>📷 {formData.productPhoto.name}</span>
                  <br />
                  <small>{(formData.productPhoto.size / 1024).toFixed(2)} KB</small>
                </div>
              ) : (
                <div>
                  <span style={styles.uploadIcon}>📸</span>
                  <p style={styles.uploadText}>Click to upload shop photo (optional)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Registering...' : '✅ Complete Registration'}
          </button>

          <p style={styles.infoText}>
            📧 After registration, you'll receive login credentials via email
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#000'
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
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  successBox: {
    background: '#DCFCE7',
    border: '1px solid #BBF7D0',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
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
  photoUploadArea: {
    border: '2px dashed #7C3AED',
    borderRadius: '12px',
    padding: '32px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: '#F5F3FF'
  },
  photoPreview: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  uploadIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '8px'
  },
  uploadText: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  submitBtn: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    marginTop: '12px',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
  },
  infoText: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    margin: '12px 0 0 0',
    fontWeight: '500'
  },
  locationBtn: {
    padding: '8px 12px',
    border: '2px solid #7C3AED',
    borderRadius: '10px',
    background: '#F5F3FF',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default BusinessRegistration;
