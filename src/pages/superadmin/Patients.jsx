
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../../service/patient.service";
import { C } from "../../components/constants/data";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [travelStatusFilter, setTravelStatusFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Apply blur effect to sidebar and header when modal is open
  // useEffect(() => {
  //   if (selectedPatient) {
  //     document.querySelector('aside')?.style.setProperty('filter', 'blur(4px)', 'important');
  //     document.querySelector('header')?.style.setProperty('filter', 'blur(4px)', 'important');
  //   } else {
  //     document.querySelector('aside')?.style.setProperty('filter', 'blur(0px)', 'important');
  //     document.querySelector('header')?.style.setProperty('filter', 'blur(0px)', 'important');
  //   }
  // }, [selectedPatient]);

  const getStatusColor = (status) => {
    const colors = {
      'active': { bg: '#10b981', text: '#ecfdf5', light: '#d1fae5' },
      'pre-arrival': { bg: '#f59e0b', text: '#fef3c7', light: '#fef3c7' },
      'discharged': { bg: '#6b7280', text: '#f3f4f6', light: '#f3f4f6' }
    };
    return colors[status] || colors['discharged'];
  };

  const getTravelStatusColor = (travelStatus) => {
    const colors = {
      'arrived': { bg: '#10b981', text: '#ecfdf5' },
      'in-transit': { bg: '#3b82f6', text: '#eff6ff' },
      'booked': { bg: '#06b6d4', text: '#ecf0f1' },
      'pending': { bg: '#f59e0b', text: '#fef3c7' },
      'departed': { bg: '#8b5cf6', text: '#f3e8ff' }
    };
    return colors[travelStatus] || colors['pending'];
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Statistics
  const activePatients = patients.filter(p => p.status === 'active').length;
  const preArrivalPatients = patients.filter(p => p.status === 'pre-arrival').length;
  const dischargedPatients = patients.filter(p => p.status === 'discharged').length;
  const arrivedPatients = patients.filter(p => p.travel_status === 'arrived').length;
  const hospitals = [...new Set(patients.map(p => p.hospital_name).filter(Boolean))];

  // Filtering
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchQuery || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesTravelStatus = travelStatusFilter === "all" || patient.travel_status === travelStatusFilter;
    const matchesHospital = hospitalFilter === "all" || patient.hospital_name === hospitalFilter;
    
    return matchesSearch && matchesStatus && matchesTravelStatus && matchesHospital;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, travelStatusFilter, hospitalFilter]);

  // Pagination controls
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditPatient = (patient) => {
    navigate(`/patients/edit/${patient.id}`);
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
      try {
        await patientService.deletePatient(patient.id);
        fetchPatients(); // Refresh the patient list
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (currentPage >= totalPages - 2) {
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          for (let i = currentPage - 2; i <= currentPage + 2; i++) {
            pages.push(i);
          }
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white rounded-xl border" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-4">
          <span style={{ color: C.slate }} className="text-sm font-medium">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
          </span>
          <div className="flex items-center gap-2">
            <span style={{ color: C.slate }} className="text-sm">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 rounded-lg border bg-white text-black text-sm font-medium appearance-none cursor-pointer"
              style={{ 
                borderColor: C.border,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                paddingRight: '1.5rem'
              }}
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: C.border,
              color: currentPage === 1 ? C.slate : '#3b82f6',
              background: currentPage === 1 ? C.bg : 'white'
            }}
          >
            ←
          </button>
          
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 rounded-lg border font-medium transition-all"
                style={{
                  borderColor: C.border,
                  color: '#3b82f6',
                  background: 'white'
                }}
              >
                1
              </button>
              {currentPage > 4 && (
                <span style={{ color: C.slate }} className="px-2">...</span>
              )}
            </>
          )}
          
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className="px-3 py-2 rounded-lg border font-medium transition-all"
              style={{
                borderColor: currentPage === page ? '#3b82f6' : C.border,
                color: currentPage === page ? 'white' : '#3b82f6',
                background: currentPage === page ? '#3b82f6' : 'white'
              }}
            >
              {page}
            </button>
          ))}
          
          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && (
                <span style={{ color: C.slate }} className="px-2">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 rounded-lg border font-medium transition-all"
                style={{
                  borderColor: C.border,
                  color: '#3b82f6',
                  background: 'white'
                }}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: C.border,
              color: currentPage === totalPages ? C.slate : '#3b82f6',
              background: currentPage === totalPages ? C.bg : 'white'
            }}
          >
            →
          </button>
        </div>
      </div>
    );
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
          <p style={{ color: C.slate }}>Loading patients...</p>
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
        className="absolute top-0 left-0 right-0   opacity-5 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: C.black }}
              >
                Patients
              </h1>
              <p style={{ color: C.slateL }} className="text-lg">
                Manage and monitor patient information in real-time
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Patients', value: patients.length, color: '#3b82f6', icon: '👥' },
              { label: 'Active', value: activePatients, color: '#10b981', icon: '🟢' },
              { label: 'Pre-Arrival', value: preArrivalPatients, color: '#f59e0b', icon: '⏳' },
              { label: 'Arrived', value: arrivedPatients, color: '#06b6d4', icon: '✈️' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{
                  background: `${stat.color}08`,
                  borderColor: `${stat.color}30`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ color: C.slate }} className="text-sm font-medium mb-1">
                      {stat.label}
                    </p>
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div 
                  className="mt-4 h-1 rounded-full opacity-20"
                  style={{ background: stat.color }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="mb-10 bg-white rounded-2xl p-6 border" style={{ borderColor: C.border }}>
          <div className="flex flex-col gap-4">
            {/* <h3 className="text-lg font-semibold" style={{ color: C.black }}>
              Filter & Search
            </h3> */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</div>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border bg-white text-black placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: C.border,
                    focusRing: '#3b82f6'
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border bg-white text-black font-medium appearance-none cursor-pointer transition-all"
                style={{ 
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pre-arrival">Pre-Arrival</option>
                <option value="discharged">Discharged</option>
              </select>

              {/* Travel Status Filter */}
              <select
                value={travelStatusFilter}
                onChange={(e) => setTravelStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border bg-white text-black font-medium appearance-none cursor-pointer transition-all"
                style={{ 
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Travel Status</option>
                <option value="pending">Pending</option>
                <option value="booked">Booked</option>
                <option value="in-transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="departed">Departed</option>
              </select>

              {/* Hospital Filter */}
              <select
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border bg-white text-black font-medium appearance-none cursor-pointer transition-all"
                style={{ 
                  borderColor: C.border,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Hospitals</option>
                {hospitals.map(hospital => (
                  <option key={hospital} value={hospital}>{hospital}</option>
                ))}
              </select>
            </div>

            {/* Active Filters Badge */}
            {(searchQuery || statusFilter !== "all" || travelStatusFilter !== "all" || hospitalFilter !== "all") && (
              <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: C.border }}>
                <span style={{ color: C.slate }} className="text-sm font-medium">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100" style={{ color: '#1e40af' }}>
                    Search: "{searchQuery}"
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="px-3 py-1 rounded-full text-xs bg-green-100" style={{ color: '#15803d' }}>
                    Status: {statusFilter}
                  </span>
                )}
                {travelStatusFilter !== "all" && (
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100" style={{ color: '#1e40af' }}>
                    Travel: {travelStatusFilter}
                  </span>
                )}
                {hospitalFilter !== "all" && (
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100" style={{ color: '#6d28d9' }}>
                    Hospital: {hospitalFilter}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PATIENTS TABLE */}
        {paginatedPatients.length > 0 ? (
          <>
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: C.border }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: `${C.bg}` }}>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Patient Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Travel Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Medical Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Hospital & Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.slate }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: C.border }}>
                    {paginatedPatients.map((patient, idx) => (
                      <tr 
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors"
                        style={{ 
                          animation: `slideIn 0.5s ease-out ${idx * 0.05}s backwards`,
                          background: idx % 2 === 0 ? 'white' : `${C.bg}30`
                        }}
                      >
                        {/* Patient Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, #3b82f6, #10b981)`,
                              }}
                            >
                              {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: C.black }}>
                                {patient.name}
                              </div>
                              <div className="text-xs" style={{ color: C.slate }}>
                                ID: #{patient.id}
                              </div>
                              <div className="text-xs" style={{ color: C.slate }}>
                                {patient.age && `${patient.age} yrs`} {patient.gender && `• ${patient.gender}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: C.black }}>
                            {patient.email}
                          </div>
                          <div className="text-xs" style={{ color: C.slate }}>
                            {patient.country || 'N/A'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: getStatusColor(patient.status).bg,
                              color: 'white'
                            }}
                          >
                            {patient.status?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>

                        {/* Travel Status */}
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: getTravelStatusColor(patient.travel_status).bg,
                              color: 'white'
                            }}
                          >
                            {patient.travel_status?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>

                        {/* Medical Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {patient.blood_group && (
                              <div className="text-xs">
                                <span style={{ color: C.slate }}>Blood:</span>
                                <span className="ml-1 font-medium" style={{ color: C.black }}>{patient.blood_group}</span>
                              </div>
                            )}
                            {patient.conditions && (
                              <div className="text-xs" style={{ color: C.slate }}>
                                <span>Conditions:</span>
                                <div className="font-medium text-xs mt-1" style={{ color: C.black }}>
                                  {formatConditions(patient.conditions)}
                                </div>
                              </div>
                            )}
                            {patient.insurance_plan && (
                              <div className="text-xs">
                                <span style={{ color: C.slate }}>Insurance:</span>
                                <div className="font-medium text-xs mt-1" style={{ color: C.black }}>
                                  {patient.insurance_plan}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Hospital & Doctor */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {patient.hospital_name && (
                              <div className="text-xs">
                                <span style={{ color: C.slate }}>🏥</span>
                                <span className="ml-1 font-medium" style={{ color: C.black }}>{patient.hospital_name}</span>
                              </div>
                            )}
                            {patient.doctor_name && (
                              <div className="text-xs">
                                <span style={{ color: C.slate }}>👨‍⚕️</span>
                                <span className="ml-1 font-medium" style={{ color: C.black }}>{patient.doctor_name}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() => navigate(`/patients/${patient.id}`)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                              style={{
                                borderColor: C.border,
                                color: '#3b82f6',
                                background: 'white'
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
                              View
                            </button>
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                              style={{
                                borderColor: C.border,
                                color: '#f59e0b',
                                background: 'white'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#f59e0b';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#f59e0b';
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePatient(patient)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                              style={{
                                borderColor: C.border,
                                color: '#ef4444',
                                background: 'white'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#ef4444';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#ef4444';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            
            {/* Pagination Controls */}
            <PaginationControls />
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            className="text-center py-24 rounded-2xl border"
            style={{ background: C.white, borderColor: C.border }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: C.black }}>
              No patients found
            </h3>
            <p style={{ color: C.slateL }} className="text-lg mb-6">
              {searchQuery || statusFilter !== "all" || travelStatusFilter !== "all" || hospitalFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No patients have been added to the system yet"}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {(searchQuery || statusFilter !== "all" || travelStatusFilter !== "all" || hospitalFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTravelStatusFilter("all");
                    setHospitalFilter("all");
                  }}
                  className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                  style={{ background: '#3b82f6' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          outline: none;
        }

        select:focus {
          outline: none;
        }

        @media (prefers-reduced-motion: no-preference) {
          .animate-in {
            animation: slideIn 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default Patients;