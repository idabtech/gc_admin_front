import { api } from "./api.service";

export const teamService = {
    async getUsers(page = 1, limit = 20) {
        const response = await api.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    async getTeams() {
        const response = await api.get(`/teams`);
        return response.data;
    },

    async getTeamById(id) {
        const response = await api.get(`/teams/${id}`);
        return response.data;
    },

    async createTeam(data) {
        const response = await api.post(`/teams`, {
            ...data
        });
        return response.data;
    },

    async updateTeam(id, data) {
        const response = await api.put(`/teams/${id}`, {
            ...data
        });
        return response.data;
    },

    async deleteTeam(id) {
        const response = await api.delete(`/teams/${id}`);
        return response.data;
    },

    async updateTeamStatus(id, status) {
        const response = await api.patch(`/teams/${id}/status`, {
            status
        });
        return response.data;
    },

    async searchTeams(query, filters = {}) {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        
        const response = await api.get(`/teams/search?${params}`);
        return response.data;
    },

    async getTeamMembers(teamId) {
        const response = await api.get(`/teams/${teamId}/members`);
        return response.data;
    },

    async addTeamMember(teamId, memberId) {
        const response = await api.post(`/teams/${teamId}/members`, {
            member_id: memberId
        });
        return response.data;
    },

    async removeTeamMember(teamId, memberId) {
        const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
        return response.data;
    },

    async getTeamsByHospital(hospitalId) {
        const response = await api.get(`/hospitals/${hospitalId}/teams`);
        return response.data;
    },

    async assignRole(data) {
        const response = await api.post(`/auth/create-user`, data);
        return response.data;
    },

    async activateUser(userId) {
        const response = await api.put(`/users/${userId}/activate`);
        return response.data;
    },

    async deactivateUser(userId) {
        const response = await api.put(`/users/${userId}/deactivate`);
        return response.data;
    }
};
