import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/data';
import { packageService } from '../../service/package.service';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

const PackageModal = ({ isOpen, onClose, package: pkg, onActionComplete, mode = 'view' }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    plan: '',
    title: '',
    description: '',
    maxPatients: 0,
    maxPatientsPerDoctor: 0,
    maxDoctors: 0,
    maxAppointments: 0,
    videoConsultationLimit: 0,
    audioConsultationLimit: 0,
    onlineConsultationLimit: 0,
    appointmentRescheduleLimit: 0,
    appointmentCancellationLimit: 0,
    appointmentReminderAutomation: 0,
    consultationLimit: 0,
    featuredConsultationLimit: 0,
    prescriptionGenerationLimit: 0,
    medicalReportDownloads: 0,
    labTestOrderLimit: 0,
    healthRecordLimit: 0,
    paymentGatewayIntegration: 0,
    invoiceGeneration: 0,
    recurringPaymentSupport: 0,
    refundProcessing: 0,
    price: 0,
    currency: 'USD',
    durationInDays: '',
    billingCycle: '',
    discountPercentage: 0,
    setupFee: 0,
    isactive: true,
    features: '',
    perks: '',
    dynamicFields: '',
    restrictions: ''
  });

  const defaultPlans = [
    'Basic',
    'Standard',
    'Premium',
    'Enterprise',
    'Custom'
  ];

  const [localPlans, setLocalPlans] = useState(defaultPlans);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const planDropdownRef = useRef(null);

  const billingCycles = [
    'Monthly',
    'Quarterly',
    'Semi-Annual',
    'Annual',
    'One-Time'
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'
  ];

  const handlePlanKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (planDropdownOpen) {
        e.preventDefault();
        const trimmedVal = formData.plan.trim();
        if (trimmedVal) {
          setFormData(prev => ({ ...prev, plan: trimmedVal }));
          setLocalPlans(prev => {
            if (!prev.some(p => p.toLowerCase() === trimmedVal.toLowerCase())) {
              return [...prev, trimmedVal];
            }
            return prev;
          });
        }
        setPlanDropdownOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target)) {
        setPlanDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pkg && mode !== 'create') {
      if (pkg.plan) {
        const trimmedPlan = String(pkg.plan).trim();
        setLocalPlans(prev => {
          if (!prev.some(p => p.toLowerCase() === trimmedPlan.toLowerCase())) {
            return [...prev, trimmedPlan];
          }
          return prev;
        });
      }
      setFormData({
        label: pkg.label || '',
        plan: pkg.plan || '',
        title: pkg.title || '',
        description: pkg.description || '',
        maxPatients: pkg.maxPatients || 0,
        maxPatientsPerDoctor: pkg.maxPatientsPerDoctor || 0,
        maxDoctors: pkg.maxDoctors || 0,
        maxAppointments: pkg.maxAppointments || 0,
        videoConsultationLimit: pkg.videoConsultationLimit || 0,
        audioConsultationLimit: pkg.audioConsultationLimit || 0,
        onlineConsultationLimit: pkg.onlineConsultationLimit || 0,
        appointmentRescheduleLimit: pkg.appointmentRescheduleLimit || 0,
        appointmentCancellationLimit: pkg.appointmentCancellationLimit || 0,
        appointmentReminderAutomation: pkg.appointmentReminderAutomation || 0,
        consultationLimit: pkg.consultationLimit || 0,
        featuredConsultationLimit: pkg.featuredConsultationLimit || 0,
        prescriptionGenerationLimit: pkg.prescriptionGenerationLimit || 0,
        medicalReportDownloads: pkg.medicalReportDownloads || 0,
        labTestOrderLimit: pkg.labTestOrderLimit || 0,
        healthRecordLimit: pkg.healthRecordLimit || 0,
        paymentGatewayIntegration: pkg.paymentGatewayIntegration || 0,
        invoiceGeneration: pkg.invoiceGeneration || 0,
        recurringPaymentSupport: pkg.recurringPaymentSupport || 0,
        refundProcessing: pkg.refundProcessing || 0,
        price: pkg.price || 0,
        currency: pkg.currency || 'USD',
        durationInDays: pkg.durationInDays || '',
        billingCycle: pkg.billingCycle || '',
        discountPercentage: pkg.discountPercentage || 0,
        setupFee: pkg.setupFee || 0,
        isactive: pkg.isactive !== undefined ? pkg.isactive : true,
        features: pkg.features ? (typeof pkg.features === 'string' ? pkg.features : JSON.stringify(pkg.features, null, 2)) : '',
        perks: pkg.perks ? (typeof pkg.perks === 'string' ? pkg.perks : JSON.stringify(pkg.perks, null, 2)) : '',
        dynamicFields: pkg.dynamicFields ? (typeof pkg.dynamicFields === 'string' ? pkg.dynamicFields : JSON.stringify(pkg.dynamicFields, null, 2)) : '',
        restrictions: pkg.restrictions ? (typeof pkg.restrictions === 'string' ? pkg.restrictions : JSON.stringify(pkg.restrictions, null, 2)) : ''
      });
    } else {
      setLocalPlans(defaultPlans);
      setFormData({
        label: '',
        plan: '',
        title: '',
        description: '',
        maxPatients: 0,
        maxPatientsPerDoctor: 0,
        maxDoctors: 0,
        maxAppointments: 0,
        videoConsultationLimit: 0,
        audioConsultationLimit: 0,
        onlineConsultationLimit: 0,
        appointmentRescheduleLimit: 0,
        appointmentCancellationLimit: 0,
        appointmentReminderAutomation: 0,
        consultationLimit: 0,
        featuredConsultationLimit: 0,
        prescriptionGenerationLimit: 0,
        medicalReportDownloads: 0,
        labTestOrderLimit: 0,
        healthRecordLimit: 0,
        paymentGatewayIntegration: 0,
        invoiceGeneration: 0,
        recurringPaymentSupport: 0,
        refundProcessing: 0,
        price: 0,
        currency: 'USD',
        durationInDays: '',
        billingCycle: '',
        discountPercentage: 0,
        setupFee: 0,
        isactive: true,
        features: '',
        perks: '',
        dynamicFields: '',
        restrictions: ''
      });
    }
  }, [pkg, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packageData = { ...formData };
      
      // Parse JSON fields
      ['features', 'perks', 'dynamicFields', 'restrictions'].forEach(field => {
        if (formData[field]) {
          try {
            packageData[field] = JSON.parse(formData[field]);
          } catch (e) {
            toast.error(`Invalid JSON in ${field} field`);
            setLoading(false);
            return;
          }
        } else {
          packageData[field] = null;
        }
      });

      // Convert numeric fields
      packageData.price = parseFloat(packageData.price) || 0;
      packageData.discountPercentage = parseFloat(packageData.discountPercentage) || 0;
      packageData.setupFee = parseFloat(packageData.setupFee) || 0;
      packageData.durationInDays = packageData.durationInDays ? parseInt(packageData.durationInDays) : null;

      if (mode === 'create') {
        await packageService.createPackage(packageData);
        toast.success('Package created successfully');
      } else if (mode === 'edit') {
        await packageService.updatePackage(pkg.id, packageData);
        toast.success('Package updated successfully');
      }

      onActionComplete();
      onClose();
    } catch (error) {
      toast.error('Failed to save package');
      console.error('Error saving package:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await packageService.deletePackage(pkg.id);
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error deleting package:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'view':
        return (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                style={{ background: C.teal, color: C.white }}
              >
                {pkg?.label?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <h3 className="text-xl font-bold text-black">{pkg?.label}</h3>
              <p style={{ color: C.slate }} className="text-sm">{pkg?.plan} - {pkg?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Label</p>
                <p className="text-black">{pkg?.label || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Plan</p>
                <p className="text-black">{pkg?.plan || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Price</p>
                <p className="text-black font-semibold" style={{ color: C.teal }}>
                  {pkg?.currency} {pkg?.price || '0'}
                </p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Duration</p>
                <p className="text-black">{pkg?.durationInDays ? `${pkg.durationInDays} days` : 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Billing Cycle</p>
                <p className="text-black">{pkg?.billingCycle || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Status</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  pkg?.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pkg?.isactive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {pkg?.description && (
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Description</p>
                <p className="text-black">{pkg.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Max Patients</p>
                <p className="text-black">{pkg?.maxPatients || 'Unlimited'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Max Doctors</p>
                <p className="text-black">{pkg?.maxDoctors || 'Unlimited'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Max Appointments</p>
                <p className="text-black">{pkg?.maxAppointments || 'Unlimited'}</p>
              </div>
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Consultation Limit</p>
                <p className="text-black">{pkg?.consultationLimit || 'Unlimited'}</p>
              </div>
            </div>

            {pkg?.features && (
              <div>
                <p style={{ color: C.slate }} className="text-sm mb-1">Features</p>
                <div className="text-black bg-gray-50 p-2 rounded text-sm">
                  <pre>{typeof pkg.features === 'string' ? pkg.features : JSON.stringify(pkg.features, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        );

      case 'create':
      case 'edit':
        return (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter package label"
                  required
                />
              </div>

              <div className="relative" ref={planDropdownRef}>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Plan
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.plan}
                    onChange={(e) => {
                      setFormData({ ...formData, plan: e.target.value });
                      setPlanDropdownOpen(true);
                    }}
                    onFocus={() => setPlanDropdownOpen(true)}
                    onKeyDown={handlePlanKeyDown}
                    placeholder="Select or type plan"
                    className="w-full px-4 py-3 pr-10 rounded-lg border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                  />
                  <button
                    type="button"
                    onClick={() => setPlanDropdownOpen(!planDropdownOpen)}
                    className="absolute right-3 focus:outline-none cursor-pointer"
                    style={{ color: C.slateL }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                {planDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 z-50 rounded-lg border mt-1 overflow-y-auto"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.white,
                      maxHeight: '200px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {formData.plan.trim() && !localPlans.some(p => p.toLowerCase() === formData.plan.trim().toLowerCase()) && (
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b cursor-pointer hover:bg-gray-50"
                        style={{
                          color: C.teal,
                          borderColor: C.border,
                          backgroundColor: C.tealTransparent,
                        }}
                        onClick={() => {
                          const trimmedVal = formData.plan.trim();
                          setFormData({ ...formData, plan: trimmedVal });
                          setLocalPlans(prev => {
                            if (!prev.some(p => p.toLowerCase() === trimmedVal.toLowerCase())) {
                              return [...prev, trimmedVal];
                            }
                            return prev;
                          });
                          setPlanDropdownOpen(false);
                        }}
                      >
                        + Add "{formData.plan.trim()}"
                      </button>
                    )}
                    {localPlans.filter(plan => plan.toLowerCase().includes((formData.plan || '').toLowerCase())).length > 0 ? (
                      localPlans
                        .filter(plan => plan.toLowerCase().includes((formData.plan || '').toLowerCase()))
                        .map((plan, i, arr) => {
                          const isSelected = formData.plan === plan;
                          return (
                            <button
                              key={plan}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, plan });
                                setPlanDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-all cursor-pointer hover:bg-gray-100"
                              style={{
                                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                                backgroundColor: isSelected ? C.tealTransparent : 'transparent',
                                color: C.black,
                              }}
                            >
                              <span>{plan}</span>
                              {isSelected && (
                                <span style={{ color: C.teal }} className="font-semibold text-xs">Selected</span>
                              )}
                            </button>
                          );
                        })
                    ) : (
                      !formData.plan.trim() && (
                        <div className="px-4 py-2.5 text-sm text-gray-500">No options available</div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter package title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.durationInDays}
                  onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                >
                  <option value="">Select Billing Cycle</option>
                  {billingCycles.map(cycle => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Setup Fee
                </label>
                <input
                  type="number"
                  value={formData.setupFee}
                  onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.slateL }}>
                  Status
                </label>
                <select
                  value={formData.isactive}
                  onChange={(e) => setFormData({ ...formData, isactive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 rounded-lg border bg-transparent text-black"
                  style={{ borderColor: C.border }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
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
                placeholder="Enter package description"
                rows="3"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Limits & Features</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Max Patients
                  </label>
                  <input
                    type="number"
                    value={formData.maxPatients}
                    onChange={(e) => setFormData({ ...formData, maxPatients: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Max Doctors
                  </label>
                  <input
                    type="number"
                    value={formData.maxDoctors}
                    onChange={(e) => setFormData({ ...formData, maxDoctors: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Max Appointments
                  </label>
                  <input
                    type="number"
                    value={formData.maxAppointments}
                    onChange={(e) => setFormData({ ...formData, maxAppointments: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Consultation Limit
                  </label>
                  <input
                    type="number"
                    value={formData.consultationLimit}
                    onChange={(e) => setFormData({ ...formData, consultationLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black"
                    style={{ borderColor: C.border }}
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">JSON Fields (optional)</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Features (JSON)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black font-mono text-sm"
                    style={{ borderColor: C.border }}
                    placeholder='{"key": "value"}'
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.slateL }}>
                    Perks (JSON)
                  </label>
                  <textarea
                    value={formData.perks}
                    onChange={(e) => setFormData({ ...formData, perks: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-transparent text-black font-mono text-sm"
                    style={{ borderColor: C.border }}
                    placeholder='{"key": "value"}'
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold transition cursor-pointer"
                style={{ background: C.teal, color: C.white }}
              >
                {loading ? 'Saving...' : (mode === 'create' ? 'Create Package' : 'Save Changes')}
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

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: C.navy, borderColor: C.border }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {mode === 'view' && 'Package Details'}
            {mode === 'create' && 'Create New Package'}
            {mode === 'edit' && 'Edit Package'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default PackageModal;
