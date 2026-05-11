// Backend is deployed on Render. This URL works for both the web app and Android app.
export const API_BASE_URL = 'https://resume-backend-v38r.onrender.com';

export const getApiUrl = (endpoint: string) => {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};
