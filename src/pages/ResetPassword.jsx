import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Loader, Shield } from 'lucide-react';
import { C } from '../components/constants/data';
import { authService } from '../service/auth.service';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract from query params
  const emailParam = searchParams.get('email') || '';
  const otpParam = searchParams.get('otp') || '';

  // Form states
  const [formData, setFormData] = useState({
    email: emailParam,
    otp: otpParam,
    password: '',
    confirmPassword: ''
  });

  // Sync with searchParams if they load late
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: searchParams.get('email') || '',
      otp: searchParams.get('otp') || ''
    }));
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    if (!value.trim()) {
      switch(name) {
        case 'password':
          error = 'New password is required';
          break;
        case 'confirmPassword':
          error = 'Please confirm your new password';
          break;
        case 'otp':
          error = 'Reset OTP/token is required';
          break;
        case 'email':
          error = 'Email is required';
          break;
      }
    } else if (name === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (name === 'confirmPassword' && value !== formData.password) {
      error = 'Passwords do not match';
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const isFormValid = () => {
    return (
      formData.email &&
      formData.otp &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validateField('password', formData.password);
    const confirmError = validateField('confirmPassword', formData.confirmPassword);

    if (passwordError || confirmError) {
      setErrors({ password: passwordError, confirmPassword: confirmError });
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      });

      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password.'
      });

      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast.error('Password reset failed', {
        description: error.response?.data?.error || 'Invalid or expired reset code.'
      });
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header section */}
        <div className="text-center mb-8 animate-fadeInDown">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg" style={{background: `linear-gradient(135deg,${C.teal},${C.tealL})`}}>
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-400 text-sm">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-200 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700 hover:border-slate-600 transition-colors duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email (Read Only / Prefilled) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Email Address</label>
              <input
                type="email"
                readOnly
                className="w-full px-4 py-2.5 rounded-lg bg-slate-300 bg-opacity-40 border border-slate-500 text-slate-600 cursor-not-allowed focus:outline-none"
                value={formData.email}
              />
            </div>

            {/* Token/OTP (Read Only / Prefilled) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Reset Token / Code</label>
              <input
                type="text"
                readOnly
                className="w-full px-4 py-2.5 rounded-lg bg-slate-300 bg-opacity-40 border border-slate-500 text-slate-600 cursor-not-allowed focus:outline-none text-center font-mono tracking-wider"
                value={formData.otp}
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg bg-slate-100 bg-opacity-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 bg-red-500 bg-opacity-10'
                      : 'border-slate-600 hover:border-slate-500 focus:bg-slate-100'
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full mt-6 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${C.teal},${C.tealL})` }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>

            {/* Back to Login */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full mt-4 py-2 px-4 text-slate-400 hover:text-slate-300 transition-colors text-sm text-center block cursor-pointer"
            >
              ← Back to Login
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          © 2026 Admin Panel. All rights reserved.
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
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
