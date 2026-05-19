import api from './api';

function toError(error, fallback) {
  const err = new Error(error.response?.data?.message || error.message || fallback);
  err.response = error.response;
  return err;
}

const userService = {
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/me/password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao alterar senha');
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/users/me', { data: { password } });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao deletar conta');
    }
  },
};

export default userService;
