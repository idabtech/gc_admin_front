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
    const response = await api.put(`/api/v1/patients/${id}`, patientData);
    return response.data;
 },
 deletePatient: async (id) => {
    const response = await api.delete(`/api/v1/patients/${id}`);
    return response.data;
 }
}