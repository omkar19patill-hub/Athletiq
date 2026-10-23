import axios from 'axios';

const AUTH_KEYS = ['token', 'refreshToken', 'user'];

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// One refresh at a time: concurrent 401s wait on the same promise.
// Refresh tokens are rotated server-side, so a second parallel refresh would fail.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshPromise = (refreshToken
      ? axios.post('/api/v1/auth/refresh-token', { refreshToken }).then((res) => {
          if (!res.data?.success) throw new Error('Refresh failed');
          const { accessToken, refreshToken: next } = res.data.data;
          localStorage.setItem('token', accessToken);
          if (next) localStorage.setItem('refreshToken', next);
          return accessToken;
        })
      : Promise.reject(new Error('No refresh token'))
    ).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const endSession = () => {
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Login/register/refresh 401s mean bad credentials, not an expired session.
const isAuthEndpoint = (url = '') => url.includes('/auth/');

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url) &&
      localStorage.getItem('token')
    ) {
      originalRequest._retry = true; // at most one retry per request
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // goes through the same unwrap as the first attempt
      } catch {
        endSession();
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      }
    }

    const message = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
