// API Configuration
// This file centralizes the API base URL logic for both local and production environments.

const getApiBaseUrl = () => {
  // Mobile app or remote testing via ngrok (check FIRST before Vercel)
  if (typeof window !== 'undefined' && import.meta.env.VITE_NGROK_URL) {
    return import.meta.env.VITE_NGROK_URL;
  }
  
  // Development with explicit API URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development with proxy (local)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '';
  }
  
  // Production environment (Vercel) - requires backend at same domain or VITE_NGROK_URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.warn('⚠️ No VITE_NGROK_URL configured for production. API calls may fail.');
    return '';
  }
  
  // Default: use relative paths (relies on Vite proxy or same-domain API)
  return '';
};

export const API_BASE = getApiBaseUrl();

// For debugging
if (typeof window !== 'undefined') {
  console.log(`🔌 API_BASE: ${API_BASE || '(relative paths)'}`);
  console.log(`🌐 Hostname: ${window.location.hostname}`);
  console.log(`📱 Environment: ${import.meta.env.MODE}`);
}
