import apiClient from './apiClient';

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  // Get recent applications
  getRecentApplications: async () => {
    const response = await apiClient.get('/dashboard/recent-applications');
    return response.data;
  },

  // Get chart data
  getChartData: async (type, period = '30d') => {
    const response = await apiClient.get(`/dashboard/charts/${type}`, {
      params: { period },
    });
    return response.data;
  },

  // Get admin dashboard
  getAdminDashboard: async () => {
    const response = await apiClient.get('/dashboard/admin');
    return response.data;
  },

  // Get agent dashboard
  getAgentDashboard: async (agentId) => {
    const response = await apiClient.get(`/dashboard/agent/${agentId}`);
    return response.data;
  },

  // Get student dashboard
  getStudentDashboard: async (studentId) => {
    const response = await apiClient.get(`/dashboard/student/${studentId}`);
    return response.data;
  },
};

export default dashboardService;
