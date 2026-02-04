import apiClient from './apiClient';

export const settingService = {
    // Get all settings
    getSettings: async () => {
        const response = await apiClient.get('/settings');
        // Ensure we handle both structure formats if backend changes
        return response.data;
    },

    // Update settings (accepts { key: value, ... })
    updateSettings: async (settings) => {
        const response = await apiClient.put('/settings', { settings });
        return response.data;
    }
};

export default settingService;
