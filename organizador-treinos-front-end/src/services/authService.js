import api from './api';

const authService = {
  // POST /auth/signup
  signup: async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
      });
      return response.data; // { token, user: { id, name, email } }
    } catch (error) {
      throw error.message || 'Erro ao registrar';
    }
  },

  // POST /auth/login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data; // { token, user: { id, name, email } }
    } catch (error) {
      throw error.message || 'Erro ao fazer login';
    }
  },

  // GET /users/me
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data; // { id, name, email }
    } catch (error) {
      throw error.message || 'Erro ao obter usuário';
    }
  },

  // PUT /users/me
  updateUser: async (name) => {
    try {
      const response = await api.put('/users/me', {
        name,
      });
      return response.data;
    } catch (error) {
      throw error.message || 'Erro ao atualizar usuário';
    }
  },

  // POST /auth/forgot-password
  forgotPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error.message || 'Erro ao solicitar redefinição de senha';
    }
  },

  // POST /auth/reset-password
  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw error.message || 'Erro ao redefinir senha';
    }
  },

  // Logout (local)
  logout: () => {
    localStorage.removeItem('user_token');
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('user_token');
  },

  // Obter token armazenado
  getToken: () => {
    return localStorage.getItem('user_token');
  },

  // Armazenar token
  setToken: (token) => {
    if (token) {
      localStorage.setItem('user_token', token);
    } else {
      localStorage.removeItem('user_token');
    }
  },
};

export default authService;
