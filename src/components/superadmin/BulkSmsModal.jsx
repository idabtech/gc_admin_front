import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/data';
import { smsTemplateService } from '../../service/smsTemplate.service';
import { patientService } from '../../service/patient.service';
import { doctorService } from '../../service/doctor.service';
import { hospitalService } from '../../service/hospital.service';
import { toast } from 'sonner';
import { MessageSquare, Users, FileText, Send, X, CheckCircle, AlertCircle, Eye, Edit3, Sparkles } from 'lucide-react';

const BulkSmsModal = ({ isOpen, onClose }) => {
  const [recipients, setRecipients] = useState([]);
  const [targetType, setTargetType] = useState('patients'); // 'patients' | 'doctors' | 'hospitals'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [body, setBody] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRecipientDropdown, setShowAddRecipientDropdown] = useState(false);

  // Parse variables dynamically from body
  const getCustomVariables = () => {
    const vars = new Set();
    const regexList = [
      /\{\{([a-zA-Z0-9_]+)\}\}/g,
      /\$\{([a-zA-Z0-9_]+)\}/g
    ];

    regexList.forEach(regex => {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(body)) !== null) {
        vars.add(match[1]);
      }
    });

    vars.delete('name');
    vars.delete('email');
    vars.delete('phone');

    return Array.from(vars);
  };

  const customVars = getCustomVariables();

  // Data lists loaded from DB
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // Progress states
  const [sendResult, setSendResult] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRecipients([]);
      loadAllData();
      fetchTemplates();
      setSendResult(null);
      setSelectedTemplateId('');
      setBody('');
      setVariableValues({});
      setActiveTab('edit');
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setFetchingData(true);
    try {
      const [patRes, docRes, hospRes] = await Promise.all([
        patientService.getPatients().catch(() => ({ patients: [] })),
        doctorService.getDoctors().catch(() => ({ doctors: [] })),
        hospitalService.getHospitals().catch(() => ({ hospitals: [] }))
      ]);

      setPatients(patRes.patients || []);
      setDoctors(docRes.doctors || []);
      setHospitals(hospRes.hospitals || []);
    } catch (err) {
      console.error('Error loading audience data:', err);
      toast.error('Failed to load audience contacts');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await smsTemplateService.getSmsTemplates({ status: 'active' });
      if (response.templates) {
        setTemplates(response.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error('Failed to load SMS templates');
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setBody('');
      return;
    }
    const selected = templates.find(t => t.id === parseInt(templateId));
    if (selected) {
      setBody(selected.body);
      toast.success(`Loaded SMS template: ${selected.name}`);
    }
  };

  const removeRecipient = (id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const addRecipient = (item) => {
    if (recipients.some(r => r.id === item.id && r.type === targetType)) {
      toast.error('Recipient already added');
      return;
    }

    let phone = '';
    let name = '';
    if (targetType === 'patients') {
      phone = item.phone || item.recipient_phone;
      name = item.name;
    } else if (targetType === 'doctors') {
      phone = item.phone;
      name = `Dr. ${item.name}`;
    } else if (targetType === 'hospitals') {
      phone = item.phone || item.contact_phone;
      name = item.name;
    }

    if (!phone) {
      toast.error('This contact has no phone number configured');
      return;
    }

    setRecipients(prev => [...prev, {
      id: item.id,
      name,
      phone,
      type: targetType
    }]);
    setSearchQuery('');
    setShowAddRecipientDropdown(false);
  };

  const addCustomRecipient = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!/^\+?[0-9\s\-()]{5,20}$/.test(trimmed)) {
      toast.error('Invalid phone number format');
      return;
    }
    if (recipients.some(r => r.phone === trimmed)) {
      toast.error('Recipient already added');
      return;
    }
    setRecipients(prev => [...prev, {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: trimmed,
      phone: trimmed,
      type: 'custom'
    }]);
    setSearchQuery('');
    setShowAddRecipientDropdown(false);
    toast.success(`Added custom phone number: ${trimmed}`);
  };

  const addAllRecipients = () => {
    const currentList = targetType === 'patients' ? patients : targetType === 'doctors' ? doctors : hospitals;

    let countAdded = 0;
    const newRecipients = [...recipients];

    currentList.forEach(item => {
      let phone = item.phone || item.recipient_phone || item.contact_phone;
      let name = item.name;
      if (targetType === 'doctors') name = `Dr. ${item.name}`;

      if (phone && !newRecipients.some(r => r.id === item.id && r.type === targetType)) {
        newRecipients.push({
          id: item.id,
          name,
          phone,
          type: targetType
        });
        countAdded++;
      }
    });

    setRecipients(newRecipients);
    toast.success(`Added ${countAdded} recipients`);
  };

  const handleInsertVariable = (variable) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const replacement = `{{${variable}}}`;
    const newBody = text.substring(0, startPos) + replacement + text.substring(endPos);

    setBody(newBody);

    // Reset focus and cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = startPos + replacement.length;
    }, 0);
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    if (!body.trim()) {
      toast.error('SMS body is required');
      return;
    }

    setLoading(true);
    setSendResult(null);

    try {
      const payload = {
        recipients: recipients.map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          variables: {
            name: r.name,
            phone: r.phone,
            ...variableValues
          }
        })),
        body
      };

      const res = await smsTemplateService.sendBulkSms(payload);
      setSendResult(res);
      toast.success('Bulk SMS sending completed!');
    } catch (err) {
      console.error('Error sending bulk SMS:', err);
      toast.error(err.response?.data?.error || 'Failed to send bulk SMS');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    if (recipients.length === 0) return body;
    const firstRecipient = recipients[0];
    let preview = body;
    preview = preview.replace(/\{\{name\}\}/g, firstRecipient.name || 'Recipient Name');
    preview = preview.replace(/\$\{name\}/g, firstRecipient.name || 'Recipient Name');
    preview = preview.replace(/\{\{phone\}\}/g, firstRecipient.phone || 'Phone Number');
    preview = preview.replace(/\$\{phone\}/g, firstRecipient.phone || 'Phone Number');

    // Replace custom parsed variables
    Object.entries(variableValues).forEach(([key, val]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      preview = preview.replace(new RegExp(`\\$\\{${escapedKey}\\}`, 'g'), val || `[${key}]`);
      preview = preview.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), val || `[${key}]`);
    });

    return preview;
  };

  const smsLength = body.length;
  const smsParts = smsLength === 0 ? 0 : (smsLength <= 160 ? 1 : Math.ceil(smsLength / 153));

  if (!isOpen) return null;

  // Filter current search list
  const activeContacts = targetType === 'patients' ? patients : targetType === 'doctors' ? doctors : hospitals;
  const filteredList = activeContacts.filter(item =>
    !recipients.some(r => r.id === item.id && r.type === targetType) &&
    (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.phone || item.recipient_phone || item.contact_phone)?.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50">
      <div
        className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Bulk SMS</h2>
              <p className="text-xs text-gray-500">Draft and dispatch bulk SMS templates to patients, doctors, or hospitals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left panel: Recipient Management */}
          <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 p-4">
            {/* Target Select */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value);
                  setSearchQuery('');
                }}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal"
              >
                <option value="patients">Patients</option>
                <option value="doctors">Doctors</option>
                <option value="hospitals">Hospitals</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal" /> Recipients ({recipients.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={addAllRecipients}
                  className="text-[10px] font-semibold text-teal hover:underline"
                >
                  Add All
                </button>
                {recipients.length > 0 && (
                  <button
                    onClick={() => setRecipients([])}
                    className="text-[10px] font-semibold text-red hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Add recipient input search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder={`Search ${targetType}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAddRecipientDropdown(true);
                }}
                onFocus={() => setShowAddRecipientDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomRecipient(searchQuery);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-teal bg-white"
              />
              {showAddRecipientDropdown && searchQuery && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                  {filteredList.map(item => {
                    const phoneNum = item.phone || item.recipient_phone || item.contact_phone;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addRecipient(item)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-[10px] transition-colors flex flex-col border-b border-gray-50 last:border-b-0"
                      >
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <span className="text-gray-400">{phoneNum || 'No phone number configured'}</span>
                      </button>
                    );
                  })}
                  {filteredList.length === 0 && !/^\+?[0-9\s\-()]{5,20}$/.test(searchQuery.trim()) && (
                    <div className="p-3 text-[10px] text-gray-500 text-center">No matches found</div>
                  )}
                  {searchQuery.trim() && /^\+?[0-9\s\-()]{5,20}$/.test(searchQuery.trim()) && (
                    <button
                      onClick={() => addCustomRecipient(searchQuery)}
                      className="w-full text-left px-3 py-2 bg-teal/5 hover:bg-teal/10 text-teal text-[10px] font-bold transition-colors border-t border-gray-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+</span> Add "{searchQuery.trim()}" as custom number
                    </button>
                  )}
                </div>
              )}
              {showAddRecipientDropdown && searchQuery && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddRecipientDropdown(false)}
                />
              )}
            </div>

            {/* Recipient Chips Container */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {recipients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-dashed border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-1.5 text-gray-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">No recipients</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Use search or click "Add All"</span>
                </div>
              ) : (
                recipients.map(r => (
                  <div
                    key={`${r.type}-${r.id}`}
                    className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg shadow-sm group hover:border-teal/30 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{r.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{r.phone}</p>
                    </div>
                    <button
                      onClick={() => removeRecipient(r.id)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Editor / Preview / Progress */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {sendResult ? (
              /* PROGRESS / RESULTS SUMMARY VIEW */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-tealTransparent text-teal flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">SMS Messages Processed</h3>
                <p className="text-sm text-gray-500 text-center mb-6">{sendResult.message}</p>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 w-full mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{sendResult.summary?.total || 0}</p>
                  </div>
                  <div className="bg-green-55 rounded-xl p-4 text-center border border-green-200" style={{ background: '#2ecc8a0f', borderColor: '#2ecc8a2b' }}>
                    <p className="text-xs text-green font-medium">Sent</p>
                    <p className="text-2xl font-bold text-green">{sendResult.summary?.sent || 0}</p>
                  </div>
                  <div className="bg-red-55 rounded-xl p-4 text-center border border-red-200" style={{ background: '#e052520f', borderColor: '#e052522b' }}>
                    <p className="text-xs text-red font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red">{sendResult.summary?.failed || 0}</p>
                  </div>
                </div>

                {/* Recipient Details Log */}
                <div className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 flex-1 max-h-60 overflow-y-auto">
                  <span className="text-xs font-semibold text-gray-600 block mb-3">Sending Details</span>
                  <div className="space-y-2">
                    {sendResult.results?.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{r.phone}</span>
                        {r.status === 'sent' ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            ✓ Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red bg-red/10 px-2 py-0.5 rounded-full font-semibold text-[10px]" title={r.error}>
                            ⚠ Failed
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
                  Draft Another SMS
                </button>
              </div>
            ) : (
              /* SMS EDITOR VIEW */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor Top Bar: Template, Tabs */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3 flex-1 max-w-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedTemplateId}
                      onChange={handleTemplateChange}
                      className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal"
                    >
                      <option value="">-- Choose Template (Optional) --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-gray-200 rounded-lg p-0.5">
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'edit'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'preview'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  {activeTab === 'edit' ? (
                    <div className="space-y-4">
                      {/* Dynamic Custom Variables Section */}
                      {customVars.length > 0 && (
                        <div className="p-4 rounded-xl border" style={{ background: '#fef3c70f', borderColor: '#f59e0b2b' }}>
                          <h4 className="text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
                            ⚙️ Fill Template Placeholders
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {customVars.map(varName => (
                              <div key={varName}>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                  {varName}
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Value for ${varName}`}
                                  value={variableValues[varName] || ''}
                                  onChange={(e) => setVariableValues(prev => ({
                                    ...prev,
                                    [varName]: e.target.value
                                  }))}
                                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-teal bg-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Editor / Variables Box */}
                      <div className="grid grid-cols-3 gap-6">
                        {/* Body field */}
                        <div className="col-span-2 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                              SMS Message Body
                            </label>
                            <span className={`text-[10px] font-semibold ${smsLength > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {smsLength} / 160 ({smsParts} parts)
                            </span>
                          </div>
                          <textarea
                            ref={textareaRef}
                            rows={8}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Draft your SMS message here. Use double curly braces like {{name}} to insert placeholders."
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal bg-gray-50 text-gray-800"
                          />
                        </div>

                        {/* Variables Sidebar */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
                          <div>
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-teal" /> Dynamic Variables
                            </span>
                            <p className="text-[9px] text-gray-400 mt-1">
                              Insert dynamic placeholders that auto-replace with each recipient's specific details.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            {[
                              { tag: 'name', label: 'Recipient Name' },
                              { tag: 'phone', label: 'Phone Number' }
                            ].map(variable => (
                              <button
                                key={variable.tag}
                                type="button"
                                onClick={() => handleInsertVariable(variable.tag)}
                                className="w-full text-left px-3 py-2 bg-white hover:bg-teal/5 border border-gray-200 hover:border-teal/30 rounded-lg text-xs font-medium text-gray-700 transition-all flex items-center justify-between cursor-pointer"
                              >
                                <span>{variable.label}</span>
                                <span className="font-mono text-[9px] text-teal bg-teal/5 px-1.5 py-0.5 rounded">
                                  {"{{"}{variable.tag}{"}}"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PREVIEW TAB */
                    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                      {/* Smartphone container mockup */}
                      <div className="w-[280px] rounded-[32px] border-[6px] bg-slate-100 shadow-lg overflow-hidden border-slate-800 flex flex-col animate-scale-in">
                        <div className="h-5 bg-slate-800 flex justify-between items-center px-5 text-[8px] text-white">
                          <span>9:41</span>
                          <div className="flex gap-1">
                            <span>📶</span>
                            <span>🔋</span>
                          </div>
                        </div>
                        <div className="bg-slate-200 py-1.5 text-center text-[10px] font-bold border-b border-slate-300 text-slate-700">
                          💬 Messages ({recipients.length > 0 ? recipients[0].name : "Preview"})
                        </div>
                        <div className="p-3 flex-1 min-h-[140px] max-h-[180px] overflow-y-auto space-y-2 bg-white">
                          <div className="bg-[#e9e9eb] text-black text-xs p-2.5 rounded-2xl rounded-tl-none max-w-[85%] self-start leading-snug whitespace-pre-wrap">
                            {getPreviewText() || "No text content."}
                          </div>
                        </div>
                        <div className="bg-slate-100 p-2 border-t border-slate-300 flex items-center gap-1.5">
                          <div className="flex-1 bg-white rounded-full border border-slate-300 px-3 py-1 text-[10px] text-slate-400">
                            iMessage
                          </div>
                          <span className="text-slate-400 text-sm">⬆️</span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-500 text-center">
                        <p>Showing simulated SMS preview for: <strong className="text-gray-700">{recipients.length > 0 ? recipients[0].name : "No recipient"}</strong></p>
                        <p className="mt-1">Length: {smsLength} chars ({smsParts} segment{smsParts !== 1 ? 's' : ''})</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <span className="text-xs text-gray-400">
                    Preparing to send to <strong className="text-gray-600">{recipients.length}</strong> recipient{recipients.length !== 1 ? 's' : ''}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading || recipients.length === 0}
                      className="px-5 py-2 bg-gradient-to-r from-teal to-tealL text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send SMS
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSmsModal;
