import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../service/hospital.service';
import { C } from '../constants/data';

const HospitalModal = ({ isOpen, onClose, hospital, onActionComplete, mode }) => {
  
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        email: hospital.email || '',
        phone: hospital.phone || '',
        address: hospital.address || '',
        city: hospital.city || '',
        state: hospital.state || '',
        zip_code: hospital.zip_code || '',
        total_beds: hospital.total_beds || '',
        available_beds: hospital.available_beds || '',
        emergency_contact: hospital.emergency_contact || '',
        description: hospital.description || '',
        website: hospital.website || '',
        license_number: hospital.license_number || ''
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        total_beds: '',
        available_beds: '',
        emergency_contact: '',
        description: '',
        website: '',
        license_number: ''
      });
    }
  }, [hospital, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentMode === 'add') {
        await hospitalService.createHospital(formData);
      } else if (currentMode === 'edit') {
        await hospitalService.updateHospital(hospital.id, formData);
      }
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await hospitalService.approveHospital(hospital.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      await hospitalService.rejectHospital(hospital.id, reason);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await hospitalService.activateHospital(hospital.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await hospitalService.deactivateHospital(hospital.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await hospitalService.deleteHospital(hospital.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (currentMode) {
      case 'view':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                style={{ background: C.teal, color: C.white }}
              >
                {hospital.name?.charAt(0)?.toUpperCase() || 'H'}
              </div>
              <h3 className="text-xl font-bold text-black">{hospital.name}</h3>
              <p style={{ color: C.slate }}>{hospital.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Phone</p>
                <p className="text-black">{hospital.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Website</p>
                <p className="text-black">{hospital.website || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Total Beds</p>
                <p className="text-black">{hospital.total_beds || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Available Beds</p>
                <p className="text-black">{hospital.available_beds || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Address</p>
              <p className="text-black">
                {hospital.address && `${hospital.address}, `}
                {hospital.city && `${hospital.city}, `}
                {hospital.state && `${hospital.state} `}
                {hospital.zip_code}
              </p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Emergency Contact</p>
              <p className="text-black">{hospital.emergency_contact || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">License Number</p>
              <p className="text-black">{hospital.license_number || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Description</p>
              <p className="text-black">{hospital.description || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Doctors</p>
              <p className="text-black">{hospital.doctor_count || 0} doctors</p>
            </div>
          </div>
        );

      case 'add':
      case 'edit':
        return (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Hospital Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Total Beds *
                </label>
                <input
                  type="number"
                  value={formData.total_beds}
                  onChange={(e) => setFormData({ ...formData, total_beds: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter total beds"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Available Beds
                </label>
                <input
                  type="number"
                  value={formData.available_beds}
                  onChange={(e) => setFormData({ ...formData, available_beds: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter available beds"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter state"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter zip code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter license number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                style={{ borderColor: C.border }}
                required
                placeholder="Enter hospital address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                style={{ borderColor: C.border }}
                placeholder="Enter emergency contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                style={{ borderColor: C.border }}
                rows="3"
                placeholder="Enter hospital description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.teal, color: C.white }}
              >
                {loading ? 'Saving...' : (currentMode === 'add' ? 'Add Hospital' : 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'reject':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleReject(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Reason for Rejection *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this hospital registration..."
                className="w-full px-4 py-3 rounded-lg border bg-transparent text-black placeholder-gray-500"
                style={{ borderColor: C.border }}
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.red, color: C.white }}
              >
                {loading ? 'Rejecting...' : 'Reject Hospital'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('view')}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-black mb-2">Delete Hospital</h3>
              <p style={{ color: C.slate }}>
                Are you sure you want to delete "{hospital.name}"? This action cannot be undone.
              </p>
              {hospital.doctor_count > 0 && (
                <p className="mt-2" style={{ color: C.orange }}>
                  ⚠️ This hospital has {hospital.doctor_count} doctors who will also be affected.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.red, color: C.white }}
              >
                {loading ? 'Deleting...' : 'Delete Hospital'}
              </button>
              <button
                onClick={() => setCurrentMode('view')}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-sm"
        style={{ 
          background: C.navy, 
          borderColor: C.border,
          border: `1px solid ${C.border}`
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {currentMode === 'view' && 'Hospital Details'}
            {currentMode === 'add' && 'Add New Hospital'}
            {currentMode === 'edit' && 'Edit Hospital'}
            {currentMode === 'reject' && 'Reject Hospital Registration'}
            {currentMode === 'delete' && 'Delete Hospital'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action Buttons for View Mode */}
        {currentMode === 'view' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {hospital.approval_status === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                  style={{ background: C.green, color: C.white }}
                >
                  {loading ? 'Approving...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => setCurrentMode('reject')}
                  className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                  style={{ background: C.red, color: C.white }}
                >
                  ✗ Reject
                </button>
              </>
            )}
            
            <button
              onClick={() => setCurrentMode('edit')}
              className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
              style={{ background: C.blue, color: C.white }}
            >
              ✏️ Edit
            </button>
            
            {hospital.is_active ? (
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.orange, color: C.white }}
              >
                {loading ? 'Deactivating...' : '⏸️ Deactivate'}
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={loading}
                className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.green, color: C.white }}
              >
                {loading ? 'Activating...' : '▶️ Activate'}
              </button>
            )}
            
            <button
              onClick={() => setCurrentMode('delete')}
              className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
              style={{ background: C.red, color: C.white }}
            >
              🗑️ Delete
            </button>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default HospitalModal;
