import api from './api';

const templateService = {
  getTemplates: async (goal) => {
    try {
      const params = goal ? { goal } : {};
      const response = await api.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao carregar templates');
    }
  },

  importTemplate: async (id) => {
    try {
      const response = await api.post(`/templates/${id}/import`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao importar template');
    }
  },
};

export default templateService;
