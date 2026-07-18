import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/data';
import { emailTemplateService } from '../../service/emailTemplate.service';
import { toast } from 'sonner';
import { Mail, Users, FileText, Send, X, CheckCircle, AlertCircle, Eye, Edit3, Sparkles } from 'lucide-react';

const BulkEmailModal = ({ isOpen, onClose, initialRecipients = [], allPatients = [] }) => {
  const [recipients, setRecipients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [searchPatientQuery, setSearchPatientQuery] = useState('');
  const [showAddRecipientDropdown, setShowAddRecipientDropdown] = useState(false);
  
  // Progress states
  const [sendResult, setSendResult] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRecipients([...initialRecipients]);
      fetchTemplates();
      setSendResult(null);
      setSelectedTemplateId('');
      setSubject('');
      setBody('');
      setActiveTab('edit');
    }
  }, [isOpen, initialRecipients]);

  const fetchTemplates = async () => {
    setFetchingTemplates(true);
    try {
      const response = await emailTemplateService.getEmailTemplates({ status: 'active' });
      if (response.templates) {
        setTemplates(response.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error('Failed to load email templates');
    } finally {
      setFetchingTemplates(false);
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

  const removeRecipient = (id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const addRecipient = (patient) => {
    if (recipients.some(r => r.id === patient.id)) {
      toast.error('Patient is already a recipient');
      return;
    }
    setRecipients(prev => [...prev, {
      id: patient.id,
      name: patient.name,
      email: patient.email
    }]);
    setSearchPatientQuery('');
    setShowAddRecipientDropdown(false);
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
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Email body is required');
      return;
    }

    setLoading(true);
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
      toast.success('Bulk email sending completed!');
    } catch (err) {
      console.error('Error sending bulk emails:', err);
      toast.error(err.response?.data?.error || 'Failed to send bulk emails');
    } finally {
      setLoading(false);
    }
  };

  // Get recipient preview for variable rendering
  const getPreviewHtml = () => {
    if (recipients.length === 0) return body;
    const firstRecipient = recipients[0];
    let preview = body;
    preview = preview.replace(/\$\{name\}/g, firstRecipient.name || 'Patient Name');
    preview = preview.replace(/\$\{email\}/g, firstRecipient.email || 'patient@email.com');
    return preview;
  };

  if (!isOpen) return null;

  // Filter patients that are not already selected
  const availablePatientsToAdd = allPatients.filter(patient => 
    !recipients.some(r => r.id === patient.id) &&
    (patient.name?.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
     patient.email?.toLowerCase().includes(searchPatientQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-scale-in"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal/5 to-blue/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Bulk Email</h2>
              <p className="text-xs text-gray-500">Draft and send templated or custom emails to multiple patients</p>
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal" /> Recipients ({recipients.length})
              </span>
              {recipients.length > 0 && (
                <button 
                  onClick={() => setRecipients([])}
                  className="text-xs font-semibold text-red hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Add recipient input search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search patient to add..."
                value={searchPatientQuery}
                onChange={(e) => {
                  setSearchPatientQuery(e.target.value);
                  setShowAddRecipientDropdown(true);
                }}
                onFocus={() => setShowAddRecipientDropdown(true)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-teal"
              />
              {showAddRecipientDropdown && searchPatientQuery && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                  {availablePatientsToAdd.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500 text-center">No matching patients found</div>
                  ) : (
                    availablePatientsToAdd.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addRecipient(p)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs transition-colors flex flex-col border-b border-gray-50 last:border-b-0"
                      >
                        <span className="font-semibold text-gray-800">{p.name}</span>
                        <span className="text-gray-500">{p.email}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {showAddRecipientDropdown && searchPatientQuery && (
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowAddRecipientDropdown(false)}
                />
              )}
            </div>

            {/* Recipient Chips Container */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {recipients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 text-gray-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">No recipients selected</span>
                  <span className="text-[10px] text-gray-400 mt-1">Select patients from list or search above</span>
                </div>
              ) : (
                recipients.map(r => (
                  <div 
                    key={r.id} 
                    className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm group hover:border-teal/30 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">{r.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.email}</p>
                    </div>
                    <button 
                      onClick={() => removeRecipient(r.id)}
                      className="p-1 hover:bg-red/10 rounded-md text-gray-400 hover:text-red transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
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
                <div className="w-16 h-16 rounded-full bg-teal/10 text-teal flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Emails Processed</h3>
                <p className="text-sm text-gray-500 text-center mb-6">{sendResult.message}</p>

                {/* Stat cards */}
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
                <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 flex-1 max-h-60 overflow-y-auto">
                  <span className="text-xs font-semibold text-gray-600 block mb-3">Sending Details</span>
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
                  className="mt-6 px-6 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Draft Another Email
                </button>
              </div>
            ) : (
              /* EMAIL EDITOR VIEW */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor Top Bar: Template, Tabs */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-3 flex-1 max-w-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedTemplateId}
                      onChange={handleTemplateChange}
                      disabled={fetchingTemplates}
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal"
                    >
                      <option value="">-- Choose Template (Optional) --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'edit' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'preview' 
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

                      {/* Editor / Variables Box */}
                      <div className="grid grid-cols-3 gap-6">
                        {/* Body field */}
                        <div className="col-span-2 space-y-1.5">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Email Message (HTML supported)
                          </label>
                          <textarea
                            ref={textareaRef}
                            rows={12}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Draft your email message here. Standard HTML tags are supported for formatting (e.g., <p>, <b>, <a>, etc.)."
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal font-mono bg-gray-50/10"
                          />
                        </div>

                        {/* Variables Sidebar */}
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-4">
                          <div>
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-teal" /> Dynamic Variables
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Insert dynamic placeholders that auto-replace with each recipient's specific details.
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
                                className="w-full text-left px-3 py-2 bg-white hover:bg-teal/5 border border-gray-200 hover:border-teal/30 rounded-lg text-xs font-medium text-gray-700 transition-all flex items-center justify-between"
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
                    /* PREVIEW TAB */
                    <div className="h-full flex flex-col space-y-4">
                      <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-gray-50">
                        {/* Simulated client top bar */}
                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-col gap-1 text-xs text-gray-500">
                          <div>
                            <span className="font-semibold text-gray-700">To: </span>
                            {recipients.length > 0 ? (
                              <span>{recipients[0].name} &lt;{recipients[0].email}&gt; {recipients.length > 1 && `(+ ${recipients.length - 1} others)`}</span>
                            ) : (
                              <span className="text-red italic">No recipients selected yet</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Subject: </span>
                            <span>{subject || <span className="text-gray-400 italic">No subject line set</span>}</span>
                          </div>
                        </div>

                        {/* Rendering pane */}
                        <div className="flex-1 bg-white p-6 overflow-y-auto">
                          {body.trim() ? (
                            <div 
                              className="prose prose-sm max-w-none text-gray-800"
                              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                            />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 italic py-20 text-sm">
                              No body content to preview. Go back to Edit and add text.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/20">
                  <span className="text-xs text-gray-400">
                    Preparing to send to <strong className="text-gray-600">{recipients.length}</strong> patient{recipients.length !== 1 ? 's' : ''}
                  </span>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading || recipients.length === 0}
                      className="px-5 py-2 bg-gradient-to-r from-teal to-tealL text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Emails
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

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BulkEmailModal;
