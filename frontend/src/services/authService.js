import api from './api';

export const authService = {
  sendOtp: async (phone, mode) => {
    const response = await api.post('/auth/request-otp', { phone, mode });
    return response.data;
  },

  // Now dynamically handles Login vs Register
  verifyOtp: async (phone, otp, name, role) => {
    const payload = { phone, otp };
    
    // Only attach name and role if the user is registering
    if (name) payload.name = name;
    if (role) payload.role = role;

    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};