import { api } from './api.service';

export const smsTemplateService = {
  // Get all SMS templates
  getSmsTemplates: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/sms-templates?${params.toString()}`);
    return response.data;
  },

  // Get a single SMS template by ID
  getSmsTemplateById: async (id) => {
    const response = await api.get(`/sms-templates/${id}`);
    return response.data;
  },

  // Create a new SMS template
  createSmsTemplate: async (templateData) => {
    const response = await api.post('/sms-templates', templateData);
    return response.data;
  },

  // Update an existing SMS template
  updateSmsTemplate: async (id, templateData) => {
    const response = await api.put(`/sms-templates/${id}`, templateData);
    return response.data;
  },

  // Delete an SMS template (soft delete)
  deleteSmsTemplate: async (id) => {
    const response = await api.delete(`/sms-templates/${id}`);
    return response.data;
  },

  // Send bulk SMS
  sendBulkSms: async (bulkData) => {
    const response = await api.post('/sms-templates/send-bulk', bulkData);
    return response.data;
  }
};
