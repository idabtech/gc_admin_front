import { api } from "./api.service";

export const dashboardService = {
    async getAdminDashboard() {
        const response = await api.get(`/analytics/admin-dashboard`);
        return response.data;
    }
};
