// API Configuration
// This file centralizes the API base URL logic for both local and production environments.

const getApiBaseUrl = () => {
  // Production Vercel: API is same-domain at /api (from vercel.json routes)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('✅ Using Vercel production backend');
    return '';
  }
  
  // Development with ngrok tunnel
  if (typeof window !== 'undefined' && import.meta.env.VITE_NGROK_URL) {
    return import.meta.env.VITE_NGROK_URL;
  }
  
  // Development with explicit API URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development with proxy (localhost:5173 -> localhost:5001)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('✅ Using local development backend via Vite proxy');
    return '';
  }
  
  // Default: use relative paths
  return '';
};

export const API_BASE = getApiBaseUrl();

// For debugging
if (typeof window !== 'undefined') {
  console.log(`🔌 API_BASE: ${API_BASE || '(relative paths - same domain)'}`);
  console.log(`🌐 Hostname: ${window.location.hostname}`);
  console.log(`📱 Environment: ${import.meta.env.MODE}`);
}
