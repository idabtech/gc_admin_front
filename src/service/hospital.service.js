import { api } from "./api.service";

export const hospitalService = {
    getHospitals: async () => {
        const response = await api.get('/hospitals');
        return response.data;
    },
    searchHospitals: async (search = "", filters = {}) => {
        const params = {
            search,
            ...filters
        };

        const response = await api.get('/hospitals', { params });
        return response.data;
    },

    getHospitalById: async (id) => {
        const response = await api.get(`/hospitals/${id}`);
        return response.data;
    },
    createHospital: async (hospital) => {
        const response = await api.post('/hospitals', hospital);
        return response.data;
    },
    updateHospital: async (id, hospital) => {
        const response = await api.put(`/hospitals/${id}`, hospital);
        return response.data;
    },
    getDepartments: async (id) => {
        const response = await api.get(`/hospitals/${id}/departments`);
        return response.data;
    },
    deleteHospital: async (id) => {
        const response = await api.delete(`/hospitals/${id}`);
        return response.data;
    },
    // Hospital Approval
    approveHospital: async (hospitalId) => {
        const response = await api.put(`/hospitals/${hospitalId}/approve`);
        return response.data;
    },

    deactivateHospital: async (hospitalId) => {
        const response = await api.put(`/hospitals/${hospitalId}/deactivate`);
        return response.data;
    },

    activateHospital: async (hospitalId) => {
        const response = await api.put(`/hospitals/${hospitalId}/activate`);
        return response.data;
    }
}
