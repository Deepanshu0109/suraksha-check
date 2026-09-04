import api from './api';

export const guardianService = {
  // Primary User: Fetch linked guardians
  getMyGuardians: async () => {
    const response = await api.get('/guardians/my-guardians');
    return response.data;
  },

  // Primary User: Send an invite
  inviteGuardian: async (guardianPhone) => {
    const response = await api.post('/guardians/invite', { guardianPhone });
    return response.data;
  },

  // Guardian: Fetch pending invites
  getMyInvitations: async () => {
    const response = await api.get('/guardians/my-invitations');
    return response.data;
  },

  // Guardian: Accept an invite
  acceptInvite: async (linkId) => {
    const response = await api.post('/guardians/accept', { linkId });
    return response.data;
  },

  removeLink: async (linkId) => {
    const response = await api.delete(`/guardians/remove-link/${linkId}`);
    return response.data;
  },
  requestVerification: async (checkId) => {
    const response = await api.post('/guardians/request-verification', { checkId });
    return response.data;
  },
  // Fetch verification requests sent to this guardian
  getPendingRequests: async () => {
    const response = await api.get('/guardians/pending-requests');
    return response.data;
  },

  // Guardian submits a vote (Safe, Suspicious, Scam)
  submitResponse: async (requestId, reaction, comment = '') => {
    const response = await api.post('/guardians/submit-response', { requestId, reaction, comment });
    return response.data;
  }
};