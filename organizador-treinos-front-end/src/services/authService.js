import api from './api';

const authService = {
  signup: async (name, email, password) => {
    const preferredLocale = localStorage.getItem('i18n_lang') || 'pt-BR';
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        preferredLocale,
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao registrar',
        response: error.response,
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao fazer login',
        response: error.response,
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.message || 'Erro ao obter usuário';
    }
  },

  updateUser: async (name) => {
    try {
      const response = await api.put('/users/me', {
        name,
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao atualizar usuário',
        response: error.response,
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw {
        message: error.message || 'Erro ao solicitar redefinição de senha',
        response: error.response,
      };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw {
        message: error.message || 'Erro ao redefinir senha',
        response: error.response,
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
    }
  },
};

export default authService;
