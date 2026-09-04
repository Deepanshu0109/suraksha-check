import api from './api';

export const checkService = {
  getMyChecks: async () => {
    const response = await api.get('/checks');
    return response.data;
  }
};