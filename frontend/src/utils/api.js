import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eyeflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for global error catching
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // JWT token expired or invalid
      if (status === 401) {
        localStorage.removeItem('eyeflow_token');
        localStorage.removeItem('eyeflow_user');
        // Prevent looping redirect if already on login or public sharing pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/invoices/') && 
            !window.location.pathname.includes('/prescriptions/')) {
          window.location.href = '/login?expired=true';
        }
      }

      // Subscription expired handler
      if (status === 403 && data.isSubscriptionExpired) {
        // We let the components handle the UI banner or redirect.
        // We append the flag to the error so pages can inspect it.
        error.isSubscriptionExpired = true;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
