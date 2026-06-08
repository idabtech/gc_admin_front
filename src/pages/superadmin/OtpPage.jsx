import React, { useState } from 'react';
// import { AppContext } from '../../context/AppContext';

import { authService } from '../../service/auth.service';
import { useNavigate } from 'react-router-dom';
import { C } from '../../components/constants/data';
import { X } from 'lucide-react';
import { Toaster } from 'sonner';
import { patientService } from '../../service/patient.service';

const OtpPage = ({setIsOtpModalOpen, selectedPatient}) => {
    // const { nav, showNotif } = useContext(AppContext);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const email = localStorage.getItem('pendingEmail');
    const navigate = useNavigate();

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === "" && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            // showNotif('Please enter all 6 digits', 'error');
            Toaster.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        try {
            const res = await patientService.verifyOtp(selectedPatient.id, { email: selectedPatient.email, otp: otpString });
            // Toaster.error(res.error)
            // showNotif('Email verified successfully!', 'success');

            navigate(`/patients/edit/${selectedPatient.id}`);
        } catch (error) {
            console.log("OTP Error:", error);
            // Toaster.error(error.response?.data.error || "OTP verification failed");
            // showNotif(error.response?.data.error || 'OTP verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        try {
            await authService.sendResetOtp({ email });
            showNotif('OTP resent successfully', 'success');
        } catch (error) {
            showNotif(error.message || 'Failed to resend OTP', 'error');
        }
    };

    const inputStyle = {
        width: "45px", height: "55px", background: "rgba(255,255,255,0.05)",
        border: `1px solid ${C.border}`, borderRadius: 12, color: C.textColor,
        fontSize: "24px", fontWeight: "700", textAlign: "center", outline: "none",
        transition: "all 0.2s"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50">
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: `radial-gradient(ellipse at 50% 50%, rgba(13,155,138,0.1) 0%, transparent 60%), ${C.bg}`,
                padding: "100px 20px"
            }}>
                <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 24, padding: 40, width: "100%", maxWidth: 450,
                    backdropFilter: "blur(20px)", boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
                    textAlign: "center"
                }}>
                    <div className='absolute top-4 right-4 cursor-pointer' onClick={() => setIsOtpModalOpen(false)}>
                        <X size={24} color={C.slateL} />
                    </div>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${C.teal},${C.tealL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>
                            🔐
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                            Verify Email
                        </h2>
                        <p style={{ color: C.slateL, fontSize: 14 }}>
                            We've sent a 6-digit identification code to <br />
                            <span style={{ color: C.tealL, fontWeight: 600 }}>{email || "your email"}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    style={{
                                        ...inputStyle,
                                        borderColor: data ? C.teal : C.border,
                                        boxShadow: data ? `0 0 15px rgba(13,155,138,0.2)` : "none"
                                    }}
                                />
                            ))}
                        </div>

                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-5 rounded-lg font-semibold transition cursor-pointer"
                            style={{ background: C.teal, color: C.white }}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                   
                    </form>

                    <div style={{ fontSize: 13 }}>
                        <span style={{ color: C.slateL }}>Didn't receive the code? </span>
                        <button
                            type="button"
                            onClick={resendOtp}
                            style={{ background: "none", border: "none", color: C.tealL, fontWeight: 700, cursor: "pointer", padding: 0 }}
                        >
                            Resend Code
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/patient')}
                        style={{ background: "none", border: "none", color: C.slateL, fontSize: 13, marginTop: 24, cursor: "pointer" }}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpPage;
