import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../../service/patient.service";
import { C } from "../../components/constants/data";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = async () => {
    try {
      const data = await patientService.getPatientById(id);
      setPatient(data.data.patient);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatConditions = (conditions) => {
    if (!conditions) return 'None';
    try {
      const parsed = JSON.parse(conditions);
      return Array.isArray(parsed) ? parsed.join(', ') : conditions;
    } catch {
      return conditions.replace(/"/g, '');
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

      <div className="mx-auto relative z-10">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/patients')}
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
              ← Back to Patients
            </button>
          </div>
          
          {/* Gradient Header */}
          <div 
            className="relative p-8 rounded-2xl border"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-3">
                  {patient.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm opacity-90 font-medium">
                    Patient ID: #{patient.id}
                  </span>
                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {patient.status?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {patient.travel_status?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PATIENT DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Patient Details */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#3b82f6', color: 'white' }}>
                👤
              </div>
              <h3 className="text-xl font-bold" style={{ color: C.black }}>Patient Details</h3>
            </div>
            <div className="space-y-4">
              {patient.email && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Email Address</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.email}</p>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Date of Birth</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{formatDate(patient.date_of_birth)}</p>
                </div>
              )}
              {patient.age && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Age</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.age} years</p>
                </div>
              )}
              {patient.gender && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Gender</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.gender}</p>
                </div>
              )}
              {patient.country && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Country</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.country}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#10b981', color: 'white' }}>
                🏥
              </div>
              <h3 className="text-xl font-bold" style={{ color: C.black }}>Medical Information</h3>
            </div>
            <div className="space-y-4">
              {patient.blood_group && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Blood Group</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.blood_group}</p>
                </div>
              )}
              {patient.conditions && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Medical Conditions</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{formatConditions(patient.conditions)}</p>
                </div>
              )}
              {patient.insurance_plan && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Insurance Plan</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>{patient.insurance_plan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Hospital & Doctor Information */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#8b5cf6', color: 'white' }}>
                👥
              </div>
              <h3 className="text-xl font-bold" style={{ color: C.black }}>Healthcare Team</h3>
            </div>
            <div className="space-y-4">
              {patient.hospital_name && (
                <div className="pb-3 border-b" style={{ borderColor: `${C.border}20` }}>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Hospital</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>🏥 {patient.hospital_name}</p>
                </div>
              )}
              {patient.doctor_name && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>Attending Doctor</label>
                  <p className="text-sm font-medium mt-1" style={{ color: C.black }}>👨‍⚕️ {patient.doctor_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {patient.notes && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-2" style={{ borderColor: '#3b82f620' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#3b82f6', color: 'white' }}>
                📝
              </div>
              <h3 className="text-xl font-bold" style={{ color: C.black }}>Medical Notes</h3>
            </div>
            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#3b82f630' }}>
              <p className="text-sm leading-relaxed" style={{ color: C.black }}>{patient.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 p-6 bg-white rounded-xl border" style={{ borderColor: C.border }}>
          <div className="flex justify-between items-center">
            <div className="text-sm" style={{ color: C.slate }}>
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <button
              onClick={() => navigate('/patients')}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
