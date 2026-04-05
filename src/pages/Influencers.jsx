import React, { useState } from 'react';
import { TRANSLATIONS, INFLUENCERS } from '../data';
import InfluencerApplication from '../components/InfluencerApplication';

const Influencers = ({ lang, onSimulateVerify }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [showApplyModal, setShowApplyModal] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
         <h1 className="page-title">{t.topInfluencers}</h1>
         <button className="btn btn-sm btn-outline" onClick={() => setShowApplyModal(true)} style={{borderStyle: 'dashed', borderColor: 'var(--primary)', color: 'var(--primary)'}}>
            Apply as Influencer
         </button>
      </div>
      <p className="page-subtitle mb-24">Follow creators, use their codes, earn rewards.</p>

      {/* Featured Influencer Banner */}
      <div className="hero mb-24" style={{background: 'var(--grad-warm)'}}>
        <div className="hero-content flex items-center justify-between">
          <div>
            <div className="hero-label">Creator of the Month</div>
            <h2 className="hero-title" style={{fontSize: '22px'}}>Ayesha Malik 👑</h2>
            <p className="hero-sub mb-12">Use code <b>AYESHA20</b> for 20% extra OFF</p>
            <button className="btn btn-sm" style={{background: 'white', color: '#EF4444'}}>
              Follow
            </button>
          </div>
          <div className="influencer-ring p-1" style={{background: 'white'}}>
            <div className="avatar avatar-xl" style={{background: 'var(--bg-input)'}}>👩</div>
          </div>
        </div>
      </div>

      {/* Influencers Grid */}
      <div className="influencer-grid mb-24">
        {INFLUENCERS.map(inf => (
          <div className="card influencer-card" key={inf.id}>
            <div className="influencer-avatar-wrap">
              <div className="influencer-ring">
                <div className="avatar avatar-lg" style={{background: 'var(--bg-card)', fontSize: '36px'}}>{inf.emoji}</div>
              </div>
              {inf.verified && <div className="influencer-verified">✓</div>}
            </div>
            
            <div>
              <div className="influencer-name">{inf.name}</div>
              <div className="influencer-handle">{inf.handle}</div>
            </div>

            <p className="text-secondary" style={{fontSize: '11px', lineHeight: '1.4'}}>
              {inf.speciality}
            </p>

            <div className="influencer-stats w-full justify-center">
              <div className="influencer-stat">
                <span className="influencer-stat-val">{inf.followers}</span>
                <span className="influencer-stat-key">Followers</span>
              </div>
              <div className="influencer-stat">
                <span className="influencer-stat-val">{inf.deals}</span>
                <span className="influencer-stat-key">Deals</span>
              </div>
            </div>

            <div className="w-full mt-8">
               <div className="text-muted" style={{fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px'}}>Referral Code</div>
               <div className="referral-code w-full">{inf.referralCode}</div>
            </div>

            <button className="btn btn-primary btn-sm btn-full mt-4">Profile & Deals</button>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <InfluencerApplication 
          onClose={() => setShowApplyModal(false)}
          onSimulateVerify={onSimulateVerify}
        />
      )}
    </div>
  );
};

export default Influencers;
