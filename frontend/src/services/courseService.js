import apiClient from './apiClient';

export const courseService = {
  // Get all courses
  getCourses: async (params = {}) => {
    const response = await apiClient.get('/courses', { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  // Create course
  createCourse: async (data) => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  // Update course
  updateCourse: async (id, data) => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },

  // Update status
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/courses/${id}/status`, { status });
    return response.data;
  },

  // Get course commission for agent
  getCourseCommission: async (courseId, agentId) => {
    const response = await apiClient.get(`/courses/${courseId}/commission`, {
      params: { agentId },
    });
    return response.data;
  },
};

export default courseService;
