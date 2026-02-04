import apiClient from './apiClient';

export const uploadService = {
    // Upload a single file
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default uploadService;
