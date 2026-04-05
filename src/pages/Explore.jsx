import React from 'react';
import { TRANSLATIONS, CATEGORIES, DEALS } from '../data';

const Explore = ({ onDealClick, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-20">{t.explore}</h1>

      <div className="search-bar mb-24">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search by location, category or brand..." />
        <button className="icon-btn" style={{width: '32px', height: '32px'}}>⚙️</button>
      </div>

      {/* Map Placeholder */}
      <div className="map-placeholder mb-24" style={{height: '180px'}}>
        <div style={{fontSize: '32px'}}>🗺️</div>
        <div>Interactive Map View</div>
        <button className="btn btn-primary btn-sm mt-8" style={{borderRadius: 'var(--radius-full)'}}>
          View Nearby Deals
        </button>
      </div>

      <div className="section-title mb-16">Categories</div>
      <div className="category-grid mb-32">
        {CATEGORIES.slice(1).map(cat => (
          <div className="category-item" key={cat.id}>
            <div className="category-icon-wrap" style={{background: `${cat.color}20`, color: cat.color}}>
              {cat.emoji}
            </div>
            <div className="category-label">{cat.label}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="section-title">{t.nearbyDeals}</h2>
        <span className="see-all">Distance Sorting</span>
      </div>

      <div className="deals-grid mb-24">
        {/* Sort deals by distance specifically for Explore page */}
        {[...DEALS].sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 4).map(deal => (
          <div className="card deal-card" key={deal.id} onClick={() => onDealClick(deal)}>
            <div className="deal-card-img">
              <div className="deal-card-img-inner">{deal.emoji}</div>
              <div className="deal-gradient-overlay"></div>
              <div className="deal-badge">-{deal.discount}%</div>
            </div>
            <div className="deal-info">
              <div className="deal-category">{deal.category}</div>
              <div className="deal-name">{deal.name}</div>
              <div className="deal-meta">
                <span className="deal-price">Rs.{deal.price}</span>
                <span className="deal-distance text-primary font-bold">📍 {deal.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
