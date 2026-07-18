import { api } from "./api.service";

export const paymentService = {
  getAdminPaymentOverview: async () => {
    const response = await api.get('/payments/admin/overview');
    return response.data;
  },
  getAdminTransactions: async () => {
    const response = await api.get('/payments/admin/transactions');
    return response.data;
  },
  sendPaymentReminder: async (caseId) => {
    const response = await api.post('/payments/admin/send-reminder', { caseId });
    return response.data;
  }
};
