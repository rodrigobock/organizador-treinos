import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 Axios Interceptor: Injeta JWT em todos os requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Axios Interceptor: Trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro do servidor
      const { status, data } = error.response;

      if (status === 401) {
        // Token inválido/expirado
        localStorage.removeItem('user_token');
        window.location.href = '/signin';
      }

      if (status === 403) {
        // Acesso negado
        console.error('Acesso negado:', data.message);
      }

      if (status === 404) {
        // Não encontrado
        console.error('Não encontrado:', data.message);
      }

      return Promise.reject({
        message: data.message || 'Erro ao processar requisição',
        status,
        data,
      });
    }

    if (error.request) {
      // Erro de rede
      return Promise.reject({
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0,
      });
    }

    // Erro desconhecido
    return Promise.reject({
      message: error.message || 'Erro desconhecido',
      status: 0,
    });
  }
);

export default api;
