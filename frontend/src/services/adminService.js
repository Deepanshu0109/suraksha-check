import api from './api';

export const adminService = {
  getPendingPatterns: async () => {
    const response = await api.get('/admin/pending-patterns');
    return response.data;
  },

  approvePattern: async (id) => {
    const response = await api.post(`/admin/patterns/${id}/approve`);
    return response.data;
  },

  rejectPattern: async (id) => {
    const response = await api.post(`/admin/patterns/${id}/reject`);
    return response.data;
  }
};