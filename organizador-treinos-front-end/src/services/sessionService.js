import api from './api';

const sessionService = {
  startSession: async (workoutId) => {
    const response = await api.post(`/workouts/${workoutId}/sessions/start`);
    return response.data;
  },

  endSession: async (workoutId, sessionId) => {
    const response = await api.patch(`/workouts/${workoutId}/sessions/${sessionId}/end`);
    return response.data;
  },

  getActiveSession: async (workoutId) => {
    try {
      const response = await api.get(`/workouts/${workoutId}/sessions/active`);
      return response.status === 204 ? null : response.data;
    } catch {
      return null;
    }
  },
};

export default sessionService;
