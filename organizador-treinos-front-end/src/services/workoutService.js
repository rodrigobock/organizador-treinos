import api from './api';

function toError(error, fallback) {
  const err = new Error(error.response?.data?.message || error.message || fallback);
  err.response = error.response;
  return err;
}

const workoutService = {
  getMyWorkouts: async () => {
    try {
      const response = await api.get('/workouts');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar treinos');
    }
  },

  getMyWorkoutsPaged: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/workouts', { params: { page, size } });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar treinos');
    }
  },

  getSharedWorkouts: async () => {
    try {
      const response = await api.get('/workouts/shared');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar treinos compartilhados');
    }
  },

  getPublicWorkouts: async () => {
    try {
      const response = await api.get('/workouts/public');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar treinos públicos');
    }
  },

  getWorkout: async (id) => {
    try {
      const response = await api.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar treino');
    }
  },

  createWorkout: async (name, isPublic = false) => {
    try {
      const response = await api.post('/workouts', { name, isPublic });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao criar treino');
    }
  },

  updateWorkout: async (id, name, isPublic) => {
    try {
      const response = await api.put(`/workouts/${id}`, { name, isPublic });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao atualizar treino');
    }
  },

  deleteWorkout: async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      return true;
    } catch (error) {
      throw toError(error, 'Erro ao deletar treino');
    }
  },

  shareWorkout: async (id, email, permission = 'READ') => {
    try {
      const response = await api.post(`/workouts/${id}/share`, { emails: [email], permission });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao compartilhar treino');
    }
  },

  bulkShare: async (workoutId, emails, permission = 'READ') => {
    try {
      const response = await api.post(`/workouts/${workoutId}/share`, { emails, permission });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao compartilhar treino');
    }
  },

  revokeShare: async (workoutId, userId) => {
    try {
      await api.delete(`/workouts/${workoutId}/share/${userId}`);
      return true;
    } catch (error) {
      throw toError(error, 'Erro ao revogar compartilhamento');
    }
  },

  getSharedByMe: async () => {
    try {
      const response = await api.get('/workouts/shared-by-me');
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao carregar compartilhamentos');
    }
  },

  reorderWorkouts: async (workoutIds) => {
    try {
      await api.put('/workouts/reorder', { workoutIds });
      return true;
    } catch (error) {
      throw toError(error, 'Erro ao reordenar treinos');
    }
  },

  analyzeImport: async (workouts) => {
    try {
      const response = await api.post('/workouts/import/analyze', { workouts });
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao analisar importação');
    }
  },

  confirmImport: async (items) => {
    try {
      const response = await api.post('/workouts/import/confirm', items);
      return response.data;
    } catch (error) {
      throw toError(error, 'Erro ao importar treinos');
    }
  },
};

export default workoutService;
