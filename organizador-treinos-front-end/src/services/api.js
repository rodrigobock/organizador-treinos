import axios from 'axios';
import i18n from '../i18n';

const raw = process.env.REACT_APP_API_URL;
const API_BASE_URL = raw && raw.trim()
  ? raw.trim()
  : process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshInFlight = null;

const doTokenRefresh = () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = refreshClient
    .post('/auth/refresh', {})
    .then(() => {
      return true;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const redirectToSignin = () => {
  refreshClient.post('/auth/logout', {}).catch(() => {});
  if (window.location.pathname !== '/signin' && window.location.pathname !== '/') {
    window.location.href = '/signin';
  }
};

api.interceptors.request.use(
  (config) => {
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

      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

      if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await doTokenRefresh();
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
