import { api } from './api.service';

export const roleService = {
  // List all roles (supports filtering by hospital_id)
  getRoles: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.hospital_id) queryParams.append('hospital_id', params.hospital_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    
    const url = queryParams.toString() ? `/roles?${queryParams}` : '/roles';
    const response = await api.get(url);
    return response.data;
  },

  // Create a new role
  createRole: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Get specific role details
  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Update role information
  updateRole: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Deactivate a role (system roles are protected)
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  // List all permissions assigned to a role
  getRolePermissions: async (id) => {
    const response = await api.get(`/roles/${id}/permissions`);
    return response.data;
  },

  // Update permissions for a role
  updateRolePermissions: async (id, permissions) => {
    const response = await api.post(`/roles/${id}/permissions`, permissions);
    return response.data;
  },

  // Assign a role to a user
  assignRoleToUser: async (userId, roleId) => {
    const response = await api.post('/roles/assign', { user_id: userId, role_id: roleId });
    return response.data;
  },

  // Remove a role from a user
  removeRoleFromUser: async (userId, roleId) => {
    const response = await api.post('/roles/remove', { user_id: userId, role_id: roleId });
    return response.data;
  },

  // Get user roles
  getUserRoles: async (userId) => {
    const response = await api.get(`/roles/user/${userId}`);
    return response.data;
  },

  // Bulk assign roles to users
  bulkAssignRoles: async (userIds, roleId) => {
    const response = await api.post('/roles/bulk-assign', { user_ids: userIds, role_id: roleId });
    return response.data;
  },

  // Bulk remove roles from users
  bulkRemoveRoles: async (userIds, roleId) => {
    const response = await api.post('/roles/bulk-remove', { user_ids: userIds, role_id: roleId });
    return response.data;
  }
};
