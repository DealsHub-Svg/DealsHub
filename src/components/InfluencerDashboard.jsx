import React, { useState } from 'react';
import { TRANSLATIONS } from '../data';

const InfluencerDashboard = ({ onLogout, lang, toggleTheme, theme, authUser }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="animate-fade-in" style={{minHeight: '100dvh', display: 'flex', flexDirection: 'column'}}>
      {/* Custom Influencer Topbar */}
      <div className="topbar" style={{background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50}}>
        <div className="topbar-logo flex items-center gap-8">
          <span style={{fontSize: '20px'}}>✨</span>
          <div>
             <span style={{color: 'var(--text-primary)'}}>Creator </span>
             <span className="text-primary font-bold">Studio</span>
          </div>
        </div>
        <div className="topbar-actions">
           <div className="icon-btn">🔔<div className="badge-dot"></div></div>
           <div className="avatar avatar-sm overflow-hidden" style={{background: 'var(--grad-warm)', color: 'white', cursor: 'pointer'}}>
             {authUser?.picture ? <img src={authUser.picture} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (authUser?.name ? authUser.name[0] : '👩')}
           </div>
        </div>
      </div>

      <div className="page flex-1">
        
        {/* Navigation Tabs */}
        <div className="h-scroll mb-24">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'codes', icon: '🎟️', label: 'Promo Codes' },
            { id: 'offers', icon: '📢', label: 'My Offers' },
            { id: 'content', icon: '📸', label: 'Content Lab' },
            { id: 'rewards', icon: '🏆', label: 'Rewards' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`chip ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW / ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="section-title mb-16">Analytics Dashboard</h1>
            
            <div className="stats-row mb-16">
              <div className="dashboard-stat-card flex-1 flex-col items-start gap-8" style={{padding: '16px'}}>
                <div className="text-muted" style={{fontSize: '12px'}}>Total Earnings</div>
                <div className="dashboard-stat-val text-success">Rs. 45,200</div>
                <div className="dashboard-stat-change change-up">↑ 18% this week</div>
              </div>
              <div className="dashboard-stat-card flex-1 flex-col items-start gap-8" style={{padding: '16px'}}>
                <div className="text-muted" style={{fontSize: '12px'}}>Code Uses</div>
                <div className="dashboard-stat-val text-primary">342</div>
                <div className="dashboard-stat-change change-up">↑ 12% this week</div>
              </div>
            </div>

            <div className="dashboard-stat-card mb-24">
               <div className="dashboard-stat-icon" style={{background: 'var(--bg-overlay)', color: 'var(--primary)'}}>📈</div>
               <div className="flex-1">
                  <div className="dashboard-stat-label">Link Clicks & Impressions</div>
                  <div className="dashboard-stat-val">12,408 <span style={{fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500'}}>Impressions</span></div>
               </div>
               <button className="btn btn-sm btn-outline">View Chart</button>
            </div>

            <div className="section-title mb-12">Recent Commissions</div>
            <div className="card card-body flex-col gap-12">
              {[
                { shop: 'Saffron Kitchen', amt: 250, date: '2 hours ago' },
                { shop: 'FitLife Gym', amt: 850, date: 'Yesterday' },
                { shop: 'Glamour Studio', amt: 400, date: 'Yesterday' }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between pb-12" style={{borderBottom: i < 2 ? '1px solid var(--border)' : 'none'}}>
                   <div className="flex items-center gap-10">
                     <div className="avatar avatar-sm" style={{background: 'var(--bg-input)'}}>🛒</div>
                     <div>
                       <div className="text-primary font-bold" style={{fontSize: '13px'}}>{c.shop}</div>
                       <div className="text-secondary" style={{fontSize: '11px'}}>{c.date}</div>
                     </div>
                   </div>
                   <div className="text-success font-bold" style={{fontSize: '14px'}}>+Rs.{c.amt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROMO CODE GENERATOR ── */}
        {activeTab === 'codes' && (
          <div className="animate-fade-in">
            <h1 className="section-title mb-16">Promo Code Generator</h1>
            <div className="card card-body mb-24" style={{background: 'var(--grad-primary)', color: 'white'}}>
               <p style={{fontSize: '13px', opacity: 0.9, marginBottom: '16px'}}>
                 Generate unique referral tracking codes to share with your audience. Earn up to 15% commission per claim.
               </p>
               <div className="flex items-center gap-8 bg-surface" style={{padding: '4px', borderRadius: 'var(--radius-full)'}}>
                  <input type="text" className="input flex-1" placeholder="Enter custom suffix... e.g. EXTRA10" style={{border: 'none', background: 'transparent'}} />
                  <button className="btn btn-primary" style={{borderRadius: 'var(--radius-full)'}}>Generate</button>
               </div>
            </div>

            <div className="section-title mb-12">Active Codes</div>
            <div className="flex-col gap-12">
              {[
                { code: 'AYESHA20', uses: 156, com: '10%' },
                { code: 'AYESHA_FOODIE', uses: 89, com: '15%' }
              ].map((c,i) => (
                <div key={i} className="card card-body flex items-center justify-between">
                   <div>
                     <div className="referral-code mb-4" style={{display: 'inline-block'}}>{c.code}</div>
                     <div className="text-secondary" style={{fontSize: '12px'}}>Commission: {c.com}</div>
                   </div>
                   <div className="text-right">
                     <div className="dashboard-stat-val text-primary" style={{fontSize: '16px'}}>{c.uses}</div>
                     <div className="text-secondary" style={{fontSize: '11px'}}>total claims</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTENT TOOLS ── */}
        {activeTab === 'content' && (
          <div className="animate-fade-in">
             <h1 className="section-title mb-8">Content Lab</h1>
             <p className="page-subtitle mb-24">Upload promotional content directly to your Deals Hub profile, or share to socials.</p>

             <div className="card card-body mb-24 border-dashed" style={{border: '2px dashed var(--border-strong)', background: 'var(--bg-overlay)'}}>
                <div className="text-center p-24">
                   <div style={{fontSize: '32px', marginBottom: '12px'}}>📹</div>
                   <div className="text-primary font-bold mb-8">Upload Deal Review (Image/Video)</div>
                   <button className="btn btn-sm btn-outline" style={{background: 'var(--bg-card)'}}>Choose File</button>
                </div>
             </div>

             <div className="input-group mb-16">
               <label className="input-label">Caption / Review</label>
               <textarea className="input" rows="4" placeholder="Write an engaging review for your followers..."></textarea>
             </div>

             <div className="input-group mb-24">
               <label className="input-label">Link Promo Code</label>
               <select className="input">
                 <option>AYESHA20 (10% Commission)</option>
                 <option>AYESHA_FOODIE (15% Commission)</option>
               </select>
             </div>

             <div className="section-title mb-12">Post & Share To</div>
             <div className="share-row mb-24">
                <button className="share-btn share-instagram">📸 Instagram Post</button>
                <button className="share-btn share-tiktok">🎵 TikTok</button>
                <button className="share-btn share-whatsapp">📱 WhatsApp</button>
             </div>

             <button className="btn btn-primary btn-lg btn-full">Publish to Local Deals Hub</button>
          </div>
        )}

        {/* ── PROFILE MANAGEMENT ── */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-16 mb-24">
               <div className="avatar avatar-xl overflow-hidden" style={{background: 'var(--grad-warm)', color: 'white'}}>
                 {authUser?.picture ? <img src={authUser.picture} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (authUser?.name ? authUser.name[0] : '👩')}
               </div>
               <div>
                 <h2 className="section-title mb-4">{authUser?.name || "Ayesha Malik"}</h2>
                 <p className="text-secondary mb-8" style={{fontSize: '13px'}}>{authUser?.email}</p>
                 <div className="text-success font-bold" style={{fontSize: '11px'}}>✓ Verified Creator</div>
               </div>
             </div>

             <div className="card card-body flex-col gap-16 mb-24">
                <div className="input-group">
                  <label className="input-label">Display Name</label>
                  <input type="text" className="input" defaultValue={authUser?.name || "Ayesha Malik"} />
                </div>
                <div className="input-group">
                  <label className="input-label">Bio</label>
                  <textarea className="input" rows="3" defaultValue="Lifestyle & Food blogger based in Colombo. Sharing the best halal deals!"></textarea>
                </div>
                <div className="input-group">
                  <label className="input-label">Instagram Link</label>
                  <input type="text" className="input" defaultValue="https://instagram.com/ayesha.slk" />
                </div>
                <div className="input-group">
                  <label className="input-label">TikTok Link</label>
                  <input type="text" className="input" defaultValue="https://tiktok.com/@ayesha.slk" />
                </div>
                <button className="btn btn-primary mt-8">Save Changes</button>
             </div>

             <div className="section-title mb-12">App Settings</div>
             <div className="card card-body flex-col gap-16 mb-24">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-primary font-bold" style={{fontSize: '14px'}}>Super Dark Mode</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
             </div>

             <button className="btn btn-danger btn-outline btn-full" onClick={onLogout}>Logout</button>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {(activeTab === 'offers' || activeTab === 'rewards') && (
           <div className="animate-fade-in text-center p-24">
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🚧</div>
              <h2 className="section-title mb-8">Coming Soon</h2>
              <p className="text-secondary" style={{fontSize: '13px'}}>This section of the Creator Studio is being finalized.</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default InfluencerDashboard;
