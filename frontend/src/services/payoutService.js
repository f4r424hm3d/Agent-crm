import apiClient from './apiClient';

export const payoutService = {
  // Get all payouts
  getPayouts: async (params = {}) => {
    const response = await apiClient.get('/payouts', { params });
    return response.data;
  },

  // Get payout requests
  getPayoutRequests: async () => {
    const response = await apiClient.get('/payouts/requests');
    return response.data;
  },

  // Get payout by ID
  getPayoutById: async (id) => {
    const response = await apiClient.get(`/payouts/${id}`);
    return response.data;
  },

  // Request payout
  requestPayout: async (data) => {
    const response = await apiClient.post('/payouts/request', data);
    return response.data;
  },

  // Approve payout
  approvePayout: async (id, paymentReference) => {
    const response = await apiClient.post(`/payouts/${id}/approve`, { paymentReference });
    return response.data;
  },

  // Reject payout
  rejectPayout: async (id, reason) => {
    const response = await apiClient.post(`/payouts/${id}/reject`, { reason });
    return response.data;
  },

  // Get agent earnings
  getAgentEarnings: async (agentId) => {
    const response = await apiClient.get(`/payouts/earnings/${agentId}`);
    return response.data;
  },

  // Get payout history
  getPayoutHistory: async (agentId) => {
    const response = await apiClient.get(`/payouts/history/${agentId}`);
    return response.data;
  },
};

export default payoutService;
