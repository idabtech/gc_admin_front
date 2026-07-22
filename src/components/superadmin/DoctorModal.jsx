import { useState, useEffect } from 'react';
import { doctorService } from '../../service/doctor.service';
import { C } from '../constants/data';

const DoctorModal = ({ isOpen, onClose, doctor, onActionComplete, initialMode = 'view' }) => {
  const [mode, setMode] = useState('view'); // view, edit, assign, reject, suspend
  const [formData, setFormData] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(initialMode || 'view');
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (doctor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        experience_yrs: doctor.experience_yrs || '',
        license_no: doctor.license_no || '',
        qualification: doctor.qualification || '',
        consultation_fee: doctor.consultation_fee || '',
        available_days: doctor.available_days ? JSON.parse(doctor.available_days) : [],
        available_from: doctor.available_from || '',
        available_to: doctor.available_to || '',
        is_active: doctor.is_active || 1,
        cover_photo_url: doctor.cover_photo_url || '',
        about: doctor.about || '',
        sub_specialization: doctor.sub_specialization || '',
        department_id: doctor.department_id || '',
        website: doctor.website || '',
        operating_hours: doctor.operating_hours || '',
        telemedicine: doctor.telemedicine || 0,
        telemedicine_fee: doctor.telemedicine_fee || '',
        social_facebook: doctor.social_facebook || '',
        social_instagram: doctor.social_instagram || '',
        social_linkedin: doctor.social_linkedin || '',
        social_twitter: doctor.social_twitter || '',
        bio: doctor.bio || '',
        gender: doctor.gender || '',
        date_of_birth: doctor.date_of_birth || '',
        languages: doctor.languages || '',
        awards: doctor.awards || '',
        publications: doctor.publications || [],
        fellowships: doctor.fellowships || [],
        services: doctor.services || [],
        treatments: doctor.treatments || [],
        accreditations: doctor.accreditations || [],
        achievements: doctor.achievements || [],
        insurance_plans: doctor.insurance_plans || [],
        education: doctor.education || []
      });
    }
  }, [doctor]);

  const fetchHospitals = async () => {
    try {
      const data = await doctorService.getHospitalsForAssignment();
      setHospitals(data.hospitals || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (mode === 'assign') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHospitals();
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      switch (mode) {
        case 'edit': {
          // Format the data before sending to API
          const formattedData = {
            ...formData,
            available_days: JSON.stringify(formData.available_days || [])
          };
          await doctorService.updateDoctorProfile(doctor.id, formattedData);
          break;
        }
        case 'assign':
          await doctorService.assignHospital(doctor.id, formData.hospital_id);
          break;
        case 'reject':
          await doctorService.rejectDoctor(doctor.id, reason);
          break;
        case 'suspend':
          await doctorService.suspendDoctor(doctor.id, reason);
          break;
        default:
          break;
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
      await doctorService.approveDoctor(doctor.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      await doctorService.unsuspendDoctor(doctor.id);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.name}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await doctorService.deleteDoctorProfile(doctor.id);
        onActionComplete();
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (mode) {
      case 'view':
        return (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Header */}
            <div className="text-center mb-6">
              {doctor.cover_photo_url ? (
                <img
                  src={doctor.cover_photo_url}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                  style={{ background: C.teal, color: C.white }}
                >
                  {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
              )}
              <h3 className="text-xl font-bold text-black">{doctor.name}</h3>
              <p style={{ color: C.slate }}>{doctor.email}</p>
              <p style={{ color: C.slate }} className="text-sm">{doctor.phone || 'N/A'}</p>
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Gender</p>
                  <p className="text-black">{doctor.gender || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Date of Birth</p>
                  <p className="text-black">{doctor.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Languages</p>
                  <p className="text-black">{doctor.languages || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Status</p>
                  <p className="text-black">
                    <span className={`px-2 py-1 rounded text-xs ${doctor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Professional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Specialization</p>
                  <p className="text-black">{doctor.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Sub-specialization</p>
                  <p className="text-black">{doctor.sub_specialization || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Experience</p>
                  <p className="text-black">{doctor.experience_yrs ? `${doctor.experience_yrs} years` : 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">License Number</p>
                  <p className="text-black">{doctor.license_no || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Qualification</p>
                  <p className="text-black">{doctor.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Consultation Fee</p>
                  <p className="text-black">{doctor.consultation_fee ? `$${doctor.consultation_fee}` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Hospital Information */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Hospital Information</h4>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Hospital</p>
                <p className="text-black">{doctor.hospital_name || 'Not Assigned'}</p>
                {doctor.hospital_city && (
                  <p style={{ color: C.slateL }} className="text-sm">
                    📍 {doctor.hospital_city}, {doctor.hospital_state}
                  </p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Availability</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Available Days</p>
                  <p className="text-black">
                    {doctor.available_days ? JSON?.parse(doctor.available_days).join(', ') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Working Hours</p>
                  <p className="text-black">
                    {doctor.available_from && doctor.available_to
                      ? `${doctor.available_from} - ${doctor.available_to}`
                      : doctor.operating_hours || 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Telemedicine</p>
                  <p className="text-black">
                    <span className={`px-2 py-1 rounded text-xs ${doctor.telemedicine ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {doctor.telemedicine ? `Available ($${doctor.telemedicine_fee || '0'})` : 'Not Available'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Online Presence</h4>
              <div className="space-y-2">
                {doctor.website && (
                  <div>
                    <p style={{ color: C.slate }} className="text-sm mb-1">Website</p>
                    <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {doctor.website}
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {doctor.social_facebook && (
                    <div>
                      <p style={{ color: C.slate }} className="text-sm mb-1">Facebook</p>
                      <a href={doctor.social_facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Facebook
                      </a>
                    </div>
                  )}
                  {doctor.social_instagram && (
                    <div>
                      <p style={{ color: C.slate }} className="text-sm mb-1">Instagram</p>
                      <a href={doctor.social_instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Instagram
                      </a>
                    </div>
                  )}
                  {doctor.social_linkedin && (
                    <div>
                      <p style={{ color: C.slate }} className="text-sm mb-1">LinkedIn</p>
                      <a href={doctor.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {doctor.social_twitter && (
                    <div>
                      <p style={{ color: C.slate }} className="text-sm mb-1">Twitter</p>
                      <a href={doctor.social_twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Twitter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About & Bio */}
            <div>
              <h4 className="font-semibold mb-3 text-black">About & Bio</h4>
              <div className="space-y-4">
                {doctor.about && (
                  <div>
                    <p style={{ color: C.slate }} className="text-sm mb-1">About</p>
                    <p className="text-black text-sm">{doctor.about}</p>
                  </div>
                )}
                {doctor.bio && (
                  <div>
                    <p style={{ color: C.slate }} className="text-sm mb-1">Bio</p>
                    <p className="text-black text-sm">{doctor.bio}</p>
                  </div>
                )}
                {doctor.awards && (
                  <div>
                    <p style={{ color: C.slate }} className="text-sm mb-1">Awards & Achievements</p>
                    <p className="text-black text-sm">{doctor.awards}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h4 className="font-semibold mb-3 text-black">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Rating</p>
                  <p className="text-black">
                    {doctor.rating ? `⭐ ${doctor.rating} (${doctor.total_reviews} reviews)` : 'No ratings yet'}
                  </p>
                </div>
                <div>
                  <p style={{ color: C.slate }} className="text-sm mb-1">Suspended</p>
                  <p className="text-black">
                    <span className={`px-2 py-1 rounded text-xs ${doctor.is_suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {doctor.is_suspended ? `Yes (${doctor.suspended_reason || 'No reason'})` : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'edit':
        return (
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Languages
                  </label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g., English, Spanish, French"
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    value={formData.experience_yrs}
                    onChange={(e) => setFormData({ ...formData, experience_yrs: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={formData.license_no}
                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Qualification *
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Consultation Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Availability</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Available Days
                  </label>
                  <div className="space-y-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.available_days.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, available_days: [...formData.available_days, day] });
                            } else {
                              setFormData({ ...formData, available_days: formData.available_days.filter(d => d !== day) });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-black">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs" style={{ color: C.slateL }}>From</label>
                      <input
                        type="time"
                        value={formData.available_from}
                        onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-transparent text-black"
                        style={{ borderColor: C.border }}
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: C.slateL }}>To</label>
                      <input
                        type="time"
                        value={formData.available_to}
                        onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-transparent text-black"
                        style={{ borderColor: C.border }}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs" style={{ color: C.slateL }}>Operating Hours</label>
                    <input
                      type="text"
                      value={formData.operating_hours}
                      onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="w-full px-3 py-2 rounded-lg border bg-transparent text-black"
                      style={{ borderColor: C.border }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Telemedicine */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Telemedicine</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.telemedicine === 1}
                      onChange={(e) => setFormData({ ...formData, telemedicine: e.target.checked ? 1 : 0 })}
                      className="mr-2"
                    />
                    <span className="text-black">Available for Telemedicine</span>
                  </label>
                </div>
                {formData.telemedicine === 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                      Telemedicine Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.telemedicine_fee}
                      onChange={(e) => setFormData({ ...formData, telemedicine_fee: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                      style={{ borderColor: C.border }}
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Online Presence</h3>
              <div className="grid grid-cols-2 gap-4">
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Cover Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.cover_photo_url}
                    onChange={(e) => setFormData({ ...formData, cover_photo_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.social_facebook}
                    onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.social_instagram}
                    onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.social_linkedin}
                    onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.social_twitter}
                    onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                </div>
              </div>
            </div>

            {/* About & Bio */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">About & Bio</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    About
                  </label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    rows="3"
                    placeholder="Brief description about the doctor..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    rows="4"
                    placeholder="Detailed biography..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                    Awards & Achievements
                  </label>
                  <textarea
                    value={formData.awards}
                    onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    rows="3"
                    placeholder="List of awards and achievements..."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Status</h3>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    className="mr-2"
                  />
                  <span className="text-black">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.teal, color: C.white }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setMode('view')}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'assign':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Assign Hospital
              </label>
              <select
                value={formData.hospital_id || ''}
                onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                className="px-4 py-3 rounded-lg border bg-transparent text-black"
                style={{ borderColor: C.border }}
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name} - {hospital.city}, {hospital.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.teal, color: C.white }}
              >
                {loading ? 'Assigning...' : 'Assign Hospital'}
              </button>
              <button
                type="button"
                onClick={() => setMode('view')}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'reject':
      case 'suspend':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Please provide a reason for ${mode === 'reject' ? 'rejecting' : 'suspending'} this doctor profile...`}
                className="w-full px-4 py-3 rounded-lg border bg-transparent text-black placeholder-gray-500"
                style={{ borderColor: C.border }}
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: mode === 'reject' ? C.red : C.orange, color: C.white }}
              >
                {loading ? `${mode === 'reject' ? 'Rejecting' : 'Suspending'}...` : mode === 'reject' ? 'Reject Profile' : 'Suspend Doctor'}
              </button>
              <button
                type="button"
                onClick={() => setMode('view')}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.border, color: C.white }}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: C.navy, borderColor: C.border }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {mode === 'view' && 'Doctor Details'}
            {mode === 'edit' && 'Edit Doctor Profile'}
            {/* {mode === 'assign' && 'Assign Hospital'} */}
            {mode === 'reject' && 'Reject Doctor Profile'}
            {mode === 'suspend' && 'Suspend Doctor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action Buttons for View Mode */}
        {mode === 'view' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {doctor.approval_status === 'pending' && (
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
                  onClick={() => setMode('reject')}
                  className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                  style={{ background: C.red, color: C.white }}
                >
                  ✗ Reject
                </button>
              </>
            )}

            <button
              onClick={() => setMode('edit')}
              className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
              style={{ background: C.blue, color: C.white }}
            >
              ✏️ Edit Profile
            </button>

            {/* <button
              onClick={() => setMode('assign')}
              className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
              style={{ background: C.purple, color: C.white }}
            >
              🏥 Assign Hospital
            </button> */}

            {doctor.is_suspended ? (
              <button
                onClick={handleUnsuspend}
                disabled={loading}
                className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.green, color: C.white }}
              >
                {loading ? 'Unsuspending...' : '↩️ Unsuspend'}
              </button>
            ) : (
              <button
                onClick={() => setMode('suspend')}
                className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.orange, color: C.white }}
              >
                ⚠️ Suspend
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={loading}
              className="py-2 px-4 rounded-lg font-semibold transition cursor-pointer"
              style={{ background: C.red, color: C.white }}
            >
              {loading ? 'Deleting...' : '🗑️ Delete Doctor'}
            </button>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorModal;
