import axiosInstance from './apiClient';

const mailSignatureService = {
    // Get all mail signatures
    getSignatures: async () => {
        const response = await axiosInstance.get('/mail-signatures');
        return response.data;
    },

    // Create a new signature
    createSignature: async (data) => {
        const response = await axiosInstance.post('/mail-signatures', data);
        return response.data;
    },

    // Update a signature
    updateSignature: async (id, data) => {
        const response = await axiosInstance.put(`/mail-signatures/${id}`, data);
        return response.data;
    },

    // Delete a signature
    deleteSignature: async (id) => {
        const response = await axiosInstance.delete(`/mail-signatures/${id}`);
        return response.data;
    },

    // Mark a signature as active
    toggleActive: async (id) => {
        const response = await axiosInstance.patch(`/mail-signatures/${id}/active`);
        return response.data;
    }
};

export default mailSignatureService;
