import { api } from "./api.service";

export const authService = {
    async login(data) {
        const response = await api.post(`/auth/login`, {
            ...data
        });
        return response.data;
    },

    async register(data) {
        const response = await api.post(`/auth/register`, {
            ...data
        });
        return response.data;
    },

    async sendOtp(data) {
        const response = await api.post(`/auth/sendOtp`, {
            email: data.email
        });
        return response.data;
    },

    async verifyOtp(data) {
        const response = await api.post(`/auth/verifyOtp`, {
            email: data.email,
            otp: data.otp
        });
        return response.data;
    },

    async sendResetOtp(data) {
        const response = await api.post(`/auth/sendResetOtp`, {
            email: data.email
        });
        return response.data;
    },

    async resetPassword(data) {
        const response = await api.post(`/auth/resetPassword`, {
            email: data.email,
            otp: data.otp,
            password: data.password,
            name: data.name,
            phone: data.phone,
            enableSf1Update: data.enableSf1Update
        });
        return response.data;
    },

    async updatePersonalInfo(data) {
        console.log('data', data)
        const response = await api.post(`/auth/sf1/personal-info-update`, data);
        return response.data;
    },

    // 2FA Setup
    async setup2FA() {
        const response = await api.post(`/auth/2fa/setup`);
        return response.data;
    },

    // 2FA Verify Setup
    async verify2FASetup(otp) {
        const response = await api.post(`/auth/2fa/verify-setup`, {
            otp: otp
        });
        return response.data;
    },

    // 2FA Verify (for login)
    async verify2FA(email, otp) {
        const response = await api.post(`/auth/2fa/verify`, {
            email: email,
            otp: otp
        });
        return response.data;
    },

    // 2FA Disable
    async disable2FA(password) {
        const response = await api.post(`/auth/2fa/disable`, {
            password: password
        });
        return response.data;
    },

    // 2FA Backup Codes
    async get2FABackupCodes() {
        const response = await api.get(`/auth/2fa/backup-codes`);
        return response.data;
    },

    // Change Password
    async changePassword(data) {
        const response = await api.post(`/auth/change-password`, {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword
        });
        return response.data;
    },

    async getUserProfile() {
        const response = await api.get(`/auth/me`);
        return response.data;
    },

    async getUserLoginHistory(page = 1, limit = 10) {
        const response = await api.get(`/analytics/login-history?page=${page}&limit=${limit}`);
        return response.data;
    }

};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("userData");
    if (userStr) return JSON.parse(userStr);
    return null;
};
