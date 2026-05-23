import { api } from './api.service';

export const doctorService = {
  // Get all doctors
  getDoctors: async () => {
    const response = await api.get('/doctors/all');
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  // Update doctor status
  updateDoctorStatus: async (id, status) => {
    const response = await api.patch(`/admin/doctors/${id}/status`, { status });
    return response.data;
  },

  // Approve doctor profile
  approveDoctor: async (id) => {
    const response = await api.patch(`/doctors/${id}/approve`);
    return response.data;
  },

  // Reject doctor profile
  rejectDoctor: async (id, reason) => {
    const response = await api.patch(`/doctors/${id}/reject`, { reason });
    return response.data;
  },

  // Suspend doctor
  suspendDoctor: async (id, reason) => {
    const response = await api.put(`/doctors/${id}/suspend`, { reason });
    return response.data;
  },

  // Unsuspend doctor
  unsuspendDoctor: async (id) => {
    const response = await api.put(`/doctors/${id}/unsuspend`);
    return response.data;
  },

  // Update doctor profile
  updateDoctorProfile: async (id, profileData) => {
    const response = await api.put(`/doctors/${id}`, profileData);
    return response.data;
  },

  //Delete doctpr profile
  deleteDoctorProfile: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  // Assign hospital to doctor
  assignHospital: async (doctorId, hospitalId) => {
    const response = await api.patch(`/doctors/${doctorId}/assign-hospital`, { hospital_id: hospitalId });
    return response.data;
  },

  // Update doctor specialization
  updateSpecialization: async (id, specialization) => {
    const response = await api.patch(`/doctors/${id}/specialization`, { specialization });
    return response.data;
  },

  // Get doctors by hospital
  getDoctorsByHospital: async (hospitalId) => {
    const response = await api.get(`/hospitals/${hospitalId}/doctors`);
    return response.data;
  },

  // Get all hospitals for assignment dropdown
  getHospitalsForAssignment: async () => {
    const response = await api.get('/hospitals/list');
    return response.data;
  },

  // Get all specializations
  getSpecializations: async () => {
    const response = await api.get('/admin/specializations');
    return response.data;
  },

  // Search doctors
  searchDoctors: async (query, filters = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (filters.specialization) params.append('specialization', filters.specialization);
    if (filters.status) params.append('status', filters.status);
    if (filters.approval_status) params.append('approval_status', filters.approval_status);
    if (filters.hospital) params.append('hospital', filters.hospital);
    
    const response = await api.get(`/doctors?${params}`);
    return response.data;
  }
};
