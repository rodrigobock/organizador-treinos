import api from './api';

const workoutService = {
  // GET /workouts - Listar meus treinos (sem paginação)
  getMyWorkouts: async () => {
    try {
      const response = await api.get('/workouts');
      return response.data;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao carregar treinos',
        response: error.response,
      };
    }
  },

  // GET /workouts?page=0&size=10 - Listar meus treinos com paginação
  getMyWorkoutsPaged: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/workouts', { params: { page, size } });
      return response.data; // PagedResponse { content, page, size, totalElements, totalPages }
    } catch (error) {
      throw {
        message: error.message || 'Erro ao carregar treinos',
        response: error.response,
      };
    }
  },

  // GET /workouts/shared - Treinos compartilhados comigo
  getSharedWorkouts: async () => {
    try {
      const response = await api.get('/workouts/shared');
      return response.data; // Array de WorkoutResponse
    } catch (error) {
      throw {
        message: error.message || 'Erro ao carregar treinos compartilhados',
        response: error.response,
      };
    }
  },

  // GET /workouts/public - Treinos públicos
  getPublicWorkouts: async () => {
    try {
      const response = await api.get('/workouts/public');
      return response.data; // Array de WorkoutResponse
    } catch (error) {
      throw {
        message: error.message || 'Erro ao carregar treinos públicos',
        response: error.response,
      };
    }
  },

  // GET /workouts/:id - Obter treino com exercícios
  getWorkout: async (id) => {
    try {
      const response = await api.get(`/workouts/${id}`);
      return response.data; // WorkoutResponse com exercises
    } catch (error) {
      throw {
        message: error.message || 'Erro ao carregar treino',
        response: error.response,
      };
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
      throw {
        message: error.message || 'Erro ao criar treino',
        response: error.response,
      };
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
      throw {
        message: error.message || 'Erro ao atualizar treino',
        response: error.response,
      };
    }
  },

  // DELETE /workouts/:id - Deletar treino
  deleteWorkout: async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      return true;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao deletar treino',
        response: error.response,
      };
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
      throw {
        message: error.message || 'Erro ao compartilhar treino',
        response: error.response,
      };
    }
  },

  // DELETE /workouts/:id/share/:userId - Revogar acesso
  revokeShare: async (workoutId, userId) => {
    try {
      await api.delete(`/workouts/${workoutId}/share/${userId}`);
      return true;
    } catch (error) {
      throw {
        message: error.message || 'Erro ao revogar compartilhamento',
        response: error.response,
      };
    }
  },

  // PUT /workouts/reorder - Reordenar treinos
  reorderWorkouts: async (workoutIds) => {
    try {
      await api.put('/workouts/reorder', { workoutIds });
      return true;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Erro ao reordenar treinos',
        response: error.response,
      };
    }
  },

  // POST /workouts/import/analyze - Verificar duplicatas antes de importar
  analyzeImport: async (workouts) => {
    try {
      const response = await api.post('/workouts/import/analyze', { workouts });
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Erro ao analisar importação',
        response: error.response,
      };
    }
  },

  // POST /workouts/import/confirm - Executar importação com decisões do usuário
  confirmImport: async (items) => {
    try {
      const response = await api.post('/workouts/import/confirm', items);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Erro ao importar treinos',
        response: error.response,
      };
    }
  },
};

export default workoutService;
