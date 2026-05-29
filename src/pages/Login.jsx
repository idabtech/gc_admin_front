import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Loader, Shield, Smartphone, Key } from 'lucide-react';
import { C } from '../components/constants/data';
import { authService } from '../service/auth.service';

const Login = () => {
  // Authentication flow states
  const [authFlow, setAuthFlow] = useState('login'); // 'login', '2fa-verify', '2fa-setup', '2fa-setup-verify'
  const [pendingUser, setPendingUser] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    phone: '',
    setupOtp: '',
    disablePassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Phone validation regex
  const validatePhone = (phone) => {
    const regex = /^[+]?[1-9]\d{1,14}$/;
    return regex.test(phone);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    if (!value.trim()) {
      switch(name) {
        case 'email':
        case 'password':
        case 'otp':
        case 'setupOtp':
        case 'phone':
        case 'disablePassword':
          error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
          break;
      }
    } else if (name === 'email' && !validateEmail(value)) {
      error = 'Please enter a valid email address';
    } else if (name === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (name === 'otp' && value.length !== 6) {
      error = 'OTP must be exactly 6 digits';
    } else if (name === 'setupOtp' && value.length !== 6) {
      error = 'OTP must be exactly 6 digits';
    } else if (name === 'phone' && !validatePhone(value)) {
      error = 'Please enter a valid phone number';
    } else if (name === 'disablePassword' && value.length < 4) {
      error = 'Password must be at least 4 characters';
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (authFlow === 'login') {
      await handleLogin();
    } else if (authFlow === '2fa-verify') {
      await handle2FAVerify();
    } else if (authFlow === '2fa-setup') {
      await handle2FASetup();
    } else if (authFlow === '2fa-setup-verify') {
      await handle2FASetupVerify();
    }
  };

  // Handle initial login
  const handleLogin = async () => {
    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }
    const payload = {email: formData.email, password: formData.password}
    setLoading(true);

    try {
      const response = await authService.login(payload);
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setPendingUser({ email: response.email || formData.email });
        setAuthFlow('2fa-verify');
        setFormData(prev => ({ ...prev, otp: '' }));
        toast.info('2FA Required', {
          description: 'Please enter verification code sent to your device'
        });
        return;
      }
      
      // Store token and user data in localStorage for successful login
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      toast.success('Login successful! Redirecting...', {
        description: 'Welcome back to your admin panel'
      });
      
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      toast.error('Login failed', {
        description: error.response?.data?.message || 'Please check your credentials and try again'
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification during login
  const handle2FAVerify = async () => {
    const otpError = validateField('otp', formData.otp);
    
    if (otpError) {
      setErrors({ otp: otpError });
      setTouched({ otp: true });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verify2FA(pendingUser.email, formData.otp);
      
      // Store token and user data from nested data structure
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      toast.success('Login successful! Redirecting...', {
        description: '2FA verification complete'
      });
      
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      toast.error('2FA verification failed', {
        description: error.response?.data?.error || 'Invalid verification code'
      });
      console.error('2FA verify error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA setup
  const handle2FASetup = async () => {
    const phoneError = validateField('phone', formData.phone);
    
    if (phoneError) {
      setErrors({ phone: phoneError });
      setTouched({ phone: true });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.setup2FA(formData.phone);
      
      setAuthFlow('2fa-setup-verify');
      setFormData(prev => ({ ...prev, setupOtp: '' }));
      toast.success('2FA setup initiated', {
        description: 'Verification code sent to your phone and email'
      });
    } catch (error) {
      toast.error('2FA setup failed', {
        description: error.response?.data?.error || 'Failed to initiate 2FA setup'
      });
      console.error('2FA setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA setup verification
  const handle2FASetupVerify = async () => {
    const setupOtpError = validateField('setupOtp', formData.setupOtp);
    
    if (setupOtpError) {
      setErrors({ setupOtp: setupOtpError });
      setTouched({ setupOtp: true });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verify2FASetup(formData.setupOtp);
      
      toast.success('2FA enabled successfully!', {
        description: 'Your account is now protected with two-factor authentication'
      });
      
      // Reset to login flow
      resetForm();
      setAuthFlow('login');
    } catch (error) {
      toast.error('2FA verification failed', {
        description: error.response?.data?.error || 'Invalid verification code'
      });
      console.error('2FA setup verify error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      otp: '',
      phone: '',
      setupOtp: '',
      disablePassword: ''
    });
    setErrors({});
    setTouched({});
    setPendingUser(null);
  };

  // Go back to login
  const backToLogin = () => {
    resetForm();
    setAuthFlow('login');
  };

  const isFormValid = () => {
    switch(authFlow) {
      case 'login':
        return formData.email && formData.password && !errors.email && !errors.password;
      case '2fa-verify':
        return formData.otp && formData.otp.length === 6 && !errors.otp;
      case '2fa-setup':
        return formData.phone && !errors.phone;
      case '2fa-setup-verify':
        return formData.setupOtp && formData.setupOtp.length === 6 && !errors.setupOtp;
      default:
        return false;
    }
  };

  const getFormTitle = () => {
    switch(authFlow) {
      case 'login':
        return 'Welcome Back';
      case '2fa-verify':
        return 'Two-Factor Authentication';
      case '2fa-setup':
        return 'Setup Two-Factor Authentication';
      case '2fa-setup-verify':
        return 'Verify 2FA Setup';
      default:
        return 'Welcome Back';
    }
  };

  const getFormSubtitle = () => {
    switch(authFlow) {
      case 'login':
        return 'Sign in to your admin account';
      case '2fa-verify':
        return 'Enter the verification code sent to your device';
      case '2fa-setup':
        return 'Add an extra layer of security to your account';
      case '2fa-setup-verify':
        return 'Enter the verification code to complete 2FA setup';
      default:
        return 'Sign in to your admin account';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo/Header section */}
        <div className="text-center mb-8 animate-fadeInDown">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg" style={{background: `linear-gradient(135deg,${C.teal},${C.tealL})`}}>
              {authFlow === '2fa-verify' || authFlow === '2fa-setup' || authFlow === '2fa-setup-verify' ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{getFormTitle()}</h1>
          <p className="text-slate-400 text-sm">{getFormSubtitle()}</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-200 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700 hover:border-slate-600 transition-colors duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Login Form */}
            {authFlow === 'login' && (
              <>
                {/* Email Field */}
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 ${
                        errors.email && touched.email
                          ? 'border-red-500 bg-red-500 bg-opacity-10'
                          : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                      }`}
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-red-400 text-xs mt-1 animate-fadeIn">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`w-full pl-10 pr-12 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 ${
                        errors.password && touched.password
                          ? 'border-red-500 bg-red-500 bg-opacity-10'
                          : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                      }`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-400 text-xs mt-1 animate-fadeIn">{errors.password}</p>
                  )}
                </div>
              </>
            )}

            {/* 2FA Verification Form */}
            {authFlow === '2fa-verify' && (
              <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-900">
                  Verification Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 text-center text-lg font-mono ${
                      errors.otp && touched.otp
                        ? 'border-red-500 bg-red-500 bg-opacity-10'
                        : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                    }`}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.otp && touched.otp && (
                  <p className="text-red-400 text-xs mt-1 animate-fadeIn">{errors.otp}</p>
                )}
                <p className="text-slate-400 text-sm mt-2">Enter the 6-digit code sent to your device</p>
              </div>
            )}

            {/* 2FA Setup Form */}
            {authFlow === '2fa-setup' && (
              <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-900">
                  Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 ${
                      errors.phone && touched.phone
                        ? 'border-red-500 bg-red-500 bg-opacity-10'
                        : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                    }`}
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-red-400 text-xs mt-1 animate-fadeIn">{errors.phone}</p>
                )}
                <p className="text-slate-400 text-sm mt-2">A verification code will be sent to this phone number</p>
              </div>
            )}

            {/* 2FA Setup Verification Form */}
            {authFlow === '2fa-setup-verify' && (
              <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="setupOtp" className="block text-sm font-medium text-slate-900">
                  Verification Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="setupOtp"
                    name="setupOtp"
                    type="text"
                    maxLength={6}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 text-center text-lg font-mono ${
                      errors.setupOtp && touched.setupOtp
                        ? 'border-red-500 bg-red-500 bg-opacity-10'
                        : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                    }`}
                    placeholder="000000"
                    value={formData.setupOtp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.setupOtp && touched.setupOtp && (
                  <p className="text-red-400 text-xs mt-1 animate-fadeIn">{errors.setupOtp}</p>
                )}
                <p className="text-slate-400 text-sm mt-2">Enter the 6-digit code sent to your phone and email</p>
              </div>
            )}

            {/* Remember & Forgot */}
            {/* {authFlow === 'login' && (
              <div className="flex items-center justify-end pt-2 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password
                </a>
              </div>
            )} */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full mt-6 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fadeInUp"
              style={{ animationDelay: '0.4s', background: `linear-gradient(135deg,${C.teal},${C.tealL})` }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>
                    {authFlow === 'login' ? 'Signing in...' : 
                     authFlow === '2fa-verify' ? 'Verifying...' :
                     authFlow === '2fa-setup' ? 'Setting up...' :
                     'Completing setup...'}
                  </span>
                </>
              ) : (
                <span>
                  {authFlow === 'login' ? 'Sign In' : 
                   authFlow === '2fa-verify' ? 'Verify Code' :
                   authFlow === '2fa-setup' ? 'Setup 2FA' :
                   'Complete Setup'}
                </span>
              )}
            </button>

            {/* Back to Login */}
            {authFlow !== 'login' && (
              <button
                type="button"
                onClick={backToLogin}
                className="w-full mt-4 py-2 px-4 text-slate-400 hover:text-slate-300 transition-colors text-sm"
              >
                ← Back to Login
              </button>
            )}

            {/* 2FA Setup Link */}
            {/* {authFlow === 'login' && (
              <div className="text-center mt-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                <button
                  type="button"
                  onClick={() => setAuthFlow('2fa-setup')}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Setup Two-Factor Authentication
                </button>
              </div>
            )} */}

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          © 2024 Admin Panel. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;