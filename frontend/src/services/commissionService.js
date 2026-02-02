import apiClient from './apiClient';

export const commissionService = {
  // Get all commissions
  getCommissions: async (params = {}) => {
    const response = await apiClient.get('/commissions', { params });
    return response.data;
  },

  // Get commission by ID
  getCommissionById: async (id) => {
    const response = await apiClient.get(`/commissions/${id}`);
    return response.data;
  },

  // Create commission
  createCommission: async (data) => {
    const response = await apiClient.post('/commissions', data);
    return response.data;
  },

  // Update commission
  updateCommission: async (id, data) => {
    const response = await apiClient.put(`/commissions/${id}`, data);
    return response.data;
  },

  // Delete commission
  deleteCommission: async (id) => {
    const response = await apiClient.delete(`/commissions/${id}`);
    return response.data;
  },

  // Calculate commission
  calculateCommission: async (data) => {
    const response = await apiClient.post('/commissions/calculate', data);
    return response.data;
  },

  // Get agent commissions
  getAgentCommissions: async (agentId) => {
    const response = await apiClient.get(`/commissions/agent/${agentId}`);
    return response.data;
  },

  // Get university commissions
  getUniversityCommissions: async (universityId) => {
    const response = await apiClient.get(`/commissions/university/${universityId}`);
    return response.data;
  },

  // Get course commissions
  getCourseCommissions: async (courseId) => {
    const response = await apiClient.get(`/commissions/course/${courseId}`);
    return response.data;
  },
};

export default commissionService;
