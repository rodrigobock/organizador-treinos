import axios from 'axios';
import i18n from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'user_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bare client (no interceptors) for the refresh call itself, to avoid
// recursive 401 handling.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Single in-flight refresh promise so concurrent 401s share one refresh.
let refreshInFlight = null;

const refreshToken = () => {
  if (refreshInFlight) return refreshInFlight;

  const expired = localStorage.getItem(TOKEN_KEY);
  if (!expired) {
    return Promise.reject(new Error('No token to refresh'));
  }

  refreshInFlight = refreshClient
    .post('/auth/refresh', { token: expired })
    .then((res) => {
      const newToken = res.data?.token;
      if (!newToken) throw new Error('Refresh response missing token');
      localStorage.setItem(TOKEN_KEY, newToken);
      return newToken;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const redirectToSignin = () => {
  localStorage.removeItem(TOKEN_KEY);
  if (window.location.pathname !== '/signin' && window.location.pathname !== '/') {
    window.location.href = '/signin';
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem('i18n_lang') || 'pt-BR';
    config.headers['Accept-Language'] = lang;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const originalRequest = error.config;

      // Don't try to refresh on auth endpoints themselves — a 401 there
      // means bad credentials, not an expired session.
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

      if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          redirectToSignin();
          return Promise.reject({
            message: i18n.t('errors.error.session_expired', { ns: 'common' }),
            status: 401,
          });
        }
      }

      if (status === 401) {
        redirectToSignin();
      }

      if (status === 403) {
        console.error('Acesso negado:', data?.message);
      }

      if (status === 404) {
        console.error('Não encontrado:', data?.message);
      }

      return Promise.reject({
        message: data?.message || i18n.t('errors.error.processing', { ns: 'common' }),
        status,
        data,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: i18n.t('errors.error.connection', { ns: 'common' }),
        status: 0,
      });
    }

    return Promise.reject({
      message: error.message || i18n.t('errors.error.unknown', { ns: 'common' }),
      status: 0,
    });
  }
);

export default api;
