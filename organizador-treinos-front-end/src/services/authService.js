import api from './api';

function toError(error, fallback) {
  const err = new Error(error.response?.data?.message || error.message || fallback);
  err.response = error.response;
  return err;
}

const authService = {
  signup: async (name, email, password, role, gender) => {
    const preferredLocale = localStorage.getItem('i18n_lang') || 'pt-BR';
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        preferredLocale,
        role: role || 'STUDENT',
        gender: gender || 'UNISEX',
      });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao registrar');
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
      throw toError(error, 'Erro ao fazer login');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao obter usuário');
    }
  },

  updateUser: async (name) => {
    try {
      const response = await api.put('/users/me', { name });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao atualizar usuário');
    }
  },

  forgotPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw toError(error, 'Erro ao solicitar redefinição de senha');
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw toError(error, 'Erro ao redefinir senha');
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
