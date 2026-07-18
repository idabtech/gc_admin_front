import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../components/constants/data';
import { emailTemplateService } from '../../service/emailTemplate.service';
import { hospitalService } from '../../service/hospital.service';
import { doctorService } from '../../service/doctor.service';
import { patientService } from '../../service/patient.service';
import { toast } from 'sonner';
import {
  Mail, Users, FileText, Send, X, CheckCircle,
  AlertCircle, Eye, Edit3, Sparkles, Building,
  UserSquare2, Search, CheckSquare, Square, Plus, Trash2,
  ChevronDown, ChevronUp
} from 'lucide-react';

const BulkMailer = () => {
  // Target audience selection state ('hospitals', 'doctors', 'patients')
  const [targetType, setTargetType] = useState('hospitals');

  // Data lists loaded from DB
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Selections
  const [selectedHospitals, setSelectedHospitals] = useState([]); // Array of IDs
  const [selectedDoctors, setSelectedDoctors] = useState([]); // Array of IDs
  const [selectedPatients, setSelectedPatients] = useState([]); // Array of IDs
  const [customEmails, setCustomEmails] = useState([]); // Array of string email addresses
  const [customEmailInput, setCustomEmailInput] = useState('');

  // UI state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loadingData, setLoadingData] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [sendResult, setSendResult] = useState(null);
  const [isCustomEmailAccordionOpen, setIsCustomEmailAccordionOpen] = useState(false);
  const [isDbAccordionOpen, setIsDbAccordionOpen] = useState(true);

  const textareaRef = useRef(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetchTemplates();
    loadAudienceData();
  }, []);

  const loadAudienceData = async () => {
    setLoadingData(true);
    try {
      const [hospRes, docRes, patRes] = await Promise.all([
        hospitalService.getHospitals().catch(() => ({ hospitals: [] })),
        doctorService.getDoctors().catch(() => ({ doctors: [] })),
        patientService.getPatients().catch(() => ({ patients: [] }))
      ]);

      setHospitals(hospRes.hospitals || hospRes || []);
      setDoctors(docRes.doctors || docRes || []);
      setPatients(patRes.patients || patRes || []);
    } catch (err) {
      console.error('Error loading audience data:', err);
      toast.error('Failed to load audience contacts');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await emailTemplateService.getEmailTemplates({ status: 'active' });
      if (response.templates) {
        setTemplates(response.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSubject('');
      setBody('');
      return;
    }
    const selected = templates.find(t => t.id === parseInt(templateId));
    if (selected) {
      setSubject(selected.subject);
      setBody(selected.body);
      toast.success(`Loaded template: ${selected.name}`);
    }
  };

  const handleInsertVariable = (variable) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const replacement = `\${${variable}}`;
    const newBody = text.substring(0, startPos) + replacement + text.substring(endPos);

    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = startPos + replacement.length;
    }, 0);
  };

  // Select all helper for current search items in tab
  const toggleSelectAll = (filteredItems) => {
    const filteredIds = filteredItems.map(item => item.id);
    let currentSelected;
    let setter;

    if (targetType === 'hospitals') {
      currentSelected = selectedHospitals;
      setter = setSelectedHospitals;
    } else if (targetType === 'doctors') {
      currentSelected = selectedDoctors;
      setter = setSelectedDoctors;
    } else {
      currentSelected = selectedPatients;
      setter = setSelectedPatients;
    }

    const allFilteredSelected = filteredIds.every(id => currentSelected.includes(id));

    if (allFilteredSelected) {
      setter(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setter(prev => {
        const next = [...prev];
        filteredIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const toggleSelectRow = (id) => {
    if (targetType === 'hospitals') {
      setSelectedHospitals(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (targetType === 'doctors') {
      setSelectedDoctors(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (targetType === 'patients') {
      setSelectedPatients(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  // Add custom manual email
  const addCustomEmail = () => {
    const email = customEmailInput.trim();
    if (!email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (customEmails.includes(email)) {
      toast.error('Email is already in the recipient list');
      return;
    }

    setCustomEmails(prev => [...prev, email]);
    setCustomEmailInput('');
    toast.success(`Added custom email: ${email}`);
  };

  const removeCustomEmail = (email) => {
    setCustomEmails(prev => prev.filter(x => x !== email));
  };

  // Clear all current selections across all groups
  const clearAllSelections = () => {
    setSelectedHospitals([]);
    setSelectedDoctors([]);
    setSelectedPatients([]);
    setCustomEmails([]);
    toast.success('Cleared all recipient selections');
  };

  // Get recipient payload combining ALL selections
  const getRecipientsPayload = () => {
    const selectedHospList = hospitals
      .filter(h => selectedHospitals.includes(h.id) && h.email)
      .map(h => ({ id: h.id, name: h.name, email: h.email, type: 'Hospital' }));

    const selectedDocList = doctors
      .filter(d => selectedDoctors.includes(d.id) && d.email)
      .map(d => ({ id: d.id, name: d.name, email: d.email, type: 'Doctor' }));

    const selectedPatList = patients
      .filter(p => selectedPatients.includes(p.id) && p.email)
      .map(p => ({ id: p.id, name: p.name, email: p.email, type: 'Patient' }));

    const manualList = customEmails.map(email => ({
      id: null,
      name: email.split('@')[0],
      email,
      type: 'Custom'
    }));

    return [...selectedHospList, ...selectedDocList, ...selectedPatList, ...manualList];
  };

  const handleSend = async () => {
    const recipients = getRecipientsPayload();

    if (recipients.length === 0) {
      toast.error('Please select or add at least one recipient with an email address');
      return;
    }
    if (!subject.trim()) {
      toast.error('Subject line is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Email body is required');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const payload = {
        recipients: recipients.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          variables: {
            name: r.name,
            email: r.email
          }
        })),
        subject,
        body
      };

      const res = await emailTemplateService.sendBulkEmail(payload);
      setSendResult(res);
      toast.success('Bulk mail delivery completed!');

      // Clear selections on success
      setSelectedHospitals([]);
      setSelectedDoctors([]);
      setSelectedPatients([]);
      setCustomEmails([]);
    } catch (err) {
      console.error('Error sending bulk emails:', err);
      toast.error(err.response?.data?.error || 'Failed to trigger bulk send');
    } finally {
      setSending(false);
    }
  };

  // Get preview rendering
  const getPreviewHtml = () => {
    const recipients = getRecipientsPayload();
    if (recipients.length === 0) return body;
    const testRecipient = recipients[0];
    let preview = body;
    preview = preview.replace(/\$\{name\}/g, testRecipient.name || 'Recipient Name');
    preview = preview.replace(/\$\{email\}/g, testRecipient.email || 'recipient@email.com');
    return preview;
  };

  // Filtering list items for left panel selector
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    if (targetType === 'hospitals') {
      return hospitals.filter(h =>
        h.name?.toLowerCase().includes(query) ||
        h.email?.toLowerCase().includes(query) ||
        h.country?.toLowerCase().includes(query)
      );
    } else if (targetType === 'doctors') {
      return doctors.filter(d =>
        d.name?.toLowerCase().includes(query) ||
        d.email?.toLowerCase().includes(query) ||
        d.specialization?.toLowerCase().includes(query)
      );
    } else if (targetType === 'patients') {
      return patients.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.country?.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const filteredItems = getFilteredItems();
  const allSelectedRecipients = getRecipientsPayload();
  const currentRecipientsCount = allSelectedRecipients.length;
  const dbSelectedCount = selectedHospitals.length + selectedDoctors.length + selectedPatients.length;

  return (
    <div className="min-h-screen p-6 bg-[#f8f9fa]" style={{ color: C.black }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: C.black }}>Bulk Email Hub</h1>
          <p style={{ color: C.slateL }}>Send announcements and alerts to hospitals, doctors, patients, or custom emails simultaneously</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Target Selector Workspace */}
        <div className="xl:col-span-5 flex flex-col gap-6">

          {/* B. DATABASE TARGET SELECTOR ACCORDION */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
            {/* Accordion Trigger Header */}
            <div
              onClick={() => setIsDbAccordionOpen(!isDbAccordionOpen)}
              className="p-4 flex justify-between items-center bg-gray-50/40 hover:bg-gray-50 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select from Database (Hospitals/Doctors/Patients)
                </span>
                {dbSelectedCount > 0 && (
                  <span className="text-[10px] font-bold text-teal bg-teal/10 px-2.5 py-0.5 rounded-full">
                    {dbSelectedCount} Selected
                  </span>
                )}
              </div>
              <div className="text-gray-400">
                {isDbAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Accordion Content Panel */}
            {isDbAccordionOpen && (
              <div className="p-5 border-t border-gray-100 flex flex-col h-[48vh] min-h-0 bg-white">
                {/* Tabs selector */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  {[
                    { id: 'hospitals', label: 'Hospitals', icon: <Building className="w-3.5 h-3.5" /> },
                    { id: 'doctors', label: 'Doctors', icon: <UserSquare2 className="w-3.5 h-3.5" /> },
                    { id: 'patients', label: 'Patients', icon: <Users className="w-3.5 h-3.5" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setTargetType(tab.id);
                        setSearchQuery('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${targetType === tab.id
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search bar & Toggle Select All */}
                <div className="flex gap-3 items-center mb-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={`Search ${targetType}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-teal"
                    />
                  </div>
                  <button
                    onClick={() => toggleSelectAll(filteredItems)}
                    className="px-2.5 py-1.5 border border-gray-200 hover:border-teal/30 rounded-lg text-[10px] font-bold hover:bg-teal/5 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {filteredItems.length > 0 && filteredItems.every(item => {
                      const ids = targetType === 'hospitals' ? selectedHospitals : targetType === 'doctors' ? selectedDoctors : selectedPatients;
                      return ids.includes(item.id);
                    }) ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-teal" /> Clear Page
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-gray-400" /> Select Page
                      </>
                    )}
                  </button>
                </div>

                {/* Selection Checklist items */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
                  {loadingData ? (
                    <div className="h-full flex items-center justify-center py-10">
                      <div className="w-6 h-6 border-2 border-t-transparent border-teal rounded-full animate-spin" />
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 text-gray-400">
                      <p className="text-xs">No matching entries found</p>
                    </div>
                  ) : (
                    filteredItems.map(item => {
                      const isChecked = targetType === 'hospitals'
                        ? selectedHospitals.includes(item.id)
                        : targetType === 'doctors'
                          ? selectedDoctors.includes(item.id)
                          : selectedPatients.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelectRow(item.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${isChecked
                            ? 'bg-teal/5 border-teal/30 shadow-sm'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{item.email || 'No email registered'}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-teal" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* A. CUSTOM EMAIL ACCORDION */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
            {/* Accordion Trigger Header */}
            <div
              onClick={() => setIsCustomEmailAccordionOpen(!isCustomEmailAccordionOpen)}
              className="p-4 flex justify-between items-center bg-gray-50/40 hover:bg-gray-50 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Add Custom Email Address
                </span>
                {customEmails.length > 0 && (
                  <span className="text-[10px] font-bold text-teal bg-teal/10 px-2.5 py-0.5 rounded-full">
                    {customEmails.length} Added
                  </span>
                )}
              </div>
              <div className="text-gray-400">
                {isCustomEmailAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Accordion Content Panel */}
            {isCustomEmailAccordionOpen && (
              <div className="p-5 border-t border-gray-100 animate-slide-down">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Type email address (e.g. contact@domain.com)..."
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addCustomEmail();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal bg-gray-50/50"
                  />
                  <button
                    onClick={addCustomEmail}
                    className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Recipient
                  </button>
                </div>

                {/* List of custom emails inside this specific card */}
                {customEmails.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 max-h-24 overflow-y-auto">
                    {customEmails.map(email => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 shadow-sm"
                      >
                        <span className="truncate max-w-[150px]">{email}</span>
                        <button
                          onClick={() => removeCustomEmail(email)}
                          className="text-gray-400 hover:text-red transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* C. SELECTIONS SUMMARY & RECIPIENTS PREVIEW */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm flex flex-col h-[28vh]" style={{ borderColor: C.border }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal" /> Recipients Selected ({currentRecipientsCount})
              </span>
              {currentRecipientsCount > 0 && (
                <button
                  onClick={clearAllSelections}
                  className="text-[10px] font-bold text-red hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {/* Chips scroll list */}
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-0">
              {currentRecipientsCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-xs font-medium">No recipients added yet</p>
                  <p className="text-[10px] opacity-70 mt-0.5">Add custom emails or check target boxes above</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {allSelectedRecipients.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 shadow-sm"
                    >
                      <span className="font-semibold text-[8px] bg-teal/10 text-teal px-1 rounded uppercase">{r.type}</span>
                      <span className="max-w-[120px] truncate">{r.email}</span>
                      <button
                        onClick={() => {
                          if (r.type === 'Custom') removeCustomEmail(r.email);
                          else toggleSelectRow(r.id);
                        }}
                        className="text-gray-400 hover:text-red transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Editor & Preview */}
        <div className="xl:col-span-7 bg-white rounded-2xl border flex flex-col h-[75vh] overflow-hidden shadow-sm" style={{ borderColor: C.border }}>
          {sendResult ? (
            /* SENDING LOG SUMMARY */
            <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-teal/10 text-teal flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Bulk Delivery Report</h3>
              <p className="text-sm text-gray-500 text-center mb-6">{sendResult.message}</p>

              {/* Status details card */}
              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{sendResult.summary.total}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <p className="text-xs text-green-700 font-medium">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{sendResult.summary.sent}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <p className="text-xs text-red font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red">{sendResult.summary.failed}</p>
                </div>
              </div>

              {/* Recipient Details Log */}
              <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 flex-1 max-h-52 overflow-y-auto">
                <span className="text-xs font-semibold text-gray-600 block mb-3">Delivery Status Details</span>
                <div className="space-y-2">
                  {sendResult.results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700">{r.email}</span>
                      {r.status === 'sent' ? (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red bg-red/10 px-2 py-0.5 rounded-full font-semibold text-[10px]" title={r.error}>
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSendResult(null)}
                className="mt-6 px-6 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all cursor-pointer"
              >
                Compose New Email
              </button>
            </div>
          ) : (
            /* COMPOSE MESSAGE PANEL */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor Header Settings */}
              <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                    className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal"
                  >
                    <option value="">-- Choose Predefined Template (Optional) --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tabs Compose / Preview */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'edit'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>

              {/* Compose Editor Panel */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {activeTab === 'edit' ? (
                  <div className="space-y-4">
                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject line..."
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal"
                      />
                    </div>

                    {/* Editor body text */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email Body Message (HTML supported)
                        </label>
                        <textarea
                          ref={textareaRef}
                          rows={11}
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Draft your email message here. Standard HTML tags are supported for formatting (e.g., <p>, <b>, <a>, etc.)."
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal font-mono bg-gray-50/10"
                        />
                      </div>

                      {/* Variables tag side bar */}
                      <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-4 h-fit">
                        <div>
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal" /> Dynamic Tags
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Click to insert dynamic variables. These auto-replace for each recipient.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          {[
                            { tag: 'name', label: 'Recipient Name' },
                            { tag: 'email', label: 'Recipient Email' }
                          ].map(variable => (
                            <button
                              key={variable.tag}
                              type="button"
                              onClick={() => handleInsertVariable(variable.tag)}
                              className="w-full text-left px-3 py-2 bg-white hover:bg-teal/5 border border-gray-200 hover:border-teal/30 rounded-lg text-xs font-medium text-gray-700 transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span>{variable.label}</span>
                              <span className="font-mono text-[10px] text-teal bg-teal/5 px-1.5 py-0.5 rounded">
                                ${'{'}{variable.tag}{'}'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIVE PREVIEW CONTAINER */
                  <div className="h-full flex flex-col space-y-4">
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-gray-50">
                      {/* Top status bar */}
                      <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-col gap-1 text-xs text-gray-500">
                        <div>
                          <span className="font-semibold text-gray-700">Recipients Count: </span>
                          <span>{currentRecipientsCount} recipient{currentRecipientsCount !== 1 ? 's' : ''} target</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Subject: </span>
                          <span>{subject || <span className="text-gray-400 italic">No subject line set</span>}</span>
                        </div>
                      </div>

                      {/* Display Pane */}
                      <div className="flex-1 bg-white p-6 overflow-y-auto">
                        {body.trim() ? (
                          <div
                            className="prose prose-sm max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 italic py-20 text-sm">
                            No body content to preview. Go back to Edit and add message text.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/20">
                <span className="text-xs text-gray-400">
                  Ready to send to <strong className="text-gray-600">{currentRecipientsCount}</strong> target{currentRecipientsCount !== 1 ? 's' : ''}
                </span>

                <button
                  onClick={handleSend}
                  disabled={sending || currentRecipientsCount === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal to-tealL text-black text-sm font-semibold rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Dispatch Emails
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkMailer;
