import { api } from "./api.service";

export const conditionService = {
    async getConditions() {
        const response = await api.get(`/conditions`);
        return response.data;
    },

    async getConditionById(id) {
        const response = await api.get(`/conditions/${id}`);
        return response.data;
    },

    async createCondition(data) {
        const response = await api.post(`/conditions`, {
            ...data
        });
        return response.data;
    },

    async updateCondition(id, data) {
        const response = await api.put(`/conditions/${id}`, {
            ...data
        });
        return response.data;
    },

    async deleteCondition(id) {
        const response = await api.delete(`/conditions/${id}`);
        return response.data;
    },

    async updateConditionStatus(id, status) {
        const response = await api.patch(`/conditions/${id}/status`, {
            status
        });
        return response.data;
    },

    async searchConditions(query, filters = {}) {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        
        const response = await api.get(`/conditions/search?${params}`);
        return response.data;
    },

    async getConditionsByCategory(category) {
        const response = await api.get(`/conditions/category/${category}`);
        return response.data;
    },

    async getConditionsBySeverity(severity) {
        const response = await api.get(`/conditions/severity/${severity}`);
        return response.data;
    },

    async getTreatmentProtocols(conditionId) {
        const response = await api.get(`/conditions/${conditionId}/protocols`);
        return response.data;
    },

    async addTreatmentProtocol(conditionId, protocol) {
        const response = await api.post(`/conditions/${conditionId}/protocols`, {
            ...protocol
        });
        return response.data;
    },

    async updateTreatmentProtocol(conditionId, protocolId, protocol) {
        const response = await api.put(`/conditions/${conditionId}/protocols/${protocolId}`, {
            ...protocol
        });
        return response.data;
    },

    async deleteTreatmentProtocol(conditionId, protocolId) {
        const response = await api.delete(`/conditions/${conditionId}/protocols/${protocolId}`);
        return response.data;
    },

    async getConditionSymptoms(conditionId) {
        const response = await api.get(`/conditions/${conditionId}/symptoms`);
        return response.data;
    },

    async addConditionSymptom(conditionId, symptom) {
        const response = await api.post(`/conditions/${conditionId}/symptoms`, {
            ...symptom
        });
        return response.data;
    },

    async removeConditionSymptom(conditionId, symptomId) {
        const response = await api.delete(`/conditions/${conditionId}/symptoms/${symptomId}`);
        return response.data;
    }
};
