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
    const token = localStorage.getItem('eyelitz_token');
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
    // Redirect if server is offline (Network Error) or returns 5xx (Server Error)
    if (!error.response || (error.response.status >= 500 && error.response.status <= 504)) {
      if (window.location.pathname !== '/service-unavailable') {
        window.location.href = '/service-unavailable';
      }
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      
      // JWT token expired or invalid
      if (status === 401) {
        localStorage.removeItem('eyelitz_token');
        localStorage.removeItem('eyelitz_user');
        // Prevent looping redirect if already on login or public sharing pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/invoices/') && 
            !window.location.pathname.includes('/prescriptions/')) {
          window.location.href = '/login?expired=true';
        }
      }

      // Subscription expired handler
      if (status === 403 && data.isSubscriptionExpired) {
        error.isSubscriptionExpired = true;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
