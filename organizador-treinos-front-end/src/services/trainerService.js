import api from './api';

function toError(error, fallback) {
  const err = new Error(error.response?.data?.message || error.message || fallback);
  err.response = error.response;
  return err;
}

const trainerService = {
  getStudents: async () => {
    try {
      const response = await api.get('/trainer/students');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar alunos');
    }
  },

  linkStudent: async (email) => {
    try {
      const response = await api.post('/trainer/students', { email });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao vincular aluno');
    }
  },

  unlinkStudent: async (studentId) => {
    try {
      await api.delete(`/trainer/students/${studentId}`);
      return true;
    } catch (error) {
      throw toError(error, 'Erro ao desvincular aluno');
    }
  },
};

export default trainerService;
