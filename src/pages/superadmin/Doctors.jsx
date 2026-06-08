import React, { useEffect, useState } from "react";
import { doctorService } from "../../service/doctor.service";
import { C } from "../../components/constants/data";
import DoctorModal from "../../components/superadmin/DoctorModal";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchAndFilterDoctors = async () => {
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (specializationFilter !== "all") filters.specialization = specializationFilter;
      if (approvalFilter !== "all") filters.approval_status = approvalFilter;
      
      const data = await doctorService.searchDoctors(searchQuery, filters);
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchQuery || statusFilter !== "all" || specializationFilter !== "all" || approvalFilter !== "all") {
      searchAndFilterDoctors();
    } else {
      fetchDoctors();
    }
  }, [searchQuery, statusFilter, specializationFilter, approvalFilter]);

  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(false);
  };

  const handleActionComplete = () => {
    fetchDoctors();
  };

  const getStatusColor = (doctor) => {
    if (doctor.is_suspended) return C.orange;
    if (doctor.approval_status === 'pending') return C.gold;
    if (doctor.approval_status === 'rejected') return C.red;
    if (doctor.is_active) return C.green;
    return C.slate;
  };

  const getStatusText = (doctor) => {
    if (doctor.is_suspended) return 'Suspended';
    if (doctor.approval_status === 'pending') return 'Pending Approval';
    if (doctor.approval_status === 'rejected') return 'Rejected';
    if (doctor.is_active) return 'Active';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: C.bg }}
      >
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: C.border, borderTopColor: C.teal }}
        />
      </div>
    );
  }

  // Calculate statistics
  const activeDoctors = doctors.filter(d => d.is_active && !d.is_suspended).length;
  const pendingDoctors = doctors.filter(d => d.approval_status === 'pending').length;
  const suspendedDoctors = doctors.filter(d => d.is_suspended).length;
  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.black }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: C.black }}>Doctor</h1>
          <p style={{ color: C.slateL }}>
            Manage and monitor healthcare professionals
          </p>
        </div>

        <div className="flex gap-4">
          <div
            className="p-5 rounded-xl border text-center"
            style={{ background: C.card, borderColor: C.border }}
          >
            <p className="text-2xl font-bold" style={{ color: C.black }}>{doctors.length}</p>
            <p style={{ color: C.slate }}>Total Doctors</p>
          </div>
          <div
            className="p-5 rounded-xl border text-center"
            style={{ background: C.card, borderColor: C.border }}
          >
            <p className="text-2xl font-bold" style={{ color: C.green }}>{activeDoctors}</p>
            <p style={{ color: C.slate }}>Active</p>
          </div>
          {/* <div
            className="p-5 rounded-xl border text-center"
            style={{ background: C.card, borderColor: C.border }}
          >
            <p className="text-2xl font-bold" style={{ color: C.gold }}>{pendingDoctors}</p>
            <p style={{ color: C.slate }}>Pending</p>
          </div> */}
          <div
            className="p-5 rounded-xl border text-center"
            style={{ background: C.card, borderColor: C.border }}
          >
            <p className="text-2xl font-bold" style={{ color: C.orange }}>{suspendedDoctors}</p>
            <p style={{ color: C.slate }}>Suspended</p>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search doctors by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-transparent text-black placeholder-gray-500"
            style={{ borderColor: C.border, color: C.black }}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border text-black"
            style={{ 
              borderColor: C.border,
              backgroundColor: C.white,
              color: C.black
            }}
          >
            <option value="all" style={{ backgroundColor: C.navy, color: C.black }}>All Status</option>
            <option value="active" style={{ backgroundColor: C.navy, color: C.black }}>Active</option>
            <option value="inactive" style={{ backgroundColor: C.navy, color: C.black }}>Inactive</option>
          </select>

          {/* Approval Filter */}
          {/* <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border text-black"
            style={{ 
              borderColor: C.border,
              backgroundColor: C.white,
              color: C.black
            }}
          >
            <option value="all" style={{ backgroundColor: C.navy, color: C.black }}>All Approval Status</option>
            <option value="approved" style={{ backgroundColor: C.navy, color: C.black }}>Approved</option>
            <option value="pending" style={{ backgroundColor: C.navy, color: C.black }}>Pending</option>
            <option value="rejected" style={{ backgroundColor: C.navy, color: C.black }}>Rejected</option>
          </select> */}

          {/* Specialization Filter */}
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border text-black"
            style={{ 
              borderColor: C.border,
              backgroundColor: C.white,
              color: C.black
            }}
          >
            <option value="all" style={{ backgroundColor: C.navy, color: C.black }}>All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec} style={{ backgroundColor: C.navy, color: C.black }}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DOCTORS GRID */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => openDoctorModal(doctor)}
            className="p-6 rounded-xl border transition hover:scale-[1.02] cursor-pointer"
            style={{ background: C.card, borderColor: C.border }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: C.teal, color: C.white }}
                >
                  {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: C.black }}>{doctor.name}</h2>
                  <p style={{ color: C.slate }} className="text-sm">{doctor.email}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <span
                className="px-3 py-1 rounded text-xs font-semibold"
                style={{
                  background: getStatusColor(doctor),
                  color: C.white,
                }}
              >
                {getStatusText(doctor)}
              </span>
            </div>

            {/* Specialization */}
            {doctor.specialization && (
              <div className="mb-3">
                <span
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    background: `${C.teal}20`,
                    color: C.teal,
                    border: `1px solid ${C.teal}40`
                  }}
                >
                  {doctor.specialization}
                </span>
              </div>
            )}

            {/* Hospital Info */}
            {doctor.hospital_name && (
              <div className="mb-4">
                <p style={{ color: C.slateL }} className="text-sm mb-1">
                  🏥 {doctor.hospital_name}
                </p>
                {doctor.hospital_city && (
                  <p style={{ color: C.slate }} className="text-xs">
                    📍 {doctor.hospital_city}, {doctor.hospital_state}
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: C.border }}>
              <div>
                <p style={{ color: C.slate }} className="text-xs mb-1">Patients</p>
                <p className="font-semibold" style={{ color: C.gold }}>
                  {doctor.patient_count || 0}
                </p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-xs mb-1">Experience</p>
                <p className="font-semibold" style={{ color: C.blue }}>
                  {doctor.experience_yrs ? `${doctor.experience_yrs} yrs` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Suspended Reason */}
            {doctor.is_suspended === 1 && doctor.suspended_reason && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <div className="flex-1">
                      <p style={{ color: C.red }} className="text-xs font-semibold mb-1">
                        SUSPENDED
                      </p>
                      <p style={{ color: C.slate }} className="text-xs">
                        {doctor.suspended_reason}
                      </p>
                      {doctor.suspended_at && (
                        <p style={{ color: C.slate }} className="text-xs mt-1">
                          Suspended on: {new Date(doctor.suspended_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            {doctor.phone && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                <p style={{ color: C.slateL }} className="text-sm">
                  📞 {doctor.phone}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
              <div className="flex gap-2">
                {doctor.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDoctorModal(doctor);
                      }}
                      className="flex-1 py-2 px-3 rounded text-xs font-semibold transition cursor-pointer"
                      style={{ background: C.green, color: C.white }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDoctorModal(doctor);
                      }}
                      className="flex-1 py-2 px-3 rounded text-xs font-semibold transition cursor-pointer"
                      style={{ background: C.red, color: C.white }}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDoctorModal(doctor);
                  }}
                  className="flex-1 py-2 px-3 rounded text-xs font-semibold transition"
                  style={{ background: C.teal, color: C.white }}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {doctors.length === 0 && !loading && (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ background: C.white, borderColor: C.border }}
        >
          <div className="text-4xl mb-4">👨‍⚕️</div>
          <h3 className="text-xl font-semibold" style={{ color: C.black }}>
            No doctors found
          </h3>
          <p style={{ color: C.slateL }}>
            {searchQuery || statusFilter !== "all" || specializationFilter !== "all" || approvalFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No doctors have been added to the system yet"}
          </p>
        </div>
      )}

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        doctor={selectedDoctor}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
};

export default Doctors;
