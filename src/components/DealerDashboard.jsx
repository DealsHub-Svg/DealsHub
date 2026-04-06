import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const DealerDashboard = ({ dealerInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasError, setHasError] = useState(false);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('DealerDashboard mounted with dealerInfo:', dealerInfo);
  }, [dealerInfo]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalDeals: 0,
    totalRevenue: 0,
    avgRating: 0,
    activeDeals: 0,
    totalClicks: 0
  });

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

  const categories = [
    'Fitness & Gym',
    'Food & Dining',
    'Beauty & Salon',
    'Shopping',
    'Entertainment',
    'Health & Wellness',
    'Travel & Tours',
    'Education'
  ];

  useEffect(() => {
    loadProducts();
    calculateStats();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/dealer-products/${dealerInfo?.id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading products:', err);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      totalViews: Math.floor(Math.random() * 10000),
      totalDeals: 0,
      totalRevenue: 0,
      avgRating: 4.5,
      activeDeals: 0,
      totalClicks: Math.floor(Math.random() * 5000)
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoadingAction(true);

    try {
      if (!formData.name || !formData.price) {
        setMessage({ type: 'error', text: 'Product name and price are required' });
        setLoadingAction(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/add-dealer-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
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
        setMessage({ type: 'success', text: '✅ Deal created successfully!' });
        setFormData({ name: '', description: '', price: '', category: 'Fitness & Gym' });
        setShowForm(false);
        await loadProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create deal' });
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this deal permanently?')) return;

    setLoadingAction(true);
    try {
      const response = await fetch(`${API_BASE}/api/delete-dealer-product/${productId}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Deal deleted!' });
        await loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete deal' });
      }
    } catch (err) {
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

      const response = await fetch(`${API_BASE}/api/dealer-location-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          dealerId: dealerInfo?.id,
          address: locationData.address.trim(),
          latitude: parseFloat(locationData.latitude),
          longitude: parseFloat(locationData.longitude)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Location updated!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGetLocation = () => {
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
            address: data.address?.road || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        } catch (err) {
          console.log('Geocoding error:', err);
        }
      },
      () => {
        setMessage({ type: 'error', text: 'Failed to get location' });
      }
    );
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ Permanently delete your account and ALL deals?')) return;

    setLoadingAction(true);
    try {
      const response = await fetch(`${API_BASE}/api/delete-dealer-account/${dealerInfo?.id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        localStorage.removeItem('dealerInfo');
        onLogout();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoadingAction(false);
    }
  };

  if (!dealerInfo) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999', width: '100%' }}>
          <h2>Loading Dealer Information...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🚀</div>
          <div>
            <div style={styles.businessName}>{dealerInfo?.business_name || 'Business'}</div>
            <div style={styles.businessRole}>Premium Dealer</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard', desc: 'Overview' },
            { id: 'deals', icon: '🎯', label: 'My Deals', desc: 'Manage deals' },
            { id: 'analytics', icon: '📈', label: 'Analytics', desc: 'Performance' },
            { id: 'location', icon: '📍', label: 'Location', desc: 'Business info' },
            { id: 'settings', icon: '⚙️', label: 'Settings', desc: 'Account' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <div style={styles.navText}>
                <div style={styles.navLabel}>{item.label}</div>
                <div style={styles.navDesc}>{item.desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <button onClick={onLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {message.text && (
          <div style={{ ...styles.alert, ...(message.type === 'error' ? styles.alertError : styles.alertSuccess) }}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} style={styles.closeAlert}>✕</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={styles.content}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.pageTitle}>Welcome back, {dealerInfo?.business_name}! 👋</h1>
                <p style={styles.pageSubtitle}>Here's your business overview</p>
              </div>
              <button onClick={() => setActiveTab('deals')} style={styles.ctaBtn}>
                ➕ Create New Deal
              </button>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {[
                { icon: '🎯', label: 'Total Deals', value: products.length, color: '#667eea' },
                { icon: '👁️', label: 'Total Views', value: stats.totalViews.toLocaleString(), color: '#764ba2' },
                { icon: '🖱️', label: 'Total Clicks', value: stats.totalClicks.toLocaleString(), color: '#f093fb' },
                { icon: '⭐', label: 'Avg Rating', value: `${stats.avgRating}★`, color: '#4facfe' }
              ].map((stat, i) => (
                <div key={i} style={styles.statBox}>
                  <div style={{ ...styles.statIcon, background: stat.color }}>{stat.icon}</div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📋 Recent Activity</h2>
              {products.length === 0 ? (
                <div style={styles.noData}>
                  <p>No deals created yet. Start by creating your first deal!</p>
                </div>
              ) : (
                <div style={styles.activityList}>
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} style={styles.activityItem}>
                      <div style={styles.activityIcon}>🎁</div>
                      <div style={styles.activityContent}>
                        <div style={styles.activityTitle}>{product.name}</div>
                        <div style={styles.activityMeta}>₹{parseFloat(product.price).toFixed(2)} • {product.category}</div>
                      </div>
                      <div style={styles.activityDate}>Just now</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Deals Tab */}
        {activeTab === 'deals' && (
          <div style={styles.content}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.pageTitle}>🎯 My Deals</h1>
                <p style={styles.pageSubtitle}>Create and manage your deals</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ ...styles.ctaBtn, ...(showForm && { background: '#dc3545' }) }}
              >
                {showForm ? '❌ Cancel' : '➕ Create Deal'}
              </button>
            </div>

            {showForm && (
              <div style={styles.formCard}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Create New Deal</h3>
                <form onSubmit={handleAddProduct}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={styles.input}
                      >
                        {categories.map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        style={styles.input}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Deal Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Summer Special Offer"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your deal..."
                      style={{ ...styles.input, minHeight: '120px', resize: 'none' }}
                    />
                  </div>

                  <button type="submit" style={styles.submitBtn} disabled={loadingAction}>
                    {loadingAction ? '⏳ Creating...' : '✅ Create Deal'}
                  </button>
                </form>
              </div>
            )}

            {/* Deals List */}
            <div style={styles.dealsGrid}>
              {loading ? (
                <div style={styles.loading}>Loading deals...</div>
              ) : products.length === 0 ? (
                <div style={styles.noData}>
                  <p>No deals created yet. Create your first deal to get started!</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} style={styles.dealCard}>
                    <div style={styles.dealCardHeader}>
                      <h3 style={styles.dealCardTitle}>{product.name}</h3>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={styles.deleteBtn}
                        disabled={loadingAction}
                      >
                        🗑️
                      </button>
                    </div>
                    {product.description && <p style={styles.dealCardDesc}>{product.description}</p>}
                    <div style={styles.dealCardMeta}>
                      <span style={styles.dealPrice}>₹{parseFloat(product.price).toFixed(2)}</span>
                      <span style={styles.dealCategory}>{product.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>📈 Performance Analytics</h1>
            
            <div style={styles.analyticsGrid}>
              {[
                { title: 'Total Impressions', value: stats.totalViews, change: '+12%', icon: '👁️' },
                { title: 'Click-through Rate', value: '8.4%', change: '+2.3%', icon: '🖱️' },
                { title: 'Conversion Rate', value: '3.2%', change: '+0.8%', icon: '💹' },
                { title: 'Customer Rating', value: stats.avgRating + '★', change: 'Excellent', icon: '⭐' }
              ].map((metric, i) => (
                <div key={i} style={styles.analyticsCard}>
                  <div style={styles.analyticsIcon}>{metric.icon}</div>
                  <div style={styles.analyticsContent}>
                    <div style={styles.analyticsTitle}>{metric.title}</div>
                    <div style={styles.analyticsValue}>{metric.value}</div>
                    <div style={styles.analyticsChange}>{metric.change}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>💡 Optimization Tips</h2>
              <div style={styles.tipsContainer}>
                {[
                  '✓ Clear product descriptions attract more customers',
                  '✓ Update deals regularly to stay on top',
                  '✓ Add high-quality images for better engagement',
                  '✓ Respond to customer reviews promptly',
                  '✓ Use trending categories for better visibility',
                  '✓ Set competitive prices to increase conversions'
                ].map((tip, i) => (
                  <div key={i} style={styles.tipItem}>{tip}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>📍 Business Location</h1>
            
            <form onSubmit={handleSaveLocation} style={styles.formCard}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Address *</label>
                <textarea
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  placeholder="Enter full business address"
                  style={{ ...styles.input, minHeight: '100px', resize: 'none' }}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Latitude</label>
                  <input
                    type="number"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                    placeholder="e.g., 28.6139"
                    style={styles.input}
                    step="0.0001"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Longitude</label>
                  <input
                    type="number"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                    placeholder="e.g., 77.2090"
                    style={styles.input}
                    step="0.0001"
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button type="button" onClick={handleGetLocation} style={styles.secondaryBtn}>
                  📍 Get GPS Location
                </button>
                <button type="submit" style={styles.submitBtn} disabled={loadingAction}>
                  {loadingAction ? '⏳ Saving...' : '💾 Save Location'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>⚙️ Account Settings</h1>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>👤 Business Information</h2>
              <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Business Name:</span>
                  <span style={styles.infoValue}>{dealerInfo?.business_name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Email:</span>
                  <span style={styles.infoValue}>{dealerInfo?.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phone:</span>
                  <span style={styles.infoValue}>{dealerInfo?.phone}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Location:</span>
                  <span style={styles.infoValue}>{dealerInfo?.address || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div style={{ ...styles.section, ...styles.dangerZone }}>
              <h2 style={styles.sectionTitle}>🔴 Danger Zone</h2>
              <p style={styles.dangerText}>Permanently delete your account and all deals. This action cannot be undone.</p>
              <button onClick={handleDeleteAccount} style={styles.deleteAccountBtn} disabled={loadingAction}>
                🗑️ Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
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

// Premium Styles
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f7f9fc',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  logoIcon: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  businessName: {
    color: 'white',
    fontWeight: '700',
    fontSize: '16px'
  },
  businessRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
  },
  navIcon: {
    fontSize: '20px'
  },
  navText: {
    flex: 1
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '600'
  },
  navDesc: {
    fontSize: '11px',
    opacity: 0.8
  },
  logoutBtn: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px'
  },
  alert: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  alertSuccess: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  alertError: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  closeAlert: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#000'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  ctaBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  statBox: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000'
  },
  statLabel: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px'
  },
  section: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#000'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  activityIcon: {
    fontSize: '24px'
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontWeight: '600',
    color: '#000'
  },
  activityMeta: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px'
  },
  activityDate: {
    fontSize: '12px',
    color: '#999',
    minWidth: '80px',
    textAlign: 'right'
  },
  noData: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#999'
  },
  formCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#000',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    fontSize: '14px'
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  dealCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  dealCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '12px',
    gap: '12px'
  },
  dealCardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
    flex: 1
  },
  deleteBtn: {
    background: '#f8f9fa',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  dealCardDesc: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  dealCardMeta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  dealPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea'
  },
  dealCategory: {
    fontSize: '12px',
    background: '#f0f0f0',
    padding: '4px 12px',
    borderRadius: '4px',
    color: '#666'
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  analyticsCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  analyticsIcon: {
    fontSize: '32px'
  },
  analyticsContent: {
    flex: 1
  },
  analyticsTitle: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '500'
  },
  analyticsValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
    marginTop: '4px'
  },
  analyticsChange: {
    fontSize: '12px',
    color: '#4caf50',
    marginTop: '4px',
    fontWeight: '600'
  },
  tipsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px'
  },
  tipItem: {
    background: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    borderLeft: '4px solid #667eea'
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  secondaryBtn: {
    padding: '12px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  },
  infoCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  infoLabel: {
    fontWeight: '600',
    color: '#000',
    fontSize: '14px'
  },
  infoValue: {
    color: '#666',
    fontSize: '14px'
  },
  dangerZone: {
    background: '#fff5f5',
    borderLeft: '4px solid #dc3545'
  },
  dangerText: {
    color: '#666',
    marginBottom: '16px',
    fontSize: '14px'
  },
  deleteAccountBtn: {
    padding: '12px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#999'
  }
};

export default DealerDashboard;
