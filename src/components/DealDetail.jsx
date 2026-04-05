import React from 'react';
import { TRANSLATIONS } from '../data';

const DealDetail = ({ deal, onClose, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle d-md-none"></div>
        
        <div className="modal-header">
          <div className="modal-close" onClick={onClose}>✕</div>
          <div className="flex items-center gap-8">
            <span className="badge badge-warning">⭐ {deal.rating}</span>
            <div className="icon-btn" style={{width: '32px', height: '32px'}}>♥️</div>
          </div>
        </div>

        <div className="deal-detail-img mb-20">{deal.emoji}</div>

        <div className="flex items-center justify-between mb-12">
          <span className="deal-category">{deal.category}</span>
          {deal.halal && <span className="badge badge-success">✓ Halal</span>}
        </div>

        <h2 className="page-title mb-8" style={{fontSize: '22px'}}>{deal.name}</h2>
        <div className="flex items-center gap-8 mb-16 text-muted" style={{fontSize: '13px'}}>
          <span>📍 {deal.business} • {deal.location}</span>
          <span>•</span>
          <span>{deal.distance}</span>
        </div>

        <div className="flex items-center gap-12 mb-20">
          <span className="deal-price" style={{fontSize: '26px'}}>Rs. {deal.price}</span>
          <span className="deal-original" style={{fontSize: '16px'}}>Rs. {deal.original}</span>
          <span className="badge badge-danger">-{deal.discount}%</span>
        </div>

        <p className="text-secondary mb-24" style={{fontSize: '14px', lineHeight: '1.6'}}>
          {deal.description}
        </p>

        <div className="divider"></div>

        <div className="mb-20">
          <div className="section-title mb-12">Share with friends</div>
          <div className="share-row">
            <button className="share-btn share-whatsapp">📱 WhatsApp</button>
            <button className="share-btn share-instagram">📸 Instagram</button>
            <button className="share-btn share-tiktok">🎵 TikTok</button>
            <button className="share-btn share-facebook">📘 Facebook</button>
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-full">
          Grab Deal Now
        </button>
      </div>
    </div>
  );
};

export default DealDetail;
