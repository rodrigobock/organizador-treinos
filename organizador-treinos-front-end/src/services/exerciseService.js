import api from './api';

const exerciseService = {
  // POST /workouts/:workoutId/exercises - Adicionar exercício
  createExercise: async (workoutId, name) => {
    try {
      const response = await api.post(`/workouts/${workoutId}/exercises`, {
        name,
      });
      return response.data; // ExerciseResponse
    } catch (error) {
      throw error.message || 'Erro ao criar exercício';
    }
  },

  // PUT /workouts/:workoutId/exercises/:exerciseId - Atualizar exercício
  updateExercise: async (workoutId, exerciseId, name) => {
    try {
      const response = await api.put(
        `/workouts/${workoutId}/exercises/${exerciseId}`,
        { name }
      );
      return response.data; // ExerciseResponse
    } catch (error) {
      throw error.message || 'Erro ao atualizar exercício';
    }
  },

  // PATCH /workouts/:workoutId/exercises/:exerciseId/toggle - Marcar como feito/não feito
  toggleExercise: async (workoutId, exerciseId) => {
    try {
      const response = await api.patch(
        `/workouts/${workoutId}/exercises/${exerciseId}/toggle`
      );
      return response.data; // ExerciseResponse com status atualizado
    } catch (error) {
      throw error.message || 'Erro ao marcar exercício';
    }
  },

  // DELETE /workouts/:workoutId/exercises/:exerciseId - Deletar exercício
  deleteExercise: async (workoutId, exerciseId) => {
    try {
      await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
      return true;
    } catch (error) {
      throw error.message || 'Erro ao deletar exercício';
    }
  },
};

export default exerciseService;
