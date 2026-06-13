const isNative = 
  window.location.protocol === 'file:' || 
  window.location.protocol === 'capacitor:' || 
  window.location.hostname === 'localhost' ||
  !!(window as any).Capacitor;

export const API_BASE_URL = 'https://29752835-0400-467d-9963-386d7b517de.vercel.app';

export const getApiUrl = (endpoint: string) => {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getAuthUploadHeaders = () => {
  const token = localStorage.getItem('token') || '';
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

