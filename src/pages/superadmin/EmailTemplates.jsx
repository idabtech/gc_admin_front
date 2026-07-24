import React, { useEffect, useState } from "react";
import { C } from "../../components/constants/data";
import EmailTemplateModal from "../../components/superadmin/EmailTemplateModal";
import SmsTemplateModal from "../../components/superadmin/SmsTemplateModal";
import BulkEmailModal from "../../components/superadmin/BulkEmailModal";
import BulkSmsModal from "../../components/superadmin/BulkSmsModal";
import { emailTemplateService } from "../../service/emailTemplate.service";
import { smsTemplateService } from "../../service/smsTemplate.service";

const EmailTemplates = () => {
  const [activeTab, setActiveTab] = useState("email"); // "email" | "sms"
  
  // Email states
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [emailTypeFilter, setEmailTypeFilter] = useState("all");
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState('view');
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);

  // SMS states
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [smsLoading, setSmsLoading] = useState(true);
  const [smsSearchQuery, setSmsSearchQuery] = useState("");
  const [smsTypeFilter, setSmsTypeFilter] = useState("all");
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState(null);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsModalMode, setSmsModalMode] = useState('view');
  const [isBulkSmsModalOpen, setIsBulkSmsModalOpen] = useState(false);

  const emailStaticTypes = [
    'Welcome Email',
    'Appointment Confirmation',
    'Appointment Reminder',
    'Package Purchase',
    'Payment Confirmation',
    'Password Reset',
    'Account Verification',
    'Newsletter',
    'Promotional',
    'General Notification'
  ];

  const smsStaticTypes = [
    'OTP / Verification',
    'Appointment Confirmation',
    'Appointment Reminder',
    'Payment Alert',
    'Status Update',
    'Promotional Alert',
    'General Broadcast'
  ];

  // Fetch email templates
  const fetchEmailTemplates = async () => {
    try {
      setEmailLoading(true);
      const response = await emailTemplateService.getEmailTemplates();
      if (response.templates) {
        setEmailTemplates(response.templates);
      }
      setEmailLoading(false);
    } catch (err) {
      console.error("Error fetching email templates:", err);
      setEmailLoading(false);
    }
  };

  // Fetch SMS templates
  const fetchSmsTemplates = async () => {
    try {
      setSmsLoading(true);
      const response = await smsTemplateService.getSmsTemplates();
      if (response.templates) {
        setSmsTemplates(response.templates);
      }
      setSmsLoading(false);
    } catch (err) {
      console.error("Error fetching SMS templates:", err);
      setSmsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailTemplates();
    fetchSmsTemplates();
  }, []);

  // Compute available types dynamically to include custom types
  const emailAvailableTypes = Array.from(
    new Set([
      ...emailStaticTypes,
      ...emailTemplates.map(t => t.type).filter(Boolean)
    ])
  );

  const smsAvailableTypes = Array.from(
    new Set([
      ...smsStaticTypes,
      ...smsTemplates.map(t => t.type).filter(Boolean)
    ])
  );

  // Filter templates on-the-fly
  const filteredEmailTemplates = emailTemplates.filter(template => {
    const matchesSearch = !emailSearchQuery ||
      template.name.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
      (template.subject && template.subject.toLowerCase().includes(emailSearchQuery.toLowerCase())) ||
      (template.type && template.type.toLowerCase().includes(emailSearchQuery.toLowerCase()));

    const matchesType = emailTypeFilter === "all" || template.type === emailTypeFilter;

    return matchesSearch && matchesType;
  });

  const filteredSmsTemplates = smsTemplates.filter(template => {
    const matchesSearch = !smsSearchQuery ||
      template.name.toLowerCase().includes(smsSearchQuery.toLowerCase()) ||
      (template.body && template.body.toLowerCase().includes(smsSearchQuery.toLowerCase())) ||
      (template.type && template.type.toLowerCase().includes(smsSearchQuery.toLowerCase()));

    const matchesType = smsTypeFilter === "all" || template.type === smsTypeFilter;

    return matchesSearch && matchesType;
  });

  // Modal actions - Email
  const openEmailTemplateModal = (template, mode = 'view') => {
    setSelectedEmailTemplate(template);
    setEmailModalMode(mode);
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setSelectedEmailTemplate(null);
    setIsEmailModalOpen(false);
    setEmailModalMode('view');
  };

  // Modal actions - SMS
  const openSmsTemplateModal = (template, mode = 'view') => {
    setSelectedSmsTemplate(template);
    setSmsModalMode(mode);
    setIsSmsModalOpen(true);
  };

  const closeSmsModal = () => {
    setSelectedSmsTemplate(null);
    setIsSmsModalOpen(false);
    setSmsModalMode('view');
  };

  // Switcher stats computation
  const getStats = () => {
    const list = activeTab === "email" ? emailTemplates : smsTemplates;
    const typesList = activeTab === "email" ? emailAvailableTypes : smsAvailableTypes;
    return {
      total: list.length,
      active: list.filter(t => t.status === 'active').length,
      types: typesList.length,
      recentUpdates: list.filter(t => {
        const updateDate = new Date(t.updated_at || t.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return updateDate > weekAgo;
      }).length
    };
  };

  const stats = getStats();

  return (
    <div
      className="min-h-screen pb-12"
      style={{ background: C.bg, color: C.black }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: C.black }}>
            {activeTab === "email" ? "Email Templates" : "SMS Templates"}
          </h1>
          <p style={{ color: C.slateL }}>
            {activeTab === "email" 
              ? "Manage email templates for automated communications" 
              : "Manage SMS templates for automated phone alerts"}
          </p>
        </div>

        <div className="flex gap-3">
          {activeTab === "email" ? (
            <>
              <button
                onClick={() => setIsBulkEmailModalOpen(true)}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all border hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm text-sm"
                style={{ borderColor: C.border, color: C.black, background: C.white }}
              >
                <span>✉️</span> Send Bulk Email
              </button>
              <button
                onClick={() => openEmailTemplateModal(null, 'add')}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-sm text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }}
              >
                <span>+</span> Add Email Template
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsBulkSmsModalOpen(true)}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all border hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm text-sm"
                style={{ borderColor: C.border, color: C.black, background: C.white }}
              >
                <span>💬</span> Send Bulk SMS
              </button>
              <button
                onClick={() => openSmsTemplateModal(null, 'add')}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-sm text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #0bb5a0 0%, #14d4bc 100%)' }}
              >
                <span>+</span> Add SMS Template
              </button>
            </>
          )}
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex border-b mb-8" style={{ borderColor: C.border }}>
        <button
          onClick={() => setActiveTab("email")}
          className="px-6 py-3.5 font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-2"
          style={{
            borderColor: activeTab === "email" ? C.teal : "transparent",
            color: activeTab === "email" ? C.teal : C.slate,
          }}
        >
          <span>📨</span> Email Templates
        </button>
        <button
          onClick={() => setActiveTab("sms")}
          className="px-6 py-3.5 font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-2"
          style={{
            borderColor: activeTab === "sms" ? C.teal : "transparent",
            color: activeTab === "sms" ? C.teal : C.slate,
          }}
        >
          <span>💬</span> SMS Templates
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: activeTab === "email" ? 'Total Email Templates' : 'Total SMS Templates', value: stats.total, color: '#3b82f6', icon: activeTab === "email" ? '📄' : '💬' },
          { label: 'Active Templates', value: stats.active, color: '#10b981', icon: '✅' },
          { label: 'Template Types', value: stats.types, color: '#f59e0b', icon: '📁' },
          { label: 'Recent Updates (Week)', value: stats.recentUpdates, color: '#8b5cf6', icon: '🕒' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            style={{
              background: `${stat.color}08`,
              borderColor: `${stat.color}24`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p style={{ color: C.slate }} className="text-xs font-semibold uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div
              className="mt-3.5 h-1 rounded-full opacity-20"
              style={{ background: stat.color }}
            />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-6 bg-white p-4 rounded-xl border" style={{ borderColor: C.border }}>
        <div className="flex gap-4 flex-wrap">
          {activeTab === "email" ? (
            <>
              <input
                type="text"
                placeholder="Search email templates (name, subject, type)..."
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                className="flex-1 min-w-[280px] px-4 py-2.5 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                style={{ borderColor: C.border, color: C.black }}
              />
              <select
                value={emailTypeFilter}
                onChange={(e) => setEmailTypeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                style={{ borderColor: C.border, color: C.black }}
              >
                <option value="all">All Types</option>
                {emailAvailableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search SMS templates (name, body, type)..."
                value={smsSearchQuery}
                onChange={(e) => setSmsSearchQuery(e.target.value)}
                className="flex-1 min-w-[280px] px-4 py-2.5 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                style={{ borderColor: C.border, color: C.black }}
              />
              <select
                value={smsTypeFilter}
                onChange={(e) => setSmsTypeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                style={{ borderColor: C.border, color: C.black }}
              >
                <option value="all">All Types</option>
                {smsAvailableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* TEMPLATES LIST */}
      {(activeTab === "email" ? emailLoading : smsLoading) ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border bg-white" style={{ borderColor: C.border }}>
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin mb-3"
            style={{ borderColor: C.border, borderTopColor: C.teal }}
          />
          <p className="text-sm" style={{ color: C.slate }}>Loading templates...</p>
        </div>
      ) : activeTab === "email" ? (
        /* EMAIL TEMPLATES GRID */
        filteredEmailTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEmailTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => openEmailTemplateModal(template, 'view')}
                className="p-5 rounded-xl border bg-white transition hover:shadow-md hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                style={{ borderColor: C.border }}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold truncate" style={{ color: C.black }}>{template.name}</h2>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded bg-gray-100 text-[10px] font-semibold text-gray-600 uppercase">
                        {template.type}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        template.status === 'active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {template.status}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="mb-3 p-2 bg-gray-50 rounded border" style={{ borderColor: C.border }}>
                    <p style={{ color: C.slate }} className="text-[10px] uppercase font-semibold mb-0.5">Subject</p>
                    <p style={{ color: C.black }} className="font-medium text-xs truncate">{template.subject}</p>
                  </div>

                  {/* Variables */}
                  <div className="mb-4">
                    <p style={{ color: C.slate }} className="text-[10px] uppercase font-semibold mb-1">Variables</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables && template.variables.length > 0 ? (
                        <>
                          {template.variables.slice(0, 3).map((variable, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{ background: C.teal + '15', color: C.teal }}
                            >
                              {variable}
                            </span>
                          ))}
                          {template.variables.length > 3 && (
                            <span style={{ color: C.slate }} className="text-[10px] self-center">
                              +{template.variables.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs italic" style={{ color: C.slateL }}>None</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Dates */}
                  <div className="flex justify-between items-center text-xs pt-3 border-t" style={{ borderColor: C.border }}>
                    <span style={{ color: C.slate }}>Updated: {new Date(template.updated_at || template.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEmailTemplateModal(template, 'edit');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-85 cursor-pointer text-white bg-sky-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEmailTemplateModal(template, 'delete');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-85 cursor-pointer text-white"
                        style={{ background: C.red }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-xl border bg-white"
            style={{ borderColor: C.border }}
          >
            <h3 className="text-lg font-semibold mb-1" style={{ color: C.black }}>
              No email templates found
            </h3>
            <p className="text-sm" style={{ color: C.slateL }}>
              {emailSearchQuery || emailTypeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No email templates have been created yet"}
            </p>
          </div>
        )
      ) : (
        /* SMS TEMPLATES GRID */
        filteredSmsTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSmsTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => openSmsTemplateModal(template, 'view')}
                className="p-5 rounded-xl border bg-white transition hover:shadow-md hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                style={{ borderColor: C.border }}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold truncate" style={{ color: C.black }}>{template.name}</h2>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded bg-gray-100 text-[10px] font-semibold text-gray-600 uppercase">
                        {template.type}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        template.status === 'active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {template.status}
                    </span>
                  </div>

                  {/* Body Preview */}
                  <div className="mb-3 p-3 bg-gray-50 rounded border h-18 overflow-hidden" style={{ borderColor: C.border }}>
                    <p style={{ color: C.slate }} className="text-[10px] uppercase font-semibold mb-0.5">Body Preview</p>
                    <p style={{ color: C.black }} className="text-xs line-clamp-2 leading-relaxed italic whitespace-pre-wrap">
                      {template.body}
                    </p>
                  </div>

                  {/* Variables */}
                  <div className="mb-4">
                    <p style={{ color: C.slate }} className="text-[10px] uppercase font-semibold mb-1">Variables</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables && template.variables.length > 0 ? (
                        <>
                          {template.variables.slice(0, 3).map((variable, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{ background: C.teal + '15', color: C.teal }}
                            >
                              {variable}
                            </span>
                          ))}
                          {template.variables.length > 3 && (
                            <span style={{ color: C.slate }} className="text-[10px] self-center">
                              +{template.variables.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs italic" style={{ color: C.slateL }}>None</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Dates */}
                  <div className="flex justify-between items-center text-xs pt-3 border-t" style={{ borderColor: C.border }}>
                    <span style={{ color: C.slate }}>Updated: {new Date(template.updated_at || template.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSmsTemplateModal(template, 'edit');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-85 cursor-pointer bg-teal-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSmsTemplateModal(template, 'delete');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-85 cursor-pointer"
                        style={{ background: C.red }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-xl border bg-white"
            style={{ borderColor: C.border }}
          >
            <h3 className="text-lg font-semibold mb-1" style={{ color: C.black }}>
              No SMS templates found
            </h3>
            <p className="text-sm" style={{ color: C.slateL }}>
              {smsSearchQuery || smsTypeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No SMS templates have been created yet"}
            </p>
          </div>
        )
      )}

      {/* Email Template Modal */}
      <EmailTemplateModal
        isOpen={isEmailModalOpen}
        onClose={closeEmailModal}
        template={selectedEmailTemplate}
        onActionComplete={fetchEmailTemplates}
        mode={emailModalMode}
        templateTypes={emailAvailableTypes}
        fetchTemplates={fetchEmailTemplates}
      />

      {/* SMS Template Modal */}
      <SmsTemplateModal
        isOpen={isSmsModalOpen}
        onClose={closeSmsModal}
        template={selectedSmsTemplate}
        onActionComplete={fetchSmsTemplates}
        mode={smsModalMode}
        templateTypes={smsAvailableTypes}
        fetchTemplates={fetchSmsTemplates}
      />

      {/* Bulk Email Modal */}
      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => {
          setIsBulkEmailModalOpen(false);
          fetchEmailTemplates();
        }}
      />

      {/* Bulk SMS Modal */}
      <BulkSmsModal
        isOpen={isBulkSmsModalOpen}
        onClose={() => {
          setIsBulkSmsModalOpen(false);
          fetchSmsTemplates();
        }}
      />
    </div>
  );
};

export default EmailTemplates;
