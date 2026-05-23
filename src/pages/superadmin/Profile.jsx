import React, { useEffect, useState } from 'react';
import { C } from '../../components/constants/data';
import { authService, getCurrentUser } from '../../service/auth.service';
import { toast } from 'sonner';
import { User, Mail, Phone, Edit2, Save, X, Shield, Calendar, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import CustomFileUpload from '../../components/CustomFileUpload';

const Profile = () => {
  const currentUser = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    role: currentUser?.role || 'Super Admin',
    avatarUrl: currentUser?.avatarUrl || '',
    roles: currentUser?.roles || []
  });

  // Inline styles
  const styles = {
    container: {
      fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    headerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '3rem',
      gap: '2rem',
      flexWrap: 'wrap'
    },
    headerContent: {
      flex: 1
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    headerSubtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      margin: '0'
    },
    headerActions: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.65rem 1.25rem',
      borderRadius: '0.75rem',
      fontWeight: '600',
      fontSize: '0.9rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    },
    card: {
      background: 'white',
      borderRadius: '1.25rem',
      padding: '2rem',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem',
      animation: 'slideIn 0.4s ease-out'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.75rem',
      paddingBottom: '1.25rem',
      borderBottom: '1px solid #f0f0f0'
    },
    cardHeaderTitle: {
      fontSize: '1.35rem',
      fontWeight: '700',
      margin: '0',
      color: '#1f2937'
    },
    cardHeaderIcon: {
      width: '1.5rem',
      height: '1.5rem',
      color: '#0ea5e9'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    formLabel: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    formInput: {
      padding: '0.85rem 1rem',
      border: '1.5px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      background: 'white',
      color: '#1f2937',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    formDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 0',
      color: '#1f2937',
      fontWeight: '500'
    },
    formDisplayIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#9ca3af',
      flexShrink: '0'
    },
    infoValue: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#1f2937',
      fontWeight: '500'
    },
    infoValueIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#9ca3af',
      flexShrink: '0'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: '#ecfdf5',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '0.85rem',
      color: '#047857',
      border: '1px solid #d1fae5'
    },
    statusBadgeIcon: {
      width: '1rem',
      height: '1rem'
    },
    roleBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      color: '#0c4a6e',
      borderRadius: '0.9rem',
      fontWeight: '600',
      fontSize: '0.85rem',
      border: '1px solid #7dd3fc',
      padding: '0.2rem 0.5rem'
    },
    userIdDisplay: {
      fontFamily: 'Geist Mono, monospace',
      color: '#6b7280',
      fontWeight: '500',
      fontSize: '0.95rem'
    },
    btnIcon: {
      width: '1rem',
      height: '1rem'
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Call the API to update personal information
      const response = await authService.updatePersonalInfo({
        userId: currentUser?.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        avatarUrl: formData.avatarUrl
      });

      // Update localStorage with the new user data
      const updatedUserData = {
        ...currentUser,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved'
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle different error types
      if (error.response?.status === 422) {
        toast.error('Validation failed', {
          description: 'Please check your input and try again'
        });
      } else if (error.response?.status === 404) {
        toast.error('User not found', {
          description: 'Please try logging in again'
        });
      } else if (error.response?.status === 409) {
        toast.error('Email already exists', {
          description: 'Please use a different email address'
        });
      } else {
        toast.error('Update failed', {
          description: error.response?.data?.error || 'Something went wrong. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      role: currentUser?.role || 'Super Admin',
      avatarUrl: currentUser?.avatarUrl || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getUserProfile = async () => {
    try {
      const response = await authService.getUserProfile();
      setFormData(response.user);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);


  return (
    <div style={styles.container}>
      <div style={styles.profileContainer}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Profile Settings</h1>
            <p style={styles.headerSubtitle}>Manage your account and preferences</p>
          </div>
          <div style={styles.headerActions}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                <Edit2 style={styles.btnIcon} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  style={{...styles.btn, ...styles.btnSuccess}}
                >
                  <Save style={styles.btnIcon} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{...styles.btn, ...styles.btnDanger}}
                >
                  <X style={styles.btnIcon} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <User style={styles.cardHeaderIcon} />
            <h2 style={styles.cardHeaderTitle}>Personal Information</h2>
          </div>
          
          <div style={styles.formGrid}>
            {/* Avatar */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Profile Avatar</label>
              {isEditing ? (
                <CustomFileUpload
                  // label="Profile Avatar"
                  name="avatar"
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                  circular={true}
                  width="150px"
                  maxSizeMB={5}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 0'
                }}>
                  {formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl} 
                      alt="Profile Avatar" 
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    display: formData.avatarUrl ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#1f2937',
                    fontWeight: '500'
                  }}>
                    <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                    <span>No avatar set</span>
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.formInput}
                  placeholder="Enter your full name"
                />
              ) : (
                <div style={styles.formDisplay}>
                  <User style={styles.formDisplayIcon} />
                  <span>{formData.name || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.formInput}
                  placeholder="Enter your email"
                />
              ) : (
                <div style={styles.formDisplay}>
                  <Mail style={styles.formDisplayIcon} />
                  <span>{formData.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.formInput}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div style={styles.formDisplay}>
                  <Phone style={styles.formDisplayIcon} />
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Role */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Account Role</label>
              <div style={styles.formDisplay}>
                <Shield style={styles.formDisplayIcon} />
                <span style={styles.roleBadge}>
  {formData.roles?.[0]?.name || 'No Role'}
</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        {/* <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Shield style={styles.cardHeaderIcon} />
            <h2 style={styles.cardHeaderTitle}>Account Information</h2>
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>User ID</label>
              <div style={styles.userIdDisplay}>
                #{currentUser?.id || 'N/A'}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Account Status</label>
              <div style={styles.statusBadge}>
                <CheckCircle2 style={styles.statusBadgeIcon} />
                Active
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Member Since</label>
              <div style={styles.infoValue}>
                <Calendar style={styles.infoValueIcon} />
                <span>{formatDate(currentUser?.createdAt)}</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Last Updated</label>
              <div style={styles.infoValue}>
                <Calendar style={styles.infoValueIcon} />
                <span>{formatDate(currentUser?.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;