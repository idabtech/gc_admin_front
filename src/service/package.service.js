import { api } from './api.service';

export const packageService = {
  // Get all packages with optional filtering
  getPackages: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.plan) params.append('plan', filters.plan);
    if (filters.label) params.append('label', filters.label);
    if (filters.search) params.append('search', filters.search);
    if (filters.isactive !== undefined) params.append('isactive', filters.isactive);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await api.get(`/packages?${params.toString()}`);
    return response.data;
  },

  // Get a single package by ID
  getPackageById: async (id) => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  // Create a new package
  createPackage: async (packageData) => {
    const response = await api.post('/packages', packageData);
    return response.data;
  },

  // Update an existing package
  updatePackage: async (id, packageData) => {
    const response = await api.put(`/packages/${id}`, packageData);
    return response.data;
  },

  // Delete a package
  deletePackage: async (id) => {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },

  // Get package features with parsed JSON
  getPackageFeatures: async (id) => {
    const response = await api.get(`/packages/${id}/features`);
    return response.data;
  },

  // Get all unique package plans
  getPackagePlans: async () => {
    const response = await api.get('/packages/plans/list');
    return response.data;
  },

  // Compare multiple packages
  comparePackages: async (packageIds) => {
    const params = typeof packageIds === 'string' 
      ? `ids=${packageIds}` 
      : `ids=${packageIds.join(',')}`;
    const response = await api.get(`/packages/compare?${params}`);
    return response.data;
  },

  // Search packages (alias for getPackages with search filter)
  searchPackages: async (searchQuery, filters = {}) => {
    return packageService.getPackages({ ...filters, search: searchQuery });
  }
};
