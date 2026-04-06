import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const NearbyProducts = ({ userEmail, userLocation, onOrderPlaced }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mapUri, setMapUri] = useState('');
  const [radius, setRadius] = useState(5);

  // Fetch nearby products
  const fetchNearbyProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/nearby-products/${userEmail}?radius=${radius}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching nearby products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchNearbyProducts();
    }
  }, [userEmail, radius]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // Generate Google Maps URI for the shop
    const mapsUri = `https://www.google.com/maps/search/?api=1&query=${product.latitude},${product.longitude}&query_place_id=${product.provider_id}`;
    setMapUri(mapsUri);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          user_id: 1, // Would come from auth
          provider_id: selectedProduct.provider_id,
          product_id: selectedProduct.product_id,
          quantity: 1,
          delivery_method: 'pickup',
          user_latitude: userLocation?.latitude,
          user_longitude: userLocation?.longitude
        })
      });

      if (response.ok) {
        alert('✅ Order placed! Head to the shop to collect.');
        setSelectedProduct(null);
        onOrderPlaced?.();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('❌ Failed to place order');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>🔍 Finding nearby shops...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Radius Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '0 20px',
        overflowX: 'auto'
      }}>
        {[1, 5, 10, 25].map(r => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '24px',
              background: radius === r ? 'linear-gradient(135deg, #7C3AED, #0EA5E9)' : '#F3F4F6',
              color: radius === r ? '#fff' : '#333',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {r}km
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F9FAFB', margin: '0 20px', borderRadius: '12px' }}>
          <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>🏪</p>
          <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>No shops nearby</p>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 0 0' }}>Try increasing search radius</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 20px' }}>
          {products.map((product, idx) => (
            <div
              key={idx}
              onClick={() => handleProductClick(product)}
              style={{
                background: selectedProduct?.provider_id === product.provider_id ? '#F0F4FF' : '#fff',
                border: selectedProduct?.provider_id === product.provider_id ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Product Image Placeholder */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #7C3AED, #0EA5E9)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '32px',
                  flexShrink: 0
                }}>
                  {product.emoji}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                        {product.product_name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                        🏪 {product.business_name}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                        Rs {product.discounted_price || product.price}
                      </p>
                      {product.discount_percentage > 0 && (
                        <p style={{ fontSize: '11px', color: '#10B981', margin: '2px 0 0 0', fontWeight: '600' }}>
                          -{product.discount_percentage}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location & Distance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📍</span>
                      <span>{product.distance_km.toFixed(1)} km away</span>
                    </div>
                    {product.product_rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⭐</span>
                        <span>{product.product_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>💬</span>
                      <span>{product.reviews_count} reviews</span>
                    </div>
                  </div>

                  {/* Address */}
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0 0' }}>
                    📍 {product.address} • {product.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 50
        }}>
          {/* Handle Bar */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '4px',
              background: '#D1D5DB',
              borderRadius: '2px',
              margin: '0 auto'
            }} />
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
                {selectedProduct.emoji} {selectedProduct.product_name}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                🏪 {selectedProduct.business_name}
              </p>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              ✕
            </button>
          </div>

          {/* Pricing */}
          <div style={{
            background: '#F0F4FF',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Price</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {selectedProduct.discount_percentage > 0 && (
                  <s style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '600' }}>
                    Rs {selectedProduct.price}
                  </s>
                )}
                <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Rs {selectedProduct.discounted_price || selectedProduct.price}
                </p>
              </div>
            </div>
            {selectedProduct.discount_percentage > 0 && (
              <div style={{
                background: '#10B981',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px'
              }}>
                Save {selectedProduct.discount_percentage}%
              </div>
            )}
          </div>

          {/* Location & Distance */}
          <div style={{
            background: '#F9FAFB',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, marginBottom: '8px' }}>📍 Location</p>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
              {selectedProduct.address}
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
              {selectedProduct.distance_km.toFixed(1)} km away
            </p>
          </div>

          {/* Rating */}
          {selectedProduct.product_rating > 0 && (
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px 16px',
              background: '#FFF7ED',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <span>⭐ {selectedProduct.product_rating.toFixed(1)}</span>
              <span>•</span>
              <span>💬 {selectedProduct.reviews_count} reviews</span>
            </div>
          )}

          {/* Map Button */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selectedProduct.latitude},${selectedProduct.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              background: '#0EA5E9',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              marginBottom: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🗺️ Open in Google Maps
          </a>

          {/* Order Button */}
          <button
            onClick={handlePlaceOrder}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7C3AED, #0EA5E9)',
              color: '#fff',
              padding: '14px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🛒 Place Order
          </button>

          {/* Halal Badge */}
          {selectedProduct.is_halal && (
            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#10B981',
              fontWeight: '600',
              margin: '12px 0 0 0'
            }}>
              ☪️ Halal Certified
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyProducts;
