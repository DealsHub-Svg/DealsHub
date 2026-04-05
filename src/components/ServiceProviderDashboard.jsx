import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const ServiceProviderDashboard = ({ provider, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Food',
    price: '',
    discount_percentage: 0,
    quantity_available: '',
    product_type: 'food',
    is_halal: true,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/provider-products/${provider.provider_id}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (provider?.provider_id) {
      fetchProducts();
    }
  }, [provider]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: provider.provider_id,
          ...newProduct,
          price: parseFloat(newProduct.price),
          quantity_available: parseInt(newProduct.quantity_available)
        })
      });

      if (response.ok) {
        setMessage('✅ Product added successfully!');
        setNewProduct({
          name: '',
          description: '',
          category: 'Food',
          price: '',
          discount_percentage: 0,
          quantity_available: '',
          product_type: 'food',
          is_halal: true,
          image_url: ''
        });
        fetchProducts();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Error adding product');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED, #0EA5E9)',
        color: '#fff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>🏪 {provider?.business_name}</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Business Owner Dashboard</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          borderLeft: '4px solid #7C3AED'
        }}>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>📦 Total Products</p>
          <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>{products.length}</h3>
        </div>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          borderLeft: '4px solid #0EA5E9'
        }}>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>📊 Total Orders</p>
          <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>0</h3>
        </div>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          borderLeft: '4px solid #10B981'
        }}>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>💰 Revenue</p>
          <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>Rs 0</h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        {['products', 'orders', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '700' : '500',
              fontSize: '14px',
              color: activeTab === tab ? '#7C3AED' : '#6B7280',
              borderBottom: activeTab === tab ? '3px solid #7C3AED' : 'none',
              marginBottom: '-1px'
            }}
          >
            {tab === 'products' && '📦 Products'}
            {tab === 'orders' && '📋 Orders'}
            {tab === 'analytics' && '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? '#D1FAE5' : '#FEE2E2',
          color: message.includes('✅') ? '#065F46' : '#7F1D1D',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Add Product Form */}
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0 }}>➕ Add New Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., Biryani Pot"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Price (Rs)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Discount %</label>
                  <input
                    type="number"
                    value={newProduct.discount_percentage}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_percentage: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Quantity</label>
                <input
                  type="number"
                  required
                  value={newProduct.quantity_available}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity_available: e.target.value })}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Product Type</label>
                  <select
                    value={newProduct.product_type}
                    onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="food">🍽️ Food</option>
                    <option value="service">🛠️ Service</option>
                    <option value="item">📦 Item</option>
                  </select>
                </div>
                <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newProduct.is_halal}
                    onChange={(e) => setNewProduct({ ...newProduct, is_halal: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer', margin: 0 }}>☪️ Is Halal</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #0EA5E9)',
                  color: '#fff',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Adding...' : '➕ Add Product'}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0 }}>📦 Your Products</h3>
            {products.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>No products added yet. Add your first product! 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                {products.map(product => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{product.emoji} {product.name}</p>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>Stock: {product.quantity_available}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Rs {product.price}</p>
                      {product.discount_percentage > 0 && (
                        <p style={{ fontSize: '12px', color: '#10B981', margin: '4px 0 0 0' }}>-{product.discount_percentage}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <p style={{ fontSize: '16px' }}>📋 No orders yet. Customers will see your products soon!</p>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <p style={{ fontSize: '16px' }}>📊 Analytics coming soon! Track your sales and performance here.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
