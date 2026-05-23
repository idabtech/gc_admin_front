import { api } from './api.service';

export const permissionService = {
  // List all available system permissions
  getPermissions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    
    const url = queryParams.toString() ? `/permissions?${queryParams}` : '/permissions';
    const response = await api.get(url);
    return response.data;
  },

  // List all permission categories (e.g., user_management, billing)
  getPermissionCategories: async () => {
    const response = await api.get('/permissions/categories');
    return response.data;
  },

  // Get permissions by category
  getPermissionsByCategory: async (category) => {
    const response = await api.get(`/permissions/category/${category}`);
    return response.data;
  },

  // Get specific permission details
  getPermissionById: async (id) => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  // Create a new permission (admin only)
  createPermission: async (permissionData) => {
    const response = await api.post('/permissions', permissionData);
    return response.data;
  },

  // Update permission details (admin only)
  updatePermission: async (id, permissionData) => {
    const response = await api.put(`/permissions/${id}`, permissionData);
    return response.data;
  },

  // Delete permission (admin only)
  deletePermission: async (id) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },

  // Check if user has specific permission
  checkUserPermission: async (userId, permissionCode) => {
    const response = await api.get(`/permissions/check/${userId}/${permissionCode}`);
    return response.data;
  },

  // Get all permissions for a specific user
  getUserPermissions: async (userId) => {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data;
  },

  // Grant permission to role
  grantPermissionToRole: async (roleId, permissionId) => {
    const response = await api.post('/permissions/grant', { role_id: roleId, permission_id: permissionId });
    return response.data;
  },

  // Revoke permission from role
  revokePermissionFromRole: async (roleId, permissionId) => {
    const response = await api.post('/permissions/revoke', { role_id: roleId, permission_id: permissionId });
    return response.data;
  }
};
