import React, { useEffect, useState } from "react";
import { C } from "../../components/constants/data";
import EmailTemplateModal from "../../components/superadmin/EmailTemplateModal";
import { emailTemplateService } from "../../service/emailTemplate.service";

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  const templateTypes = [
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

  // Fetch templates from API

  const fetchTemplates = async () => {
    try {
      const response = await emailTemplateService.getEmailTemplates();
      if (response.templates) {
        setTemplates(response.templates)
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const searchAndFilterTemplates = () => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(template => template.type === typeFilter);
    }

    setTemplates(filtered);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    searchAndFilterTemplates();
  }, [searchQuery, typeFilter]);

  const openTemplateModal = (template, mode = 'view') => {
    setSelectedTemplate(template);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(false);
    setModalMode('view');
  };

  const handleActionComplete = () => {
    fetchTemplates();
  };

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.status === 'active').length,
    types: templateTypes.length,
    recentUpdates: templates.filter(t => {
      const updateDate = new Date(t.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updateDate > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: C.bg }}
      >
        <div
          className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: C.border, borderTopColor: C.teal }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.black }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: C.black }}>Email Templates</h1>
          <p style={{ color: C.slateL }}>
            Manage email templates for automated communications
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => openTemplateModal(null, 'add')}
            className="px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', color: C.white }}
          >
            <span>+</span> Add Template
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Total Templates', value: stats.total, color: '#3b82f6', icon: '📄' },
          { label: 'Active Templates', value: stats.active, color: '#10b981', icon: '✅' },
          { label: 'Template Types', value: stats.types, color: '#f59e0b', icon: '📁' },
          { label: 'Recent Updates', value: stats.recentUpdates, color: '#8b5cf6', icon: '🕒' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
              background: `${stat.color}08`,
              borderColor: `${stat.color}30`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p style={{ color: C.slate }} className="text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div 
              className="mt-4 h-1 rounded-full opacity-20"
              style={{ background: stat.color }}
            />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-8">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-3 rounded-lg border bg-transparent text-black placeholder-gray-500"
            style={{ borderColor: C.border, color: C.black }}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border text-black"
            style={{
              borderColor: C.border,
              backgroundColor: C.white,
              color: C.black
            }}
          >
            <option value="all">All Types</option>
            {templateTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TEMPLATES GRID */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => openTemplateModal(template, 'view')}
            className="p-6 rounded-xl border transition hover:scale-[1.02] cursor-pointer"
            style={{ background: C.card, borderColor: C.border }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold" style={{ color: C.black }}>{template.name}</h2>
                <p style={{ color: C.slate }} className="text-sm">{template.type}</p>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-semibold ${template.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {template.status}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-3">
              <p style={{ color: C.slate }} className="text-xs mb-1">Subject</p>
              <p style={{ color: C.black }} className="font-medium text-sm truncate">{template.subject}</p>
            </div>

            {/* Variables */}
            <div className="mb-4">
              <p style={{ color: C.slate }} className="text-xs mb-1">Variables</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.slice(0, 3).map((variable, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: C.teal + '20', color: C.teal }}
                  >
                    {variable}
                  </span>
                ))}
                {template.variables.length > 3 && (
                  <span style={{ color: C.slate }} className="text-xs">
                    +{template.variables.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="mb-4">
              <p style={{ color: C.slate }} className="text-xs mb-1">Last Updated</p>
              <p style={{ color: C.black }} className="text-sm">{template.updatedAt}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openTemplateModal(template, 'edit');
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                  style={{ background: C.blue, color: C.white }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openTemplateModal(template, 'delete');
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                  style={{ background: C.red, color: C.white }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && !loading && (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ background: C.card, borderColor: C.border }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: C.black }}>
            No templates found
          </h3>
          <p style={{ color: C.slateL }}>
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No email templates have been created yet"}
          </p>
        </div>
      )}

      {/* Email Template Modal */}
      <EmailTemplateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        template={selectedTemplate}
        onActionComplete={handleActionComplete}
        mode={modalMode}
        templateTypes={templateTypes}
        fetchTemplates={fetchTemplates}
      />
    </div>
  );
};

export default EmailTemplates;
