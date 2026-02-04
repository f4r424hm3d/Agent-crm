import apiClient from './apiClient';

export const userService = {
    // Get all users (with filtering)
    getUsers: async (params) => {
        const response = await apiClient.get('/users', { params });
        return response.data; // Return full response with data and pagination
    },

    // Get user by ID
    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data || response.data;
    },

    // Create user
    createUser: async (data) => {
        const response = await apiClient.post('/users', data);
        return response.data.data || response.data;
    },

    // Update user
    updateUser: async (id, data) => {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data.data || response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data.data || response.data;
    },
};

export default userService;
