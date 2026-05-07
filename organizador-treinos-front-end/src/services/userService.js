import api from './api';

const userService = {
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/users/me', {
      data: { password },
    });
    return response.data;
  },
};

export default userService;
