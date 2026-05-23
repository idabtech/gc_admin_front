import { api } from './api.service';

export const emailTemplateService = {
  // Get all email templates
  getEmailTemplates: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/email-templates?${params.toString()}`);
    return response.data;
  },

  // Get a single email template by ID
  getEmailTemplateById: async (id) => {
    const response = await api.get(`/email-templates/${id}`);
    return response.data;
  },

  // Create a new email template
  createEmailTemplate: async (templateData) => {
    const response = await api.post('/email-templates', templateData);
    return response.data;
  },

  // Update an existing email template
  updateEmailTemplate: async (id, templateData) => {
    const response = await api.put(`/email-templates/${id}`, templateData);
    return response.data;
  },

  // Delete an email template (soft delete)
  deleteEmailTemplate: async (id) => {
    const response = await api.delete(`/email-templates/${id}`);
    return response.data;
  }
};
