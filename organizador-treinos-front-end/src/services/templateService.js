import api from './api';

const templateService = {
  getTemplates: async (category, gender, muscleGroup, equipment) => {
    try {
      const params = {};
      if (category) params.category = category;
      if (gender) params.gender = gender;
      if (muscleGroup) params.muscleGroup = muscleGroup;
      if (equipment) params.equipment = equipment;
      const response = await api.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao carregar biblioteca de treinos');
    }
  },

  importTemplate: async (id) => {
    try {
      const response = await api.post(`/templates/${id}/import`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao importar treino');
    }
  },
};

export default templateService;
