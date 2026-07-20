import React, { useEffect, useState } from "react";
import { hospitalService } from "../../service/hospital.service";
import { C } from "../../components/constants/data";
import HospitalModal from "../../components/superadmin/HospitalModal";
import { Search, Plus, MoreVertical, Zap, Users, Bed, TrendingUp, Filter, ArrowRight } from "lucide-react";

const HospitalsModern = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modalMode, setModalMode] = useState('view');

  const fetchHospitals = async () => {
    try {
      const data = await hospitalService.getHospitals();
      setHospitals(data.hospitals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchAndFilterHospitals = async () => {
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (approvalFilter !== "all") filters.approval_status = approvalFilter;
      const data = await hospitalService.searchHospitals(searchQuery, filters);
      setHospitals(data.hospitals || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (searchQuery || statusFilter !== "all" || approvalFilter !== "all") {
      searchAndFilterHospitals();
    } else {
      fetchHospitals();
    }
  }, [searchQuery, statusFilter, approvalFilter]);

  const openHospitalModal = (hospital, mode) => {
    setSelectedHospital(hospital);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedHospital(null);
    setIsModalOpen(false);
  };

  const handleActionComplete = () => {
    fetchHospitals();
  };

  const toggleDropdown = (e, hospitalId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === hospitalId ? null : hospitalId);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleDropdownAction = async (action, hospital, e) => {
    e.stopPropagation();
    closeDropdown();
    switch (action) {
      case 'edit':
        openHospitalModal(hospital, 'edit');
        break;
      case 'delete':
        // openHospitalModal(hospital, 'delete');
        if (window.confirm(`Are you sure you want to delete ${hospital.name}?`)) {
          try {
            await hospitalService.deleteHospital(hospital.id);
            fetchHospitals();
          } catch (err) {
            console.error(err);
          }
        }
        break;
      case 'view':
        openHospitalModal(hospital, 'view');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = () => closeDropdown();
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const getStatusColor = (hospital) => {
    if (hospital.approval_status === 'pending') return '#f59e0b';
    if (hospital.approval_status === 'rejected') return '#ef4444';
    if (hospital.is_active) return '#10b981';
    return '#6b7280';
  };

  const getStatusText = (hospital) => {
    if (hospital.approval_status === 'pending') return 'Pending Approval';
    if (hospital.approval_status === 'rejected') return 'Rejected';
    if (hospital.is_active) return 'Active';
    return 'Inactive';
  };

  const handleActivate = async (hospitalId) => {
    setLoading(true);
    try {
      await hospitalService.activateHospital(hospitalId);
      fetchHospitals();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (hospitalId) => {
    setLoading(true);
    try {
      await hospitalService.deactivateHospital(hospitalId);
      fetchHospitals();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        // background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <style>{`
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(148, 163, 184, 0.2);
            border-top-color: #0ea5e9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const activeHospitals = hospitals.filter(h => h.is_active && h.is_approved === 1).length;
  const pendingHospitals = hospitals.filter(h => h.is_approved === 0).length;
  const inactiveHospitals = hospitals.filter(h => !h.is_active).length;

  return (
    <div style={{
      // background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: 'black',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          animation: slideInLeft 0.6s ease-out;
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, ${C.teal} 0%, ${C.tealL} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-content p {
          color: ${C.black};
          margin: 0;
          font-size: 0.95rem;
        }

        .header-action {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(14, 165, 233, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .stat-card {
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          border-color: rgba(14, 165, 233, 0.4);
          transform: translateY(-4px);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card-content {
          position: relative;
          z-index: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #75787a;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .stat-icon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          background: rgba(14, 165, 233, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0ea5e9;
          opacity: 0.7;
        }

        .filters-section {
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .search-input,
        .filter-select {
          // background: rgba(148, 163, 184, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.2);
          // color: rgba(148, 163, 184, 0.9);
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
        }

        .search-input input {
          background: none;
          border: none;
          color: ${C.black};
          outline: none;
          flex: 1;
          font-size: 0.9rem;
        }

        .search-input input::placeholder {
          color: ${C.slate};
        }

        .search-input:focus-within {
          // background: ${C.tealTransparent};
          border-color: ${C.tealBorder};
        }

        .filter-select {
          cursor: pointer;
        }

        .filter-select:hover {
          // background: ${C.tealTransparent};
          border-color: ${C.tealBorder};
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        .hospital-card {
          border: 1px solid ${C.border};
          border-radius: 14px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .hospital-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${C.teal}, ${C.tealL});
          transform: translateY(-3px);
          transition: transform 0.3s ease;
        }

        .hospital-card:hover {
          border-color: ${C.tealBorder};
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(11, 181, 160, 0.15);
        }

        .hospital-card:hover::before {
          transform: translateY(0);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .hospital-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, ${C.teal} 0%, ${C.tealL} 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          margin-right: 1rem;
        }

        .hospital-header-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: ${C.black};
        }

        .hospital-header-info p {
          margin: 0;
          color: ${C.slateL};
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-pending {
          background: ${C.goldL};
          color: ${C.gold};
        }

        .status-active {
          background: ${C.green};
          color: white;
        }

        .status-inactive {
          background: ${C.slateL};
          color: ${C.slate};
        }

        .status-rejected {
          background: ${C.redTransparent};
          color: ${C.red};
        }

        .card-location {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${C.border};
        }

        .location-text {
          color: ${C.slateL};
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .address-text {
          color: ${C.slateL};
          font-size: 0.8rem;
        }

        .beds-section {
          margin-bottom: 1rem;
        }

        .beds-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .beds-label {
          font-size: 0.85rem;
          color: ${C.slateL};
          font-weight: 500;
        }

        .beds-value {
          color: ${C.teal};
          font-weight: 700;
          font-size: 0.85rem;
        }

        .beds-bar {
          width: 100%;
          height: 8px;
          background: ${C.border};
          border-radius: 4px;
          overflow: hidden;
        }

        .beds-fill {
          height: 100%;
          background: linear-gradient(90deg, ${C.teal} 0%, ${C.tealL} 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .stats-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${C.border};
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #5d5a5a;
          margin-bottom: 0.3rem;
          font-weight: 500;
        }

        .stat-number {
          font-size: 1.3rem;
          font-weight: 700;
          color: ${C.black};
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
        }

        .btn-small {
          flex: 1;
          padding: 0.65rem;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .btn-approve {
          background: ${C.green};
          color: white;
          border: 1px solid ${C.green};
        }

        .btn-approve:hover {
          background: #059669;
          border-color: #059669;
        }

        .btn-reject {
          background: ${C.red};
          color: white;
          border: 1px solid ${C.red};
        }

        .btn-reject:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        .dropdown-menu {
          position: relative;
        }

        .dropdown-btn {
          width: 36px;
          height: 36px;
          // background: rgba(148, 163, 184, 0.15);
          // border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          margin-left: 10px;
        }

        .dropdown-btn:hover {
          background: rgba(14, 165, 233, 0.15);
          border-color: rgba(14, 165, 233, 0.3);
          color: #0ea5e9;
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white ;
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: black;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 9999999999;
          min-width: 180px;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          color: black;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
        }

        .dropdown-item.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 2rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          color: #94a3b8;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h1>Hospital Network</h1>
          <p>Manage and monitor healthcare facilities</p>
        </div>
        <div className="header-action">
          <button
            onClick={() => openHospitalModal(null, 'add')}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Hospital
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{hospitals.length}</div>
            <div className="stat-label">Total Hospitals</div>
          </div>
          <div className="stat-icon">
            <Zap size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value" style={{ color: '#22c55e' }}>{activeHospitals}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value" style={{ color: '#fbbf24' }}>{pendingHospitals}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <Filter size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value" style={{ color: '#ef4444' }}>{inactiveHospitals}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="search-input">
            <Search size={18} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search hospitals by name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="hospitals-grid">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="hospital-card"
            onClick={() => openHospitalModal(hospital, 'view')}
          >
            {/* Card Header */}
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div className="hospital-avatar">
                  {hospital.name?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div className="hospital-header-info">
                  <h3>{hospital.name}</h3>
                  <p>{hospital.email}</p>
                </div>
              </div>
              <span
                className={`status-badge status-${hospital.approval_status === 'pending'
                  ? 'pending'
                  : hospital.approval_status === 'rejected'
                    ? 'rejected'
                    : hospital.is_active
                      ? 'active'
                      : 'inactive'
                  }`}
              >
                {getStatusText(hospital)}
              </span>
              <div className="dropdown-menu">
                <button
                  onClick={(e) => toggleDropdown(e, hospital.id)}
                  className="dropdown-btn"
                >
                  <MoreVertical size={18} />
                </button>
                {activeDropdown === hospital.id && (
                  <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                    <div
                      onClick={(e) => handleDropdownAction('view', hospital, e)}
                      className="dropdown-item"
                    >
                      👁️ View
                    </div>
                    <div
                      onClick={(e) => handleDropdownAction('edit', hospital, e)}
                      className="dropdown-item"
                    >
                      ✏️ Edit
                    </div>
                    <div
                      onClick={(e) => handleDropdownAction('delete', hospital, e)}
                      className="dropdown-item danger"
                    >
                      🗑️ Delete
                    </div>
                    <div
                      onClick={() => handleDeactivate(hospital.id)}
                      className="dropdown-item"
                    >
                      ❌ Deactivate
                    </div>
                    <div
                      onClick={() => handleActivate(hospital.id)}
                      className="dropdown-item"
                    >
                      ✅ Activate
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="card-location">
              <div className="location-text">
                📍 {hospital.city}, {hospital.state}
              </div>
              <div className="address-text">{hospital.address}</div>
            </div>

            {/* Beds */}
            <div className="beds-section">
              <div className="beds-header">
                <span className="beds-label">Bed Availability</span>
                <span className="beds-value">
                  {hospital.available_beds}/{hospital.total_beds}
                </span>
              </div>
              <div className="beds-bar">
                <div
                  className="beds-fill"
                  style={{
                    width: `${(hospital.available_beds / hospital.total_beds) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="stat">
                <div className="stat-label">Doctors</div>
                <div className="stat-number">{hospital.doctor_count || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Rating</div>
                <div className="stat-number">⭐ {hospital.rating || '—'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions">
              {hospital.is_approved === 0 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/hospitals/${hospital.id}/approve`;
                    }}
                    className="btn-small btn-approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openHospitalModal(hospital, 'view');
                    }}
                    className="btn-small btn-reject"
                  >
                    Reject
                  </button>
                </>
              )}


            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {hospitals.length === 0 && !loading && (
        <div className="hospitals-grid">
          <div className="empty-state">
            <div className="empty-icon">🏥</div>
            <h3 className="empty-title">No hospitals found</h3>
            <p className="empty-text">
              {searchQuery || statusFilter !== 'all' || approvalFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No hospitals have been added to the system yet'}
            </p>
          </div>
        </div>
      )}

      {/* Hospital Modal */}
      <HospitalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        hospital={selectedHospital}
        onActionComplete={handleActionComplete}
        mode={modalMode}
      />
    </div>
  );
};

export default HospitalsModern;