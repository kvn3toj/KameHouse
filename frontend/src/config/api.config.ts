// API Configuration for network access
// Automatically detects environment and returns appropriate API URL
export const getApiUrl = (): string => {
  const hostname = window.location.hostname;

  // Production environment (Vercel)
  if (hostname.includes('vercel.app') || import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }

  // Development: localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // Development: local network IP
  return 'http://192.168.1.30:3000/api';
};

export const API_BASE_URL = getApiUrl();
