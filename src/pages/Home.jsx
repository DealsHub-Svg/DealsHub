import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, DEALS, CATEGORIES, STORIES } from '../data';
import { calculateDistance } from '../utils';
import ProductCard from '../components/ProductCard';

const Home = ({ onDealClick, lang, userLocation, userLocationName }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [activeCat, setActiveCat] = useState('all');
  const [dealerProducts, setDealerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch dealer products on mount or location change
  useEffect(() => {
    fetchDealerProducts();
  }, [userLocation]);

  const fetchDealerProducts = async () => {
    setLoadingProducts(true);
    try {
      let url = '/api/all-products';
      
      // If user location is available, get nearby products
      if (userLocation) {
        const response = await fetch('/api/nearby-dealer-products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            radiusKm: 15
          })
        });
        const data = await response.json();
        setDealerProducts(data || []);
      } else {
        // Get all products if location not available
        const response = await fetch(url, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await response.json();
        setDealerProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setDealerProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Search Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="search-bar flex-1">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder={t.search} />
        </div>
        <div className="icon-btn ml-12">
          🔔
          <div className="badge-dot"></div>
        </div>
      </div>
      
      {/* Real Geolocation feedback display */}
      {userLocation && (
        <div className="mb-20 text-success" style={{fontSize: '11px', fontWeight: '600'}}>
          <span style={{marginRight: '4px'}}>📍</span>
          Using your location: <span style={{fontFamily: userLocationName ? 'inherit' : 'monospace'}}>{userLocationName || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}</span>
        </div>
      )}
      
      {!userLocation && <div className="mb-20"></div>}

      {/* Stories / Highlighted Businesses  */}
      <div className="h-scroll mb-24">
        {STORIES.map(story => (
          <div key={story.id} className="story-item">
            <div className={`story-ring ${story.seen ? 'seen' : ''}`}>
              <div className="story-inner">
                {story.emoji}
              </div>
            </div>
            <span className="story-label truncate">{story.label}</span>
          </div>
        ))}
      </div>

      {/* Hero Banner */}
      <div className="hero mb-24">
        <div className="hero-content">
          <div className="hero-label">Weekend Special</div>
          <h2 className="hero-title">50% OFF<br/>Food & Dining</h2>
          <p className="hero-sub mb-16">Exclusive referral discounts inside</p>
          <button className="btn" style={{background: 'white', color: 'var(--primary)', padding: '8px 16px', fontSize: '13px'}}>
            Claim Now
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="h-scroll mb-24 gap-8">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            className={`chip ${activeCat === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="section-header">
        <h2 className="section-title">{t.trendingNow}</h2>
        <span className="see-all">{t.seeAll}</span>
      </div>

      <div className="deals-grid mb-24">
        {DEALS.map(deal => (
          <div className="card deal-card" key={deal.id} onClick={() => onDealClick(deal)}>
            <div className="deal-card-img">
              <div className="deal-card-img-inner">{deal.emoji}</div>
              <div className="deal-gradient-overlay"></div>
              <div className="deal-badge">-{deal.discount}%</div>
              <button className="deal-save-btn" onClick={(e) => { e.stopPropagation(); /* toggle save */ }}>
                {deal.saved ? <span style={{color:'var(--danger)'}}>♥️</span> : '🤍'}
              </button>
            </div>
            <div className="deal-info">
              <div className="deal-category">{deal.category}</div>
              <div className="deal-name">{deal.name}</div>
              <div className="deal-meta">
                <span className="deal-price">Rs.{deal.price}</span>
                <span className="deal-original">{deal.original}</span>
              </div>
              <div className="deal-meta mt-8">
                <span className="deal-rating">⭐ {deal.rating}</span>
                <span className="deal-distance">📍 {deal.computedDistance || deal.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DEALER PRODUCTS SECTION */}
      {dealerProducts.length > 0 && (
        <div>
          <div className="section-header" style={{marginBottom: '16px'}}>
            <h2 className="section-title">📦 Local Dealer Services</h2>
            <span className="see-all">{dealerProducts.length}</span>
          </div>
          <div style={styles.productsGrid}>
            {dealerProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {loadingProducts && <div style={{textAlign: 'center', padding: '20px'}}>Loading services...</div>}
      
      {/* Add spacing at bottom */}
      <div className="spacer"></div>
    </div>
  );
};

const styles = {
  productsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px'
  }
};

export default Home;
