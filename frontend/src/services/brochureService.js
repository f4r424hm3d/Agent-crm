import apiClient from './apiClient';

export const brochureService = {
    // Brochure Types
    getBrochureTypes: async () => {
        const response = await apiClient.get('/brochures/types');
        return response.data;
    },

    getBrochureTypeById: async (id) => {
        const response = await apiClient.get(`/brochures/types/${id}`);
        return response.data;
    },

    createBrochureType: async (data) => {
        const response = await apiClient.post('/brochures/types', data);
        return response.data;
    },

    updateBrochureType: async (id, data) => {
        const response = await apiClient.put(`/brochures/types/${id}`, data);
        return response.data;
    },

    deleteBrochureType: async (id) => {
        const response = await apiClient.delete(`/brochures/types/${id}`);
        return response.data;
    },

    // Brochure Categories
    getBrochureCategories: async () => {
        const response = await apiClient.get('/brochures/categories');
        return response.data;
    },

    getCategoryById: async (id) => {
        const response = await apiClient.get(`/brochures/categories/${id}`);
        return response.data;
    },

    createCategory: async (data) => {
        const response = await apiClient.post('/brochures/categories', data);
        return response.data;
    },

    updateCategory: async (id, data) => {
        const response = await apiClient.put(`/brochures/categories/${id}`, data);
        return response.data;
    },

    deleteBrochureCategory: async (id) => {
        return await apiClient.delete(`/brochures/categories/${id}`);
    },

    getCountries: async () => {
        const response = await apiClient.get('/countries');
        return response.data.data;
    },

    // University/Programs
    getAllUniversityPrograms: async () => {
        const response = await apiClient.get('/brochures/ups');
        return response.data;
    },

    getUniversityPrograms: async (typeId) => {
        const response = await apiClient.get(`/brochures/types/${typeId}/ups`);
        return response.data;
    },

    getUPById: async (upId) => {
        const response = await apiClient.get(`/brochures/ups/${upId}`);
        return response.data;
    },

    createUniversityProgram: async (data) => {
        const response = await apiClient.post('/brochures/ups', data);
        return response.data;
    },

    updateUniversityProgram: async (upId, data) => {
        const response = await apiClient.put(`/brochures/ups/${upId}`, data);
        return response.data;
    },

    deleteUniversityProgram: async (upId) => {
        const response = await apiClient.delete(`/brochures/ups/${upId}`);
        return response.data;
    },

    // Brochures
    getBrochures: async (upId) => {
        const response = await apiClient.get(`/brochures/ups/${upId}/brochures`);
        return response.data;
    },

    getBrochureById: async (id) => {
        const response = await apiClient.get(`/brochures/brochures/${id}`);
        return response.data;
    },

    createBrochure: async (upId, formData) => {
        const response = await apiClient.post(`/brochures/ups/${upId}/brochures`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateBrochure: async (id, data) => {
        const response = await apiClient.put(`/brochures/brochures/${id}`, data);
        return response.data;
    },

    deleteBrochure: async (id) => {
        const response = await apiClient.delete(`/brochures/brochures/${id}`);
        return response.data;
    },

    // File Upload
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/brochures/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default brochureService;
