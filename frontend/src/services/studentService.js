import apiClient from './apiClient';

export const studentService = {
  // Get all students
  getStudents: async (params = {}) => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  // Create student
  createStudent: async (data) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  // Update student
  updateStudent: async (id, data) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (id, formData) => {
    const response = await apiClient.post(`/students/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get student applications
  getStudentApplications: async (id) => {
    const response = await apiClient.get(`/students/${id}/applications`);
    return response.data;
  },

  // Update academic details
  updateAcademicDetails: async (id, data) => {
    const response = await apiClient.put(`/students/${id}/academic`, data);
    return response.data;
  },

  // Update passport info
  updatePassportInfo: async (id, data) => {
    const response = await apiClient.put(`/students/${id}/passport`, data);
    return response.data;
  },
};

export default studentService;
