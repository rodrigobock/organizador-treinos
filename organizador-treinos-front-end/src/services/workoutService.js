import api from './api';

const workoutService = {
  // GET /workouts - Listar meus treinos
  getMyWorkouts: async () => {
    try {
      const response = await api.get('/workouts');
      return response.data; // Array de WorkoutResponse
    } catch (error) {
      throw error.message || 'Erro ao carregar treinos';
    }
  },

  // GET /workouts/shared - Treinos compartilhados comigo
  getSharedWorkouts: async () => {
    try {
      const response = await api.get('/workouts/shared');
      return response.data; // Array de WorkoutResponse
    } catch (error) {
      throw error.message || 'Erro ao carregar treinos compartilhados';
    }
  },

  // GET /workouts/public - Treinos públicos
  getPublicWorkouts: async () => {
    try {
      const response = await api.get('/workouts/public');
      return response.data; // Array de WorkoutResponse
    } catch (error) {
      throw error.message || 'Erro ao carregar treinos públicos';
    }
  },

  // GET /workouts/:id - Obter treino com exercícios
  getWorkout: async (id) => {
    try {
      const response = await api.get(`/workouts/${id}`);
      return response.data; // WorkoutResponse com exercises
    } catch (error) {
      throw error.message || 'Erro ao carregar treino';
    }
  },

  // POST /workouts - Criar novo treino
  createWorkout: async (name, isPublic = false) => {
    try {
      const response = await api.post('/workouts', {
        name,
        isPublic,
      });
      return response.data; // WorkoutResponse
    } catch (error) {
      throw error.message || 'Erro ao criar treino';
    }
  },

  // PUT /workouts/:id - Atualizar treino
  updateWorkout: async (id, name, isPublic) => {
    try {
      const response = await api.put(`/workouts/${id}`, {
        name,
        isPublic,
      });
      return response.data; // WorkoutResponse
    } catch (error) {
      throw error.message || 'Erro ao atualizar treino';
    }
  },

  // DELETE /workouts/:id - Deletar treino
  deleteWorkout: async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      return true;
    } catch (error) {
      throw error.message || 'Erro ao deletar treino';
    }
  },

  // POST /workouts/:id/share - Compartilhar treino
  shareWorkout: async (id, email, permission = 'READ') => {
    try {
      const response = await api.post(`/workouts/${id}/share`, {
        email,
        permission, // 'READ' ou 'EDIT'
      });
      return response.data;
    } catch (error) {
      throw error.message || 'Erro ao compartilhar treino';
    }
  },

  // DELETE /workouts/:id/share/:userId - Revogar acesso
  revokeShare: async (workoutId, userId) => {
    try {
      await api.delete(`/workouts/${workoutId}/share/${userId}`);
      return true;
    } catch (error) {
      throw error.message || 'Erro ao revogar compartilhamento';
    }
  },

  // PUT /workouts/reorder - Reordenar treinos
  reorderWorkouts: async (workoutIds) => {
    try {
      await api.put('/workouts/reorder', { workoutIds });
      return true;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erro ao reordenar treinos';
    }
  },

  // POST /workouts/import/analyze - Verificar duplicatas antes de importar
  analyzeImport: async (workouts) => {
    try {
      const response = await api.post('/workouts/import/analyze', { workouts });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erro ao analisar importação';
    }
  },

  // POST /workouts/import/confirm - Executar importação com decisões do usuário
  confirmImport: async (items) => {
    try {
      const response = await api.post('/workouts/import/confirm', items);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erro ao importar treinos';
    }
  },
};

export default workoutService;
