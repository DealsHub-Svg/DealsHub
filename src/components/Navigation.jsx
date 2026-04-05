import React from 'react';
import { TRANSLATIONS } from '../data';

const Navigation = ({ currentTab, setTab, lang }) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'home', icon: '🏠', label: t.home, path: '/' },
    { id: 'explore', icon: '🔍', label: t.explore, path: '/explore' },
    { id: 'influencers', icon: '🌟', label: t.influencers, path: '/influencers', badge: 2 },
    { id: 'profile', icon: '👤', label: t.profile, path: '/profile' }
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"> L </div>
          <div className="sidebar-logo-text">
            Local Deals<span>Hub</span>
          </div>
        </div>

        <div className="mt-8 gap-4 flex-col">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user" onClick={() => setTab('profile')}>
            <div className="user-avatar">
              U
            </div>
            <div className="user-info">
              <div className="user-name">User Profile</div>
              <div className="user-pts">1,240 {t.points}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`bottom-nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {currentTab === item.id && <div className="active-dot"></div>}
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
