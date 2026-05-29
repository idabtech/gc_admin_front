import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../../service/patient.service";
import { C } from "../../components/constants/data";

const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date_of_birth: '',
    age: '',
    gender: '',
    country: '',
    blood_group: '',
    conditions: '',
    insurance_plan: '',
    hospital_name: '',
    doctor_name: '',
    notes: '',
    status: 'active',
    travel_status: 'pending'
  });

  const fetchPatient = async () => {
    try {
      const data = await patientService.getPatientById(id);
      const patientData = data.data.patient;
      setPatient(patientData);
      setFormData({
        name: patientData.name || '',
        email: patientData.email || '',
        date_of_birth: patientData.date_of_birth || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        country: patientData.country || '',
        blood_group: patientData.blood_group || '',
        conditions: patientData.conditions || '',
        insurance_plan: patientData.insurance_plan || '',
        hospital_name: patientData.hospital_name || '',
        doctor_name: patientData.doctor_name || '',
        notes: patientData.notes || '',
        status: patientData.status || 'active',
        travel_status: patientData.travel_status || 'pending'
      });
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientService.updatePatient(id, formData);
      navigate(`/patients/`);
    } catch (err) {
      console.error('Error updating patient:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: C.bg }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: '#e5e7eb',
              borderTopColor: '#3b82f6',
              borderRightColor: '#10b981'
            }}
          />
          <p style={{ color: C.slate }}>Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: C.bg }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: C.black }}>
            Patient not found
          </h3>
          <p style={{ color: C.slate }} className="text-lg mb-6">
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/patients')}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: '#3b82f6' }}
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ 
        background: C.bg, 
        color: C.black,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* GRADIENT HEADER BACKGROUND */}
      <div 
        className="absolute top-0 left-0 right-0 opacity-5 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10 p-6">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/patients`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'white',
                color: '#3b82f6',
                border: `1px solid ${C.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#3b82f6';
              }}
            >
              ← Back to Patient Details
            </button>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: C.black }}>
            Edit Patient
          </h1>
          <p style={{ color: C.slate }} className="text-lg">
            Update patient information for {patient.name}
          </p>
        </div>

        {/* EDIT FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border" style={{ borderColor: C.border }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: C.black, borderColor: C.border }}>
                Personal Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Medical Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: C.black, borderColor: C.border }}>
                Medical Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Blood Group
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Insurance Plan
              </label>
              <input
                type="text"
                name="insurance_plan"
                value={formData.insurance_plan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Medical Conditions
              </label>
              <textarea
                name="conditions"
                value={formData.conditions}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter medical conditions (comma separated)"
              />
            </div>

            {/* Healthcare Team */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: C.black, borderColor: C.border }}>
                Healthcare Team
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Hospital Name
              </label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Doctor Name
              </label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: C.black, borderColor: C.border }}>
                Status
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Patient Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="active">Active</option>
                <option value="pre-arrival">Pre-Arrival</option>
                <option value="discharged">Discharged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Travel Status
              </label>
              <select
                name="travel_status"
                value={formData.travel_status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="pending">Pending</option>
                <option value="booked">Booked</option>
                <option value="in-transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="departed">Departed</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: C.slate }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border bg-white text-black transition-all focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: C.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Additional notes about the patient"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t" style={{ borderColor: C.border }}>
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: 'white',
                color: '#6b7280',
                border: `1px solid ${C.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientEdit;
