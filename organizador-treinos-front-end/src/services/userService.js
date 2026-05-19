import api from './api';

const userService = {
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/me/password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao alterar senha',
        response: error.response,
      };
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/users/me', {
        data: { password },
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao deletar conta',
        response: error.response,
      };
    }
  },
};

export default userService;
