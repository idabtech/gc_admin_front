import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { C } from '../components/constants/data';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: C.bg,
        color: C.black
      }}
    >
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1
            className="text-9xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '120px',
              lineHeight: '1'
            }}
          >
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-semibold mb-4" style={{ color: C.black }}>
          Page Not Found
        </h2>
        
        <p className="text-lg mb-8 opacity-80" style={{ color: C.black }}>
          The page you're looking for doesn't exist or has been moved.
          Don't worry, it happens to the best of us!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 border"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: C.black,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Go Back
          </button>

          <Link
            to="/"
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center"
            style={{
              backgroundColor: '#667eea',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a67d8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#667eea';
            }}
          >
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-sm opacity-60" style={{ color: C.black }}>
          <p>If you believe this is an error, please contact your system administrator.</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 w-20 h-20 rounded-full opacity-10"
           style={{ backgroundColor: '#667eea' }}></div>
      <div className="fixed bottom-10 right-10 w-32 h-32 rounded-full opacity-10"
           style={{ backgroundColor: '#764ba2' }}></div>
      <div className="fixed top-1/2 right-20 w-16 h-16 rounded-full opacity-5"
           style={{ backgroundColor: '#667eea' }}></div>
    </div>
  );
};

export default NotFound;
