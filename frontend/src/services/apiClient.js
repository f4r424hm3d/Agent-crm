import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for network errors (no response from server)
    if (!error.response) {
      // Dispatch a custom event for global network error handling
      window.dispatchEvent(new CustomEvent('app:network-error', {
        detail: {
          message: 'Unable to connect to server. Please check your internet connection and try again.',
          code: error.code
        }
      }));
    } else if (error.response.status === 401 || (error.response.status === 403 && !error.response.data.requiredRoles)) {
      // Don't redirect if it's a login attempt failure (Invalid credentials)
      const isLoginRequest = error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/agent-login') ||
        error.config.url.includes('/auth/student-login');

      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // Check for specific logout reason
      if (error.response.data && error.response.data.reason) {
        localStorage.setItem('logoutReason', error.response.data.reason);
      }

      // Extract role before clearing to maintain redirect context
      let roleRedirect = '';
      try {
        // First try to get role from server response
        let role = error.response.data?.role;

        // Fallback to localStorage
        if (!role) {
          const user = JSON.parse(localStorage.getItem('user'));
          role = user?.role;
        }

        if (role) {
          roleRedirect = `?role=${role.toUpperCase()}`;
        }
      } catch (e) {
        console.error('Error determining role for redirect', e);
      }

      // Unauthorized or Account Blocked - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch event or redirect
      window.location.href = `/login${roleRedirect}`;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
