import React, { useState, useEffect } from 'react';
import { C } from '../../components/constants/data';
import { authService, getCurrentUser } from '../../service/auth.service';
import { toast } from 'sonner';
import { Lock, LogOut, Shield, Eye, EyeOff, Smartphone, X, User, Settings as SettingsIcon, Bell, Globe } from 'lucide-react';

const Settings = () => {
  const currentUser = getCurrentUser();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorForm, setTwoFactorForm] = useState({
    email: currentUser?.email || '',
    otp: ''
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetup, setIs2FASetup] = useState(false);

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
    btnDanger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    },
    securityGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem'
    },
    securityBtn: {
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1.5px solid #e5e7eb',
      background: 'white',
      color: '#1f2937',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '600',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    securityBtnHover: {
      borderColor: '#0ea5e9',
      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
      transform: 'translateY(-1px)'
    },
    securityBtnIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#0ea5e9'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1.5px solid #e5e7eb',
      background: 'white',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    toggleInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    toggleText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    toggleLabel: {
      fontWeight: '600',
      fontSize: '0.95rem',
      color: '#1f2937',
      margin: 0
    },
    toggleDescription: {
      fontSize: '0.8rem',
      color: '#6b7280',
      margin: 0
    },
    toggleSwitch: {
      position: 'relative',
      width: '48px',
      height: '24px',
      background: '#d1d5db',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    toggleSwitchActive: {
      background: '#10b981'
    },
    toggleSlider: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '50%',
      transition: 'transform 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    toggleSliderActive: {
      transform: 'translateX(24px)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '1.25rem',
      padding: '2rem',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease-out'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: 0,
      color: '#1f2937'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalCloseHover: {
      background: '#f3f4f6'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem'
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
    formInputFocus: {
      borderColor: '#0ea5e9',
      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
    },
    passwordInputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%',
      paddingRight: '3rem'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      color: '#6b7280'
    },
    otpInput: {
      width: '100%',
      textAlign: 'center',
      fontSize: '1.25rem',
      letterSpacing: '0.25rem',
      fontWeight: '600'
    }
  };
  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both passwords are the same'
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password too short', {
        description: 'Password must be at least 8 characters long'
      });
      return;
    }

    try {
      await authService.changePassword(passwordForm);
      toast.success('Password changed successfully!', {
        description: 'Your password has been updated'
      });
      setShowChangePasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password', {
        description: error.response?.data?.error || 'Please check your current password and try again'
      });
    }
  };

  // 2FA handlers
  const handleTwoFactorChange = (e) => {
    const { name, value } = e.target;
    setTwoFactorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handle2FASetup = async () => {
    try {
      await authService.setup2FA();
      setIs2FASetup(true);
      toast.success('2FA setup initiated', {
        description: 'Please check your phone for the verification code'
      });
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup 2FA', {
        description: error.response?.data?.error || 'Please try again'
      });
    }
  };

  const handle2FAVerify = async () => {
    try {
      await authService.verify2FASetup(twoFactorForm.otp);
      setIs2FAEnabled(true);
      setIs2FASetup(false);
      toast.success('2FA enabled successfully!', {
        description: 'Your account is now protected with two-factor authentication'
      });
      setShow2FAModal(false);
      setTwoFactorForm(prev => ({ ...prev, otp: '' }));
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify 2FA', {
        description: error.response?.data?.error || 'Invalid verification code'
      });
    }
  };

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      // Disable 2FA
      const password = prompt('Please enter your password to disable 2FA:');
      if (!password) return;

      try {
        await authService.disable2FA(password);
        setIs2FAEnabled(false);
        toast.success('2FA disabled', {
          description: 'Two-factor authentication has been disabled'
        });
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        toast.error('Failed to disable 2FA', {
          description: error.response?.data?.error || 'Invalid password'
        });
      }
    } else {
      // Enable 2FA
      try {
        await authService.setup2FA();
        setIs2FASetup(true);
        setShow2FAModal(true);
        toast.success('2FA setup initiated', {
          description: 'Please check your email for the verification code'
        });
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        toast.error('Failed to setup 2FA', {
          description: error.response?.data?.error || 'Please try again'
        });
      }
    }
  };

  const handleLogout = () => {
    authService.logoutUser();
    window.location.href = '/login';
  };

  const getUserProfile = async () => {
    try {
      const response = await authService.getUserProfile();
      setIs2FAEnabled(response.user.twoFactorEnabled === 1);
      setTwoFactorForm(prev => ({
        ...prev,
        email: response.user.email || ''
      }));
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Settings</h1>
          <p style={styles.headerSubtitle}>Manage your application settings and preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Globe style={styles.cardHeaderIcon} />
            <h2 style={styles.cardHeaderTitle}>General Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#1f2937', fontWeight: '600' }}>Language</p>
                <p style={{ color: '#6b7280' }} className="text-sm">Select your preferred language</p>
              </div>
              <select className="px-4 py-2 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: 'white', color: '#1f2937', fontWeight: '500' }}>
                <option>English</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#1f2937', fontWeight: '600' }}>Timezone</p>
                <p style={{ color: '#6b7280' }} className="text-sm">Set your timezone</p>
              </div>
              <select className="px-4 py-2 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: 'white', color: '#1f2937', fontWeight: '500' }}>
                <option>UTC+05:30</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Bell style={styles.cardHeaderIcon} />
            <h2 style={styles.cardHeaderTitle}>Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#1f2937', fontWeight: '600' }}>Email Notifications</p>
                <p style={{ color: '#6b7280' }} className="text-sm">Receive email updates</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked style={{ accentColor: '#0ea5e9' }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#1f2937', fontWeight: '600' }}>Push Notifications</p>
                <p style={{ color: '#6b7280' }} className="text-sm">Receive browser notifications</p>
              </div>
              <input type="checkbox" className="w-5 h-5" style={{ accentColor: '#0ea5e9' }} />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Lock style={styles.cardHeaderIcon} />
            <h2 style={styles.cardHeaderTitle}>Security & Access</h2>
          </div>
          
          <div style={styles.securityGrid}>
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              style={styles.securityBtn}
              onMouseEnter={(e) => {
                e.target.style.borderColor = styles.securityBtnHover.borderColor;
                e.target.style.boxShadow = styles.securityBtnHover.boxShadow;
                e.target.style.transform = styles.securityBtnHover.transform;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'none';
              }}
            >
              <Lock style={styles.securityBtnIcon} />
              Change Password
            </button>
            
            <div 
              style={{
                ...styles.toggleContainer,
                ...(is2FAEnabled && { borderColor: '#10b981', background: '#f0fdf4' })
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = is2FAEnabled ? '#10b981' : '#0ea5e9';
                e.target.style.boxShadow = is2FAEnabled 
                  ? '0 4px 12px rgba(16, 185, 129, 0.15)' 
                  : '0 4px 12px rgba(14, 165, 233, 0.15)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = is2FAEnabled ? '#10b981' : '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'none';
              }}
            >
              <div style={styles.toggleInfo}>
                <Shield style={{ color: is2FAEnabled ? '#10b981' : '#0ea5e9', width: '1.25rem', height: '1.25rem' }} />
                <div style={styles.toggleText}>
                  <p style={styles.toggleLabel}>Two-Factor Authentication</p>
                  <p style={styles.toggleDescription}>
                    {is2FAEnabled ? '2FA is enabled' : 'Add an extra layer of security'}
                  </p>
                </div>
              </div>
              <div 
                onClick={handle2FAToggle}
                style={{
                  ...styles.toggleSwitch,
                  ...(is2FAEnabled && styles.toggleSwitchActive),
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <div 
                  style={{
                    ...styles.toggleSlider,
                    ...(is2FAEnabled && styles.toggleSliderActive)
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={styles.securityBtn}
              onMouseEnter={(e) => {
                e.target.style.borderColor = styles.securityBtnHover.borderColor;
                e.target.style.boxShadow = styles.securityBtnHover.boxShadow;
                e.target.style.transform = styles.securityBtnHover.transform;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'none';
              }}
            >
              <LogOut style={styles.securityBtnIcon} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Change Password</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowChangePasswordModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6b7280';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ ...styles.formGroup, marginBottom: '1rem' }}>
                <label style={styles.formLabel}>Current Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    style={{ ...styles.formInput, ...styles.passwordInput }}
                    placeholder="Enter current password"
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.formInputFocus.borderColor;
                      e.target.style.boxShadow = styles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ ...styles.formGroup, marginBottom: '1rem' }}>
                <label style={styles.formLabel}>New Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    style={{ ...styles.formInput, ...styles.passwordInput }}
                    placeholder="Enter new password (min 8 characters)"
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.formInputFocus.borderColor;
                      e.target.style.boxShadow = styles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ ...styles.formGroup, marginBottom: '1.5rem' }}>
                <label style={styles.formLabel}>Confirm New Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    style={{ ...styles.formInput, ...styles.passwordInput }}
                    placeholder="Confirm new password"
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.formInputFocus.borderColor;
                      e.target.style.boxShadow = styles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  style={{ ...styles.btn, ...styles.btnDanger }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {show2FAModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Two-Factor Authentication</h2>
              <button
                style={styles.modalClose}
                onClick={() => {
                  setShow2FAModal(false);
                  setIs2FASetup(false);
                  setTwoFactorForm(prev => ({ ...prev, otp: '' }));
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6b7280';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {!is2FAEnabled && !is2FASetup && (
              <div>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Enable two-factor authentication to add an extra layer of security to your account. 
                  You'll receive a verification code on your phone whenever you sign in.
                </p>
                
                <div style={{ ...styles.formGroup, marginBottom: '1.5rem' }}>
                  <label style={styles.formLabel}>Email</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Smartphone style={{ color: '#9ca3af' }} size={18} />
                    <input
                      type="email"
                      name="email"
                      value={twoFactorForm.email}
                      onChange={handleTwoFactorChange}
                      style={styles.formInput}
                      placeholder="Enter your email"
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.formInputFocus.borderColor;
                        e.target.style.boxShadow = styles.formInputFocus.boxShadow;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    style={{ ...styles.btn, ...styles.btnDanger }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handle2FASetup}
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {is2FASetup && (
              <div>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  We've sent a verification code to your email. Please enter the code below to complete the setup.
                </p>
                
                <div style={{ ...styles.formGroup, marginBottom: '1.5rem' }}>
                  <label style={styles.formLabel}>Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    value={twoFactorForm.otp}
                    onChange={handleTwoFactorChange}
                    style={{ ...styles.formInput, ...styles.otpInput }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.formInputFocus.borderColor;
                      e.target.style.boxShadow = styles.formInputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShow2FAModal(false);
                      setIs2FASetup(false);
                      setTwoFactorForm(prev => ({ ...prev, otp: '' }));
                    }}
                    style={{ ...styles.btn, ...styles.btnDanger }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handle2FAVerify}
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
