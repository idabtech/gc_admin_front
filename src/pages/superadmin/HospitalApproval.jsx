// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { CheckCircle, X, AlertCircle, Clock, User, Mail, Phone, Calendar, Shield, ArrowLeft } from 'lucide-react';
// import { authService, getCurrentUser } from '../../service/auth.service';
// import { hospitalService } from '../../service/hospital.service';

// const HospitalApproval = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const currentUser = getCurrentUser();
//   const [hospital, setHospital] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [approving, setApproving] = useState(false);

//   // Inline styles
//   const styles = {
//     container: {
//       fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
//       minHeight: '100vh',
//       // background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
//       // padding: '2rem'
//     },
//     header: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'baseline',
//       marginBottom: '2rem',
//       flexWrap: 'wrap',
//       gap:'5px'
//     },
//     headerContent: {
//       flex: 1
//     },
//     backButton: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       padding: '0.75rem 1rem',
//       borderRadius: '0.75rem',
//       fontWeight: '600',
//       fontSize: '0.9rem',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//       background: 'white',
//       color: '#6b7280',
//       border: '1px solid #e5e7eb',
//       textDecoration: 'none'
//     },
//     headerTitle: {
//       fontSize: '2rem',
//       fontWeight: '700',
//       margin: '0 0 0.5rem 0',
//       background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
//       WebkitBackgroundClip: 'text',
//       WebkitTextFillColor: 'transparent',
//       backgroundClip: 'text'
//     },
//     headerSubtitle: {
//       fontSize: '1rem',
//       color: '#6b7280',
//       margin: '0'
//     },
//     card: {
//       background: 'white',
//       borderRadius: '1.25rem',
//       padding: '2rem',
//       border: '1px solid #e5e7eb',
//       transition: 'all 0.3s ease',
//       boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
//       maxWidth: '800px',
//       margin: '0 auto'
//     },
//     cardHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '1rem',
//       marginBottom: '1.5rem',
//       paddingBottom: '1rem',
//       borderBottom: '1px solid #f0f0f0'
//     },
//     cardHeaderIcon: {
//       width: '2rem',
//       height: '2rem',
//       color: '#0ea5e9'
//     },
//     cardHeaderTitle: {
//       fontSize: '1.5rem',
//       fontWeight: '700',
//       margin: '0',
//       color: '#1f2937'
//     },
//     infoGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//       gap: '1.5rem',
//       marginBottom: '2rem'
//     },
//     infoItem: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.75rem',
//       padding: '1rem',
//       borderRadius: '0.75rem',
//       background: '#f8fafc',
//       border: '1px solid #e5e7eb'
//     },
//     infoIcon: {
//       width: '1.25rem',
//       height: '1.25rem',
//       color: '#6b7280',
//       flexShrink: '0'
//     },
//     infoContent: {
//       flex: 1
//     },
//     infoLabel: {
//       fontSize: '0.75rem',
//       fontWeight: '600',
//       color: '#6b7280',
//       textTransform: 'uppercase',
//       letterSpacing: '0.5px',
//       marginBottom: '0.25rem'
//     },
//     infoValue: {
//       fontSize: '1rem',
//       fontWeight: '500',
//       color: '#1f2937'
//     },
//     statusBadge: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       padding: '0.5rem 0.75rem',
//       borderRadius: '0.5rem',
//       fontWeight: '600',
//       fontSize: '0.875rem',
//       border: '1px solid #dc2626',
//       background: '#fef2f2',
//       color: '#dc2626'
//     },
//     statusBadgeIcon: {
//       width: '1rem',
//       height: '1rem'
//     },
//     statusApproved: {
//       border: '1px solid #16a34a',
//       background: '#ecfdf5',
//       color: '#16a34a'
//     },
//     btn: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       padding: '0.75rem 1.5rem',
//       borderRadius: '0.75rem',
//       fontWeight: '600',
//       fontSize: '0.9rem',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//       textDecoration: 'none'
//     },
//     btnPrimary: {
//       background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//       color: 'white',
//       boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
//     },
//     btnDanger: {
//       background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//       color: 'white',
//       boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
//     },
//     btnSecondary: {
//       background: 'white',
//       color: '#6b7280',
//       border: '1px solid #e5e7eb'
//     },
//     actions: {
//       display: 'flex',
//       gap: '1rem',
//       justifyContent: 'flex-end',
//       marginTop: '2rem'
//     }
//   };

//   useEffect(() => {
//     fetchHospitalDetails();
//   }, [id]);

//   const fetchHospitalDetails = async () => {
//     try {
//       setLoading(true);
//       // Mock data - replace with actual API call
//       const mockHospital = {
//         id: id,
//         name: 'Global Care Medical Center',
//         email: 'contact@globalcare.com',
//         phone: '+1-555-0123',
//         address: '123 Medical Plaza, Healthcare City, HC 12345',
//         registrationDate: '2024-01-15',
//         isApproved: false,
//         documents: {
//           license: 'medical-license.pdf',
//           insurance: 'insurance-cert.pdf',
//           accreditation: 'accreditation.pdf'
//         }
//       };
//       setHospital(mockHospital);
//     } catch (error) {
//       console.error('Error fetching hospital details:', error);
//       toast.error('Failed to load hospital details', {
//         description: 'Please try again later'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async () => {
//     if (!hospital) return;

//     setApproving(true);
//     try {
//       await hospitalService.approveHospital(hospital.id);
      
//       setHospital(prev => ({
//         ...prev,
//         isApproved: true,
//         approvedAt: new Date().toISOString(),
//         approvedBy: currentUser?.name || 'System Administrator'
//       }));

//       toast.success('Hospital approved successfully!', {
//         description: `${hospital.name} has been approved and can now access the system`
//       });
//     } catch (error) {
//       console.error('Error approving hospital:', error);
//       toast.error('Failed to approve hospital', {
//         description: error.response?.data?.error || 'Please try again'
//       });
//     } finally {
//       setApproving(false);
//     }
//   };

//   const handleReject = () => {
//     // Navigate back or show rejection modal
//     navigate('/hospitals');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div style={styles.container}>
//         <div style={{ ...styles.card, textAlign: 'center', padding: '4rem' }}>
//           <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading hospital details...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!hospital) {
//     return (
//       <div style={styles.container}>
//         <div style={{ ...styles.card, textAlign: 'center', padding: '4rem' }}>
//           <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Hospital not found</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <button
//           onClick={() => navigate('/hospitals')}
//           className='cursor-pointer'
//         >
//           <ArrowLeft size={16} />
//           {/* Back to Hospitals */}
//         </button>
//         <div style={styles.headerContent}>
//           <h1 style={styles.headerTitle}>Hospital Approval</h1>
//           <p style={styles.headerSubtitle}>Review and approve hospital registration</p>
//         </div>
//       </div>

//       {/* Hospital Details Card */}
//       <div style={styles.card}>
//         <div style={styles.cardHeader}>
//           <User style={styles.cardHeaderIcon} />
//           <h2 style={styles.cardHeaderTitle}>Hospital Information</h2>
//         </div>
        
//         <div style={styles.infoGrid}>
//           {/* Name */}
//           <div style={styles.infoItem}>
//             <User style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Hospital Name</div>
//               <div style={styles.infoValue}>{hospital.name}</div>
//             </div>
//           </div>

//           {/* Email */}
//           <div style={styles.infoItem}>
//             <Mail style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Email Address</div>
//               <div style={styles.infoValue}>{hospital.email}</div>
//             </div>
//           </div>

//           {/* Phone */}
//           <div style={styles.infoItem}>
//             <Phone style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Phone Number</div>
//               <div style={styles.infoValue}>{hospital.phone}</div>
//             </div>
//           </div>

//           {/* Address */}
//           <div style={styles.infoItem}>
//             <Shield style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Address</div>
//               <div style={styles.infoValue}>{hospital.address}</div>
//             </div>
//           </div>

//           {/* Registration Date */}
//           <div style={styles.infoItem}>
//             <Calendar style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Registration Date</div>
//               <div style={styles.infoValue}>{formatDate(hospital.registrationDate)}</div>
//             </div>
//           </div>

//           {/* Status */}
//           <div style={styles.infoItem}>
//             <AlertCircle style={styles.infoIcon} />
//             <div style={styles.infoContent}>
//               <div style={styles.infoLabel}>Approval Status</div>
//               <div style={{ 
//                 ...styles.statusBadge, 
//                 ...(hospital.isApproved ? styles.statusApproved : {})
//               }}>
//                 {hospital.isApproved ? (
//                   <>
//                     <CheckCircle style={styles.statusBadgeIcon} />
//                     Approved
//                   </>
//                 ) : (
//                   <>
//                     <Clock style={styles.statusBadgeIcon} />
//                     Pending Approval
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div style={styles.infoGrid}>
//           {Object.entries(hospital.documents).map(([key, filename]) => (
//             <div key={key} style={styles.infoItem}>
//               <Shield style={styles.infoIcon} />
//               <div style={styles.infoContent}>
//                 <div style={styles.infoLabel}>
//                   {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
//                 </div>
//                 <div style={styles.infoValue}>{filename}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Approval Actions */}
//         <div style={styles.actions}>
//           <button
//             onClick={handleReject}
//             style={{ ...styles.btn, ...styles.btnSecondary }}
//           >
//             <X size={16} />
//             Reject
//           </button>
          
//           {!hospital.isApproved && (
//             <button
//               onClick={handleApprove}
//               disabled={approving}
//               style={{ ...styles.btn, ...styles.btnPrimary }}
//             >
//               {approving ? (
//                 <>
//                   <div style={{ 
//                     width: '16px', 
//                     height: '16px', 
//                     border: '2px solid #ffffff', 
//                     borderTop: '2px solid transparent',
//                     borderRadius: '50%',
//                     animation: 'spin 1s linear infinite'
//                   }}></div>
//                   Approving...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle size={16} />
//                   Approve Hospital
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default HospitalApproval;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, X, AlertCircle, Clock, User, Mail, Phone, Calendar, Shield, ArrowLeft, FileText, Award, Zap } from 'lucide-react';
import { authService, getCurrentUser } from '../../service/auth.service';
import { hospitalService } from '../../service/hospital.service';
import { C } from '../../components/constants/data';

const HospitalApprovalModern = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      const mockHospital = {
        id: id,
        name: 'Hadassah Holland Medical Center',
        email: 'xejoja7486@gcervera.com',
        phone: '+91-96584563256',
        address: 'A.K. Road, Surat',
        city: 'Surat',
        state: 'GUJARAT',
        country: 'India',
        registrationDate: '2026-01-15',
        isApproved: false,
        totalBeds: 20,
        availableBeds: 20,
        doctorCount: 8,
        rating: 3.0,
        specialties: ['Orthopedics', 'Neurology', 'Oncology', 'Emergency Medicine', 'General Surgery', 'Urology'],
        documents: {
          license: 'medical-license.pdf',
          insurance: 'insurance-cert.pdf',
          accreditation: 'accreditation.pdf'
        },
        website: 'https://www.hodut.co.uk',
        founded_year: 2023,
        hospitalType: 'Teaching Hospital'
      };
      setHospital(mockHospital);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!hospital) return;
    setApproving(true);
    try {
      await hospitalService.approveHospital(hospital.id);
      setHospital(prev => ({
        ...prev,
        isApproved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.name || 'System Administrator'
      }));
      toast.success('Hospital approved! 🎉', {
        description: `${hospital.name} is now active in the system`
      });
      setTimeout(() => navigate('/hospitals'), 2000);
    } catch (error) {
      console.error('Error approving hospital:', error);
      toast.error('Failed to approve hospital');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!hospital) return;
    setRejecting(true);
    try {
      toast.success('Hospital rejected', {
        description: 'The application has been declined'
      });
      setTimeout(() => navigate('/hospitals'), 1500);
    } catch (error) {
      console.error('Error rejecting hospital:', error);
      toast.error('Failed to reject hospital');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
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

  if (!hospital) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: C.slate }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Hospital not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: C.bg,
      minHeight: '100vh',
      color: C.black,
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      padding: '2rem 1rem'
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

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.3);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
          }
        }

        .header-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          animation: slideInLeft 0.6s ease-out;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #0ea5e9;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0;
        }

        .back-btn:hover {
          background: rgba(14, 165, 233, 0.15);
          border-color: rgba(14, 165, 233, 0.3);
          transform: translateX(-4px);
        }

        .header-text h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, ${C.teal} 0%, ${C.teal} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          color: #94a3b8;
          margin: 0.25rem 0 0 0;
          font-size: 0.95rem;
        }

        .card {
          background: C.card;
          border: 1px solid ${C.border};
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: fadeInUp 0.6s ease-out;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid ${C.border};
        }

        .section-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, ${C.teal} 0%, ${C.tealL} 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: ${C.black};
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .info-item {
          background: ${C.navy};
          border: 1px solid ${C.border};
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .info-item:hover {
          border-color: ${C.border};
          transform: translateY(-2px);
        }

        .info-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${C.teal}, ${C.tealL});
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .info-item:hover::before {
          transform: scaleX(1);
        }

        .info-icon {
          width: 32px;
          height: 32px;
          color: ${C.teal};
          margin-bottom: 0.75rem;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: ${C.slate};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${C.black};
        }

        .specialty-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: ${C.tealTransparent};
          border: 1px solid ${C.tealBorder};
          border-radius: 8px;
          font-size: 0.85rem;
          color: ${C.teal};
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          background: ${C.goldL};
          border: 1px solid ${C.gold};
          color: ${C.gold};
        }

        .status-badge.approved {
          background: ${C.green};
          border-color: ${C.green};
          color: white;
        }

        .document-item {
          background: ${C.navy};
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }

        .document-item:hover {
          background: ${C.slateL};
          border-color: ${C.border};
        }

        .document-icon {
          width: 28px;
          height: 28px;
          color: ${C.teal};
        }

        .document-info {
          flex: 1;
        }

        .document-name {
          font-size: 0.9rem;
          color: ${C.slate};
          font-weight: 500;
        }

        .document-file {
          font-size: 1rem;
          color: ${C.black};
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid ${C.border};
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.8rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-approve {
          background: linear-gradient(135deg, ${C.green} 0%, #059669 100%);
          color: white;
          box-shadow: 0 8px 20px rgba(46, 204, 138, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-approve:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(46, 204, 138, 0.4);
        }

        .btn-approve:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-reject {
          background: linear-gradient(135deg, ${C.red} 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 8px 20px rgba(224, 82, 82, 0.3);
        }

        .btn-reject:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(224, 82, 82, 0.4);
        }

        .btn-reject:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-secondary {
          background: ${C.navy};
          color: ${C.slate};
          border: 1px solid ${C.border};
        }

        .btn-secondary:hover:not(:disabled) {
          background: ${C.slateL};
          border-color: ${C.border};
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid ${C.border};
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: ${C.navy};
          border: 1px solid ${C.border};
          border-radius: 10px;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: ${C.teal};
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: ${C.slate};
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div className="header-container">
        <button
          onClick={() => navigate('/hospitals')}
          className="back-btn"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-text">
          <h2>Hospital Review</h2>
          <p>Approve or reject the hospital application</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Hospital Info Section */}
        <div className="section-header">
          <div className="section-icon">
            <User size={20} />
          </div>
          <h2 className="section-title">Hospital Information</h2>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <User className="info-icon" />
            <div className="info-label">Hospital Name</div>
            <div className="info-value">{hospital.name}</div>
          </div>

          <div className="info-item">
            <Mail className="info-icon" />
            <div className="info-label">Email Address</div>
            <div className="info-value" style={{ fontSize: '0.95rem' }}>{hospital.email}</div>
          </div>

          <div className="info-item">
            <Phone className="info-icon" />
            <div className="info-label">Phone Number</div>
            <div className="info-value">{hospital.phone}</div>
          </div>

          <div className="info-item">
            <Award className="info-icon" />
            <div className="info-label">Hospital Type</div>
            <div className="info-value">{hospital.hospitalType}</div>
          </div>

          <div className="info-item">
            <Calendar className="info-icon" />
            <div className="info-label">Founded Year</div>
            <div className="info-value">{hospital.founded_year}</div>
          </div>

          <div className="info-item">
            <Zap className="info-icon" />
            <div className="info-label">Approval Status</div>
            <div className="status-badge" style={{ marginTop: '0.5rem' }}>
              {hospital.isApproved ? (
                <>
                  <CheckCircle size={16} />
                  Approved
                </>
              ) : (
                <>
                  <Clock size={16} />
                  Pending
                </>
              )}
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="section-header" style={{ marginTop: '2rem' }}>
          <div className="section-icon">
            <Shield size={20} />
          </div>
          <h2 className="section-title">Location & Contact</h2>
        </div>

        <div className="info-grid">
          <div className="info-item" style={{ gridColumn: 'span 1' }}>
            <div className="info-label">Address</div>
            <div className="info-value">{hospital.address}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {hospital.city}, {hospital.state} - {hospital.country}
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">Total Beds</div>
            <div className="info-value">{hospital.totalBeds}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Available Beds</div>
            <div className="info-value">{hospital.availableBeds}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Doctor Count</div>
            <div className="info-value">{hospital.doctorCount}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Rating</div>
            <div className="info-value">⭐ {hospital.rating}/5</div>
          </div>

          <div className="info-item">
            <div className="info-label">Registration Date</div>
            <div className="info-value">{formatDate(hospital.registrationDate)}</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="section-header" style={{ marginTop: '2rem' }}>
          <div className="section-icon">
            <Zap size={20} />
          </div>
          <h2 className="section-title">Specialties</h2>
        </div>

        <div className="specialty-tags">
          {hospital.specialties && hospital.specialties.map((specialty, idx) => (
            <div key={idx} className="tag">{specialty}</div>
          ))}
        </div>

        {/* Documents */}
        {/* <div className="section-header" style={{ marginTop: '2rem' }}>
          <div className="section-icon">
            <FileText size={20} />
          </div>
          <h2 className="section-title">Required Documents</h2>
        </div>

        <div>
          {Object.entries(hospital.documents).map(([key, filename]) => (
            <div key={key} className="document-item">
              <FileText className="document-icon" />
              <div className="document-info">
                <div className="document-name">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="document-file">{filename}</div>
              </div>
              <div style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: '600' }}>✓ Verified</div>
            </div>
          ))}
        </div> */}

        {/* Action Buttons */}
        {!hospital.isApproved && (
          <div className="actions">
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="btn btn-reject"
            >
              {rejecting ? (
                <>
                  <div className="spinner"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <X size={18} />
                  Reject Application
                </>
              )}
            </button>

            <button
              onClick={handleApprove}
              disabled={approving}
              className="btn btn-approve"
            >
              {approving ? (
                <>
                  <div className="spinner"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Approve Hospital
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalApprovalModern;