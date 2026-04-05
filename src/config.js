// API Configuration
// This file centralizes the API base URL logic for both local and production environments.

const getApiBaseUrl = () => {
  // 1. If we are on localhost, use the Vite proxy (empty string)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '';
  }

  // 2. Otherwise, use the environment variable baked in at build time
  // If the environment variable is missing, fallback to the hardcoded ngrok URL for now
  return import.meta.env.VITE_API_BASE_URL || 'https://comeatable-tobi-bolometrically.ngrok-free.dev';
};

export const API_BASE = getApiBaseUrl();
