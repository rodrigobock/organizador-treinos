import api from './api';

function toError(error, fallback) {
  const err = new Error(error.response?.data?.message || error.message || fallback);
  err.response = error.response;
  return err;
}

const exerciseService = {
  createExercise: async (workoutId, name) => {
    try {
      const response = await api.post(`/workouts/${workoutId}/exercises`, { name });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao criar exercício');
    }
  },

  updateExercise: async (workoutId, exerciseId, name) => {
    try {
      const response = await api.put(
        `/workouts/${workoutId}/exercises/${exerciseId}`,
        { name }
      );
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao atualizar exercício');
    }
  },

  toggleExercise: async (workoutId, exerciseId) => {
    try {
      const response = await api.patch(
        `/workouts/${workoutId}/exercises/${exerciseId}/toggle`
      );
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao marcar exercício');
    }
  },

  deleteExercise: async (workoutId, exerciseId) => {
    try {
      await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
      return true;
    } catch (error) {
      throw toError(error, 'Erro ao deletar exercício');
    }
  },

  logExecution: async (workoutId, exerciseId, data) => {
    try {
      const response = await api.post(
        `/workouts/${workoutId}/exercises/${exerciseId}/logs`,
        data
      );
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao registrar execução');
    }
  },

  getHistory: async (workoutId, exerciseId) => {
    try {
      const response = await api.get(
        `/workouts/${workoutId}/exercises/${exerciseId}/logs`
      );
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar histórico');
    }
  },
};

export default exerciseService;
