import React, { useState } from 'react';
import { TRANSLATIONS, CHALLENGES, LEADERBOARD, NOTIFICATIONS } from '../data';
import BusinessRegistration from '../components/BusinessRegistration';

const Profile = ({ theme, toggleTheme, lang, changeLang, onLogout, userLocation, authUser, userLocationName }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [activeTab, setActiveTab] = useState('rewards');
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-16 mb-24">
        <div className="avatar avatar-xl overflow-hidden" style={{background: 'var(--grad-primary)', color: 'white'}}>
          {authUser?.picture ? <img src={authUser.picture} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (authUser?.name ? authUser.name[0] : '🌟')}
        </div>
        <div className="flex-1">
          <h1 className="page-title" style={{fontSize: '22px'}}>{authUser?.name || "User Profile"}</h1>
          <p className="page-subtitle mb-4">{authUser?.email || "user@example.com"}</p>
          
          <div className="flex items-center gap-4 text-success" style={{fontSize: '11px', fontWeight: '600'}}>
            <span>📍</span>
            {userLocationName ? (
              <span>{userLocationName}</span>
            ) : userLocation ? (
              <span style={{fontFamily: 'monospace'}}>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            ) : (
              <span className="text-secondary">Location Unknown</span>
            )}
          </div>

          <div className="badge badge-gold mt-8">🏆 Gold Shopper</div>
        </div>
        <button className="icon-btn">⚙️</button>
      </div>

      {/* Tabs */}
      <div className="tab-row mb-24">
        <div className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>Rewards</div>
        <div className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>Business</div>
        <div className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
      </div>

      {activeTab === 'rewards' && (
        <div className="animate-fade-in">
          {/* Points Card */}
          <div className="points-card mb-24">
            <div className="points-label">Total Points Available</div>
            <div className="points-value">1,240</div>
            <div className="flex items-center gap-12 mt-16">
              <button className="btn btn-sm" style={{background: 'white', color: 'var(--primary)'}}>Redeem</button>
              <button className="btn btn-sm btn-outline" style={{borderColor: 'white', color: 'white'}}>History</button>
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="section-title mb-16">Daily Challenges</div>
          <div className="flex-col gap-12 mb-24">
            {CHALLENGES.map(ch => (
              <div className="challenge-card" key={ch.id}>
                <div className="challenge-icon">{ch.icon}</div>
                <div className="challenge-info">
                  <div className="flex justify-between items-center">
                     <span className="challenge-name">{ch.name}</span>
                     <span className="challenge-pts">+{ch.pts} pts</span>
                  </div>
                  <div className="challenge-desc">{ch.desc}</div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{width: `${ch.progress}%`, background: ch.completed ? 'var(--success)' : ''}}></div>
                  </div>
                </div>
                {ch.completed && <div className="badge badge-success">✓</div>}
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="section-title mb-16">Weekly Leaderboard</div>
          <div className="card card-body mb-24">
            {LEADERBOARD.map(user => (
              <div className="leaderboard-item" key={user.rank}>
                <div className={`leaderboard-rank ${user.rank <= 3 ? 'rank-'+user.rank : 'rank-other'}`}>
                  {user.rank}
                </div>
                <div className="avatar avatar-sm">{user.emoji}</div>
                <div className="flex-1 text-primary font-bold" style={{fontSize: '13px', fontWeight: user.isUser ? '700' : '500'}}>
                  {user.name} {user.isUser && "(You)"}
                </div>
                <div className="text-secondary" style={{fontSize: '12px', fontWeight: '700'}}>
                  {user.pts} <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="animate-fade-in">
          <div className="section-header">
             <h2 className="section-title">Business Dashboard</h2>
             <span className="badge badge-primary">Pro Plan</span>
          </div>
          
          <div className="stats-row mb-20">
            <div className="stat-box">
              <div className="stat-value text-primary">12.4K</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-box">
              <div className="stat-value text-success">842</div>
              <div className="stat-label">Deal Claims</div>
            </div>
          </div>

          <div className="dashboard-stat-card mb-12">
             <div className="dashboard-stat-icon" style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)'}}>💰</div>
             <div className="flex-1">
                <div className="dashboard-stat-label">Revenue Generated</div>
                <div className="dashboard-stat-val">Rs. 425,000</div>
             </div>
             <div className="dashboard-stat-change change-up">↑ 12%</div>
          </div>

          <div className="dashboard-stat-card mb-24">
             <div className="dashboard-stat-icon" style={{background: 'rgba(124,58,237,0.1)', color: 'var(--primary)'}}>👥</div>
             <div className="flex-1">
                <div className="dashboard-stat-label">Influencer Clicks</div>
                <div className="dashboard-stat-val">1,204</div>
             </div>
             <div className="dashboard-stat-change change-up">↑ 8%</div>
          </div>

          <button className="btn btn-primary btn-lg btn-full mb-12" onClick={() => setShowBusinessModal(true)}>+ Create New Deal</button>
          <button className="btn btn-secondary btn-full">Manage Active Deals</button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-fade-in">
          <div className="section-title mb-16">App Preferences</div>
          
          <div className="card card-body flex-col gap-16 mb-24">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-primary" style={{fontSize: '14px', fontWeight: '600'}}>Dark Mode</div>
                <div className="text-secondary" style={{fontSize: '12px'}}>Toggle beautiful dark theme</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="divider" style={{margin: '0'}}></div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-primary" style={{fontSize: '14px', fontWeight: '600'}}>Language</div>
                <div className="text-secondary" style={{fontSize: '12px'}}>Choose app language</div>
              </div>
              <div className="lang-switcher">
                <div className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</div>
                <div className={`lang-btn ${lang === 'si' ? 'active' : ''}`} onClick={() => changeLang('si')}>SIN</div>
                <div className={`lang-btn ${lang === 'ta' ? 'active' : ''}`} onClick={() => changeLang('ta')}>TAM</div>
              </div>
            </div>

            <div className="divider" style={{margin: '0'}}></div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-primary" style={{fontSize: '14px', fontWeight: '600'}}>Push Notifications</div>
                <div className="text-secondary" style={{fontSize: '12px'}}>Alerts for near by deals</div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <button className="btn btn-outline btn-danger btn-full" onClick={onLogout}>Logout</button>
        </div>
      )}

      {showBusinessModal && (
        <BusinessRegistration 
          onClose={() => setShowBusinessModal(false)}
          onSuccess={() => {
            alert('✅ Business registered! You will receive login credentials via email.');
            setShowBusinessModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
