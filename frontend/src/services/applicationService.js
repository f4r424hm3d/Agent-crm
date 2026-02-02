import apiClient from './apiClient';

export const applicationService = {
  // Get all applications
  getApplications: async (params = {}) => {
    const response = await apiClient.get('/applications', { params });
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id) => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  // Create application
  createApplication: async (data) => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  // Update application
  updateApplication: async (id, data) => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  // Delete application
  deleteApplication: async (id) => {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data;
  },

  // Submit application
  submitApplication: async (id) => {
    const response = await apiClient.post(`/applications/${id}/submit`);
    return response.data;
  },

  // Update status
  updateStatus: async (id, status, note) => {
    const response = await apiClient.put(`/applications/${id}/status`, { status, note });
    return response.data;
  },

  // Upload document
  uploadDocument: async (id, formData) => {
    const response = await apiClient.post(`/applications/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get status history
  getStatusHistory: async (id) => {
    const response = await apiClient.get(`/applications/${id}/history`);
    return response.data;
  },

  // Get application commission
  getApplicationCommission: async (id) => {
    const response = await apiClient.get(`/applications/${id}/commission`);
    return response.data;
  },

  // Accept offer
  acceptOffer: async (id) => {
    const response = await apiClient.post(`/applications/${id}/accept-offer`);
    return response.data;
  },

  // Mark fee paid
  markFeePaid: async (id, paymentDetails) => {
    const response = await apiClient.post(`/applications/${id}/fee-paid`, paymentDetails);
    return response.data;
  },

  // Get status counts
  getStatusCounts: async () => {
    const response = await apiClient.get('/applications/stats/status-counts');
    return response.data;
  },
};

export default applicationService;
