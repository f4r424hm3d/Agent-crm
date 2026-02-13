import apiClient from './apiClient';

export const externalSearchService = {
    // Get countries
    getCountries: async () => {
        const response = await apiClient.get('/external-search/countries');
        return response.data;
    },

    // Get universities
    getUniversities: async (params = {}) => {
        const response = await apiClient.get('/external-search/universities', { params });
        return response.data;
    },

    // Get levels
    getLevels: async (universityId) => {
        const response = await apiClient.get('/external-search/levels', { params: { university_id: universityId } });
        return response.data;
    },

    // Get categories
    getCategories: async (universityId, level) => {
        const response = await apiClient.get('/external-search/categories', { params: { university_id: universityId, level } });
        return response.data;
    },

    // Get specializations
    getSpecializations: async (universityId, level, categoryId) => {
        const response = await apiClient.get('/external-search/specializations', {
            params: {
                university_id: universityId,
                level,
                course_category_id: categoryId
            }
        });
        return response.data;
    },

    // Get programs
    getPrograms: async (params = {}) => {
        const response = await apiClient.get('/external-search/programs', { params });
        return response.data;
    }
};

export default externalSearchService;
