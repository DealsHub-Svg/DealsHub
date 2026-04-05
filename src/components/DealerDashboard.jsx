import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const DealerDashboard = ({ dealerInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Fitness & Gym'
  });
  const [locationData, setLocationData] = useState({
    address: dealerInfo?.address || '',
    latitude: dealerInfo?.latitude || '',
    longitude: dealerInfo?.longitude || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/dealer-products/${dealerInfo?.id}`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading products:', err);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      if (!formData.name || !formData.price) {
        setMessage({ type: 'error', text: 'Name and price are required' });
        setLoadingAction(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/add-dealer-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerInfo?.id,
          dealerName: dealerInfo?.business_name,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category,
          location: locationData.address || dealerInfo?.address,
          latitude: parseFloat(locationData.latitude) || dealerInfo?.latitude,
          longitude: parseFloat(locationData.longitude) || dealerInfo?.longitude,
          dealerPhone: dealerInfo?.phone,
          dealerEmail: dealerInfo?.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Product added successfully!' });
        setFormData({ name: '', description: '', price: '', category: 'Fitness & Gym' });
        setShowForm(false);
        await loadProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product' });
      }
    } catch (err) {
      console.error('Add product error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setLoadingAction(true);
    try {
      const response = await fetch(`${API_BASE}/api/delete-dealer-product/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Product deleted successfully!' });
        await loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete product' });
      }
    } catch (err) {
      console.error('Delete product error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setLoadingAction(true);

    try {
      if (!locationData.address || !locationData.latitude || !locationData.longitude) {
        setMessage({ type: 'error', text: 'All location fields are required' });
        setLoadingAction(false);
        return;
      }

      const lat = parseFloat(locationData.latitude);
      const lng = parseFloat(locationData.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setMessage({ type: 'error', text: 'Latitude and longitude must be valid numbers' });
        setLoadingAction(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/dealer-location-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerInfo?.id,
          address: locationData.address.trim(),
          latitude: lat,
          longitude: lng
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Location saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save location' });
      }
    } catch (err) {
      console.error('Save location error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData(prev => ({ ...prev, latitude, longitude }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocationData(prev => ({
            ...prev,
            address: data.address?.road || `${latitude}, ${longitude}`
          }));
        } catch (err) {
          console.log('Geocoding error:', err);
        }
      },
      () => {
        setMessage({ type: 'error', text: 'Failed to get location. Enable location services.' });
      }
    );
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account and all data!')) return;
    
    setLoadingAction(true);
    try {
      const response = await fetch(`${API_BASE}/api/delete-dealer-account/${dealerInfo?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        localStorage.removeItem('dealerInfo');
        onLogout();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account' });
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Sidebar Navigation */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoText}>🏪</span>
          <div>
            <div style={styles.businessTitle}>{dealerInfo?.business_name}</div>
            <div style={styles.businessSub}>Dealer Dashboard</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'products', icon: '📦', label: 'Products' },
            { id: 'location', icon: '📍', label: 'Location' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id ? styles.navItemActive : {})
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button style={styles.logoutBtn} onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {message.text && (
          <div style={{...styles.alert, ...(message.type === 'error' ? styles.alertError : styles.alertSuccess)}}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} style={styles.closeAlert}>✕</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={styles.content}>
            <h1 style={styles.heading}>Welcome Back, {dealerInfo?.business_name}! 👋</h1>
            
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{products.length}</div>
                <div style={styles.statLabel}>Total Products</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>0</div>
                <div style={styles.statLabel}>Active Orders</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>0</div>
                <div style={styles.statLabel}>Total Revenue</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>⭐ N/A</div>
                <div style={styles.statLabel}>Rating</div>
              </div>
            </div>

            <div style={styles.quickLinks}>
              <button onClick={() => setActiveTab('products')} style={styles.quickLink}>
                <span style={styles.qlIcon}>📦</span>
                <span>Add Product</span>
              </button>
              <button onClick={() => setActiveTab('location')} style={styles.quickLink}>
                <span style={styles.qlIcon}>📍</span>
                <span>Update Location</span>
              </button>
              <button onClick={() => setActiveTab('settings')} style={styles.quickLink}>
                <span style={styles.qlIcon}>⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={styles.content}>
            <div style={styles.contentHeader}>
              <h1 style={styles.heading}>📦 Manage Products</h1>
              <button 
                style={styles.primaryBtn} 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? '❌ Cancel' : '➕ Add Product'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddProduct} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select 
                    style={styles.input}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Fitness & Gym</option>
                    <option>Food & Dining</option>
                    <option>Beauty & Salon</option>
                    <option>Shopping</option>
                    <option>Entertainment</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{...styles.input, minHeight: '100px'}}
                    placeholder="Product description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <button type="submit" style={styles.submitBtn} disabled={loadingAction}>
                  {loadingAction ? '⏳ Adding...' : '✅ Add Product'}
                </button>
              </form>
            )}

            <div style={styles.productsList}>
              {loading ? (
                <div style={styles.loading}>Loading products...</div>
              ) : products.length === 0 ? (
                <div style={styles.empty}>No products added yet. Create your first product!</div>
              ) : (
                products.map(product => (
                  <div key={product.id} style={styles.productCard}>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{product.name}</h3>
                      {product.description && <p style={styles.productDesc}>{product.description}</p>}
                      <div style={styles.productMeta}>
                        <span style={styles.productPrice}>₹{parseFloat(product.price).toFixed(2)}</span>
                        <span style={styles.productCategory}>{product.category}</span>
                      </div>
                    </div>
                    <button 
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={loadingAction}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div style={styles.content}>
            <h1 style={styles.heading}>📍 Location Settings</h1>
            
            <form onSubmit={handleSaveLocation} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Address *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter your business address"
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Latitude *</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="e.g., 28.6139"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                    step="0.0001"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Longitude *</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="e.g., 77.2090"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                    step="0.0001"
                    required
                  />
                </div>
              </div>

              <div style={styles.tip}>
                💡 Get coordinates: Use "Get GPS" button below or visit google.com/maps → right-click location → copy coordinates
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button 
                  type="button" 
                  style={styles.secondaryBtn}
                  onClick={handleGetLocation}
                  disabled={loadingAction}
                >
                  📍 Get GPS Location
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={loadingAction}
                >
                  {loadingAction ? '⏳ Saving...' : '💾 Save Location'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={styles.content}>
            <h1 style={styles.heading}>⚙️ Settings</h1>

            <div style={styles.settingsBox}>
              <h2 style={styles.settingsTitle}>Business Information</h2>
              <div style={styles.settingsField}>
                <span style={styles.fieldLabel}>Business Name:</span>
                <span style={styles.fieldValue}>{dealerInfo?.business_name}</span>
              </div>
              <div style={styles.settingsField}>
                <span style={styles.fieldLabel}>Email:</span>
                <span style={styles.fieldValue}>{dealerInfo?.email}</span>
              </div>
              <div style={styles.settingsField}>
                <span style={styles.fieldLabel}>Phone:</span>
                <span style={styles.fieldValue}>{dealerInfo?.phone}</span>
              </div>
              <div style={styles.settingsField}>
                <span style={styles.fieldLabel}>Address:</span>
                <span style={styles.fieldValue}>{dealerInfo?.address || 'Not set'}</span>
              </div>
            </div>

            <div style={{...styles.settingsBox, ...styles.dangerZone}}>
              <h2 style={styles.settingsTitle}>Danger Zone</h2>
              <p style={styles.dangerText}>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button 
                style={styles.dangerBtn}
                onClick={handleDeleteAccount}
                disabled={loadingAction}
              >
                🗑️ Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input:focus, textarea:focus, select:focus { 
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#0f172a',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#1f2937'
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #1a1f3a 0%, #0f172a 100%)',
    padding: '30px 20px',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    overflowY: 'auto'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoText: {
    fontSize: '32px'
  },
  businessTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  businessSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  navIcon: {
    fontSize: '18px'
  },
  logoutBtn: {
    marginTop: 'auto',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  main: {
    flex: 1,
    overflow: 'auto',
    background: '#f8fafc'
  },
  alert: {
    padding: '16px 20px',
    margin: '20px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500'
  },
  alertError: {
    background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.1) 100%)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#dc2626'
  },
  alertSuccess: {
    background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(22,163,74,0.1) 100%)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#16a34a'
  },
  closeAlert: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  content: {
    padding: '30px'
  },
  heading: {
    fontSize: '28px',
    fontWeight: '900',
    marginBottom: '30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statBox: {
    background: 'white',
    padding: '25px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#667eea',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px'
  },
  quickLink: {
    padding: '20px',
    background: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  qlIcon: {
    fontSize: '28px'
  },
  form: {
    background: 'white',
    padding: '25px',
    borderRadius: '14px',
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease'
  },
  tip: {
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(96,165,250,0.1) 100%)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#1e40af',
    fontWeight: '500'
  },
  primaryBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
  },
  secondaryBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  productsList: {
    display: 'grid',
    gap: '15px'
  },
  productCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#0f172a'
  },
  productDesc: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px'
  },
  productMeta: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#667eea'
  },
  productCategory: {
    fontSize: '12px',
    background: 'rgba(102,126,234,0.1)',
    color: '#667eea',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600'
  },
  deleteBtn: {
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    background: 'white',
    borderRadius: '12px'
  },
  settingsBox: {
    background: 'white',
    padding: '25px',
    borderRadius: '14px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  settingsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#0f172a'
  },
  settingsField: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '15px',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center'
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#666'
  },
  fieldValue: {
    color: '#0f172a',
    fontWeight: '500'
  },
  dangerZone: {
    borderLeft: '4px solid #f43f5e'
  },
  dangerText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px'
  },
  dangerBtn: {
    width: '100%',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  }
};

export default DealerDashboard;
