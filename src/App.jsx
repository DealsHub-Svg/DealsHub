import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Influencers from './pages/Influencers';
import Profile from './pages/Profile';
import DealDetail from './components/DealDetail';
import Splash from './components/Splash';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import InfluencerDashboard from './components/InfluencerDashboard';
import LocationPrompt from './components/LocationPrompt';
import ServiceProviderDashboard from './components/ServiceProviderDashboard';
import NearbyProducts from './components/NearbyProducts';
import DealerDashboard from './components/DealerDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { API_BASE } from './config';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authUser, setAuthUser] = useState(null); // stores {name, email, picture, provider}
  const [locationAsked, setLocationAsked] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // {lat, lng, accuracy, ...}
  const [userLocationName, setUserLocationName] = useState("");
  const [userRole, setUserRole] = useState('user'); // 'user' or 'influencer'
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
  const [userType, setUserType] = useState('customer');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }
    if (savedLang) setLang(savedLang);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sync user and location to MySQL Backend
  useEffect(() => {
    const syncUser = async () => {
      if (authUser && userLocationName && userLocation) {
        try {
          // 1. Save user with location data
          await fetch(`${API_BASE}/api/save-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              google_id: authUser.id || null, 
              name: authUser.name,
              email: authUser.email,
              picture: authUser.picture,
              provider: authUser.provider,
              last_location_name: userLocationName,
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              location_accuracy: userLocation.accuracy || null
            })
          });

          // 2. Log login session with device info
          const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
          };

          await fetch(`${API_BASE}/api/log-session`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              email: authUser.email,
              provider: authUser.provider,
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              location_accuracy: userLocation.accuracy || null,
              location_name: userLocationName,
              device_info: deviceInfo
            })
          });

          console.log(`✅ User synced: ${authUser.email} @ ${userLocation.lat}, ${userLocation.lng}`);
        } catch (err) {
          console.error("❌ Database sync failed:", err);
        }
      }
    };
    syncUser();
  }, [authUser, userLocationName, userLocation]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setLocationAsked(false);
    setUserRole('user');
    setUserType('customer');
    setCurrentTab('home');
    localStorage.removeItem('provider');
  };

  // 1. Simulate coming from email link
  const simulateInfluencerLogin = () => {
    setUserRole('influencer');
    setAuthUser({ name: "Influencer", email: "influencer@example.com", provider: 'email' });
    setLocationAsked(true); // skip location ask for this direct dashboard jump
  };

  const handleLocationDone = async (loc) => {
    console.log('📍 Location acquired:', loc);
    setUserLocation(loc);
    setLocationAsked(true);

    // If location was skipped or is default, still use it but mark it
    if (loc.skipped || loc.isDefault) {
      console.log('⚠️ Using default location');
      setUserLocationName("Default Location (Colombo)");
      return;
    }

    try {
      // Use Google Maps API for reverse geocoding (better than Nominatim)
      // Alternative: Nominatim (OpenStreetMap) - no API key needed
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&zoom=16&addressdetails=1`);
      const data = await response.json();
      
      if (data.address) {
        const addr = data.address;
        const parts = [];
        
        // Build address from most specific to least specific
        if (addr.road) parts.push(addr.road);
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.county) parts.push(addr.county);
        
        const displayName = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(', ') || "Current Location";
        
        console.log(`✅ Address retrieved: ${displayName}`);
        setUserLocationName(displayName);
      } else {
        setUserLocationName("Current Location");
      }
    } catch (err) {
      console.error("❌ Geocoding failed:", err);
      setUserLocationName("Current Location");
    }
  };

  if (showSplash) return <Splash />;
  if (showOnboarding) return <Onboarding onFinish={() => setShowOnboarding(false)} />;
  if (!authUser) {
    return <Auth 
      onLogin={(userObj) => {
        setAuthUser(userObj);
        setUserType(userObj?.userType || 'customer');
      }} 
      lang={lang} 
    />;
  }
  
  // DEALER DASHBOARD
  if (userType === 'dealer') {
    return (
      <ErrorBoundary>
        <DealerDashboard 
          dealerInfo={authUser}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  // SERVICE PROVIDER DASHBOARD
  if (userType === 'provider') {
    return (
      <ServiceProviderDashboard 
        provider={authUser}
        onLogout={handleLogout}
      />
    );
  }
  
  // Ask for real geolocation right after login (customer only)
  if (!locationAsked) {
    console.log('📍 Showing LocationPrompt. authUser:', authUser?.email, 'userType:', userType);
    return (
      <ErrorBoundary>
        <LocationPrompt onLocationGranted={handleLocationDone} />
      </ErrorBoundary>
    );
  }

  // If specifically an Influencer, show their isolated Dashboard view
  if (userRole === 'influencer') {
    return (
      <InfluencerDashboard 
        onLogout={handleLogout} 
        lang={lang} 
        toggleTheme={toggleTheme} 
        theme={theme}
        authUser={authUser}
      />
    );
  }

  // Normal Customer App Shell
  const renderContent = () => {
    switch (currentTab) {
      case 'home': return (
        <div>
          <NearbyProducts 
            userEmail={authUser?.email} 
            userLocation={userLocation}
            onOrderPlaced={() => null}
          />
          <Home onDealClick={setSelectedDeal} lang={lang} userLocation={userLocation} />
        </div>
      );
      case 'explore': return <Explore onDealClick={setSelectedDeal} lang={lang} />;
      case 'influencers': return <Influencers lang={lang} onSimulateVerify={simulateInfluencerLogin} />;
      case 'profile': return <Profile theme={theme} toggleTheme={toggleTheme} lang={lang} changeLang={changeLang} onLogout={handleLogout} userLocation={userLocation} authUser={authUser} userLocationName={userLocationName} />;
      default: return <Home onDealClick={setSelectedDeal} lang={lang} userLocation={userLocation} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-shell animate-fade-in">
        <Navigation currentTab={currentTab} setTab={setCurrentTab} lang={lang} />
        <main className="main-content">
          <div className="page page-mobile-pad animate-fade-in" key={currentTab}>
            {renderContent()}
          </div>
        </main>
        {selectedDeal && (
          <DealDetail deal={selectedDeal} onClose={() => setSelectedDeal(null)} lang={lang} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
