import React, { useState, useEffect, useRef } from 'react';
import { hospitalService } from '../../service/hospital.service';
import { C } from '../constants/data';
import { toast } from 'sonner';

const HospitalModal = ({ isOpen, onClose, hospital, onActionComplete, mode }) => {

  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const autocompleteInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Clear search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSearching(false);
      setShowResults(false);
    }
  }, [isOpen]);

  // Handle click outside to close dropdown search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteInputRef.current && !autocompleteInputRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch from OpenStreetMap Nominatim with 500ms debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=6&q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error searching places:", error);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPlace = (place) => {
    clg
    const addr = place.address || {};
    const extra = place.extratags || {};

    // Extract the place name
    const name = addr.amenity || addr.hospital || addr.clinic || place.name || place.display_name.split(',')[0];

    // Build street address
    const streetParts = [
      addr.house_number,
      addr.road,
      addr.suburb || addr.neighbourhood
    ].filter(Boolean);
    const streetAddress = streetParts.join(', ') || place.display_name;

    // Get administrative components
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const state = addr.state || '';
    const zipCode = addr.postcode || '';

    // Extract contact and descriptive details from extra tags
    const email = extra.email || extra["contact:email"] || '';
    const phone = extra.phone || extra["contact:phone"] || extra["phone:mobile"] || '';
    const website = extra.website || extra["contact:website"] || '';
    const description = extra.description || extra.comment || extra.note || '';
    const emergencyContact = extra.emergency_phone || extra["emergency:phone"] || extra["contact:emergency"] || '';

    setFormData(prev => ({
      ...prev,
      name: name || prev.name || '',
      address: streetAddress || prev.address || '',
      city: city || prev.city || '',
      state: state || prev.state || '',
      zip_code: zipCode || prev.zip_code || '',
      email: email || prev.email || '',
      phone: phone || prev.phone || '',
      website: website || prev.website || '',
      description: description || prev.description || '',
      emergency_contact: emergencyContact || prev.emergency_contact || '',
    }));

    setSearchQuery(name);
    setSearchResults([]);
    setShowResults(false);
    toast.success(`Filled details for "${name}"`);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
    }
  }, [mode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setReason('');
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
    }
  }, [hospital, mode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentMode === 'add') {
        await hospitalService.createHospital(formData);
        toast.success('Hospital added successfully');
      } else if (currentMode === 'edit') {
        await hospitalService.updateHospital(hospital.id, formData);
        toast.success('Hospital updated successfully');
      }
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await hospitalService.approveHospital(hospital.id);
      toast.success('Hospital approved successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to approve hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await hospitalService.rejectHospital(hospital.id, reason);
      toast.success('Hospital rejected successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to reject hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await hospitalService.activateHospital(hospital.id);
      toast.success('Hospital activated successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to activate hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await hospitalService.deactivateHospital(hospital.id);
      toast.success('Hospital deactivated successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to deactivate hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await hospitalService.deleteHospital(hospital.id);
      toast.success('Hospital deleted successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to delete hospital');
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
                {hospital?.name?.charAt(0)?.toUpperCase() || 'H'}
              </div>
              <h3 className="text-xl font-bold text-black">{hospital?.name}</h3>
              <p style={{ color: C.slate }}>{hospital?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Phone</p>
                <p className="text-black">{hospital?.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Website</p>
                <p className="text-black">{hospital?.website || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Total Beds</p>
                <p className="text-black">{hospital?.total_beds || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Available Beds</p>
                <p className="text-black">{hospital?.available_beds || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Address</p>
              <p className="text-black">
                {hospital?.address && `${hospital?.address}, `}
                {hospital?.city && `${hospital?.city}, `}
                {hospital?.state && `${hospital?.state} `}
                {hospital?.zip_code}
              </p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Emergency Contact</p>
              <p className="text-black">{hospital?.emergency_contact || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">License Number</p>
              <p className="text-black">{hospital?.license_number || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Description</p>
              <p className="text-black">{hospital?.description || 'N/A'}</p>
            </div>

            <div>
              <p style={{ color: C.slate }} className="text-sm mb-1">Doctors</p>
              <p className="text-black">{hospital?.doctor_count || 0} doctors</p>
            </div>
          </div>
        );

      case 'add':
      case 'edit':
        return (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Search (OpenStreetMap Free Search) Auto-fill */}
            <div className="p-4 rounded-lg border mb-4 bg-gray-50/50" style={{ borderColor: C.border }}>
              <label className="block text-sm font-semibold mb-2 text-black flex items-center gap-1">
                <span className="text-base">🔍</span> Search Hospital on Map
              </label>
              <div className="relative" ref={autocompleteInputRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full px-4 py-3 rounded-lg border bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  style={{ borderColor: C.border }}
                  placeholder="Type hospital name, location or city..."
                />

                {searching && (
                  <div className="absolute right-3 top-3.5 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-500/80 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {showResults && searchResults.length > 0 && (
                  <div
                    className="absolute left-0 right-0 mt-1.5 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-100"
                    style={{ borderColor: C.border }}
                  >
                    {searchResults.map((place) => {
                      const addr = place.address || {};
                      const name = addr.amenity || addr.hospital || addr.clinic || place.name || place.display_name.split(',')[0];
                      return (
                        <button
                          key={place.place_id}
                          type="button"
                          onClick={() => handleSelectPlace(place)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition cursor-pointer"
                        >
                          <span className="font-semibold text-sm text-black">{name}</span>
                          <span className="text-xs text-gray-500 truncate mt-0.5">{place.display_name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {showResults && searchQuery.trim().length >= 3 && !searching && searchResults.length === 0 && (
                  <div
                    className="absolute left-0 right-0 mt-1.5 bg-white border rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 z-50"
                    style={{ borderColor: C.border }}
                  >
                    No matching hospitals found. Try a different name or location.
                  </div>
                )}
              </div>
              <p className="text-xs mt-1.5 text-gray-500">
                Select a hospital from the list to automatically fill in its name, address, city, state, and zip code.
              </p>
            </div>

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
                Are you sure you want to delete "{hospital?.name}"? This action cannot be undone.
              </p>
              {hospital?.doctor_count > 0 && (
                <p className="mt-2" style={{ color: C.orange }}>
                  ⚠️ This hospital has {hospital?.doctor_count} doctors who will also be affected.
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
            {hospital?.approval_status === 'pending' && (
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

            {hospital?.is_active ? (
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
