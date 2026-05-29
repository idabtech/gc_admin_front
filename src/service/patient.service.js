import { api } from "./api.service";

export const patientService = {
 getPatients: async () => {
    const response = await api.get('/patients/all');
    return response.data;
 },
 getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
 },
 updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
 },
 deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
 },
 sendOtp: async (id, data) => {
    const response = await api.post(`/patients/${id}/sendOtp`, {
        email: data.email
    });
    return response.data;
 },
 verifyOtp: async (id, data) => {
    const response = await api.post(`/patients/${id}/verifyOtp`, {
        email: data.email,
        otp: data.otp
    });
    return response.data;
 }
}