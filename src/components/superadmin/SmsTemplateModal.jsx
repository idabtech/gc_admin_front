import React, { useState, useEffect } from 'react';
import { C } from '../constants/data';
import { smsTemplateService } from '../../service/smsTemplate.service';
import { toast } from 'sonner';

const SmsTemplateModal = ({ isOpen, onClose, template, onActionComplete, mode, templateTypes, fetchTemplates }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    body: '',
    variables: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [availableTypes, setAvailableTypes] = useState(templateTypes || []);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeInput, setTypeInput] = useState('');

  useEffect(() => {
    if (templateTypes) {
      setAvailableTypes(templateTypes);
    }
  }, [templateTypes]);

  useEffect(() => {
    if (template && mode !== 'add') {
      setFormData({
        name: template.name || '',
        type: template.type || '',
        body: template.body || '',
        variables: template.variables ? (Array.isArray(template.variables) ? template.variables.join(', ') : template.variables) : '',
        status: template.status || 'active'
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        type: '',
        body: '',
        variables: '',
        status: 'active'
      });
    }
    setError('');
  }, [template, mode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const variablesArray = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const templateData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        body: formData.body.trim(),
        variables: variablesArray,
        status: formData.status
      };

      if (mode === 'add') {
        await smsTemplateService.createSmsTemplate(templateData);
        toast.success('SMS template created successfully');
      } else if (mode === 'edit') {
        await smsTemplateService.updateSmsTemplate(template.id, templateData);
        toast.success('SMS template updated successfully');
      }
      if (fetchTemplates) await fetchTemplates();
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (err) {
      console.error('Error saving SMS template:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this SMS template? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await smsTemplateService.deleteSmsTemplate(template.id);
      toast.success('SMS template deleted successfully');
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (err) {
      console.error('Error deleting SMS template:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addVariable = (variable) => {
    const currentVariables = formData.variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    if (!currentVariables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: currentVariables.length > 0
          ? `${prev.variables}, ${variable}`
          : variable,
        body: `${prev.body}{{${variable}}}`
      }));
    } else {
      // Just append it to body if it is already in variables
      setFormData(prev => ({
        ...prev,
        body: `${prev.body}{{${variable}}}`
      }));
    }
  };

  const commonVariables = [
    'patient_name', 'doctor_name', 'appointment_date', 'appointment_time',
    'hospital_name', 'department', 'package_name', 'package_price',
    'payment_id', 'registration_date', 'phone'
  ];

  const handleAddType = (type) => {
    const trimmed = type.trim();
    if (trimmed && !availableTypes.includes(trimmed)) {
      setAvailableTypes([...availableTypes, trimmed]);
      setFormData(prev => ({ ...prev, type: trimmed }));
      setTypeInput('');
      setTypeDropdownOpen(false);
      toast.success(`Type "${trimmed}" added`);
    } else if (availableTypes.includes(trimmed)) {
      setFormData(prev => ({ ...prev, type: trimmed }));
      setTypeInput('');
      setTypeDropdownOpen(false);
    }
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, type: newType }));
    setTypeInput('');
    setTypeDropdownOpen(false);
  };

  const filteredTypes = availableTypes.filter(type =>
    type.toLowerCase().includes(typeInput.toLowerCase())
  );

  // SMS length helper
  const smsLength = formData.body.length;
  // Standard GSM SMS is 160 chars. If multi-part (concatenated), it's 153 chars per part.
  const smsParts = smsLength === 0 ? 0 : (smsLength <= 160 ? 1 : Math.ceil(smsLength / 153));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl transition-all duration-300 border"
        style={{ background: C.card, color: C.black, borderColor: C.border }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: C.border }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: C.black }}>
              {mode === 'view' ? 'View SMS Template' : mode === 'add' ? 'Add SMS Template' : mode === 'edit' ? 'Edit SMS Template' : 'Delete SMS Template'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:opacity-80"
              style={{ background: C.border, color: C.black }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg border text-sm" style={{ background: C.red + '10', color: C.red, borderColor: C.red + '30' }}>
              {error}
            </div>
          )}

          {mode === 'delete' ? (
            <div>
              <p className="mb-4 text-base" style={{ color: C.black }}>
                Are you sure you want to delete the SMS template "<strong>{template?.name}</strong>"?
              </p>
              <p className="mb-6 text-sm" style={{ color: C.slate }}>
                This action cannot be undone. All data associated with this template will be permanently removed.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{
                    background: C.border,
                    color: C.black,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{
                    background: C.red,
                    color: C.white,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete Template'}
                </button>
              </div>
            </div>
          ) : mode === 'view' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: C.slate }}>Template Name</label>
                <p className="p-3 rounded-lg border" style={{ background: C.navy, borderColor: C.border, color: C.black }}>{formData.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: C.slate }}>Type</label>
                  <p className="p-3 rounded-lg border" style={{ background: C.navy, borderColor: C.border, color: C.black }}>{formData.type}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: C.slate }}>Status</label>
                  <div className="p-3 rounded-lg border" style={{ background: C.navy, borderColor: C.border }}>
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${formData.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: C.slate }}>SMS Message Body</label>
                <div className="p-4 rounded-lg border whitespace-pre-wrap text-sm leading-relaxed" style={{ background: C.navy, borderColor: C.border, color: C.black }}>
                  {formData.body}
                </div>
                <div className="mt-1.5 flex justify-between text-xs" style={{ color: C.slate }}>
                  <span>Length: {smsLength} characters</span>
                  <span>Estimated SMS parts: {smsParts}</span>
                </div>
              </div>

              {formData.variables && (
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1" style={{ color: C.slate }}>Variables</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-white" style={{ borderColor: C.border }}>
                    {formData.variables.split(',').map((v, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded text-xs font-semibold" style={{ background: C.teal + '15', color: C.teal }}>
                        {v.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end pt-4 border-t" style={{ borderColor: C.border }}>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-semibold border transition hover:bg-gray-50"
                  style={{ background: C.white, borderColor: C.border, color: C.black }}
                >
                  Close
                </button>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{ background: C.blue, color: C.white }}
                >
                  {previewMode ? 'Hide Preview' : 'Show Mobile Preview'}
                </button>
              </div>

              {previewMode && (
                <div className="mt-6 flex justify-center">
                  {/* Premium mock smartphone design for live preview */}
                  <div className="w-[320px] rounded-[36px] border-[8px] bg-slate-100 shadow-lg overflow-hidden border-slate-800 flex flex-col">
                    <div className="h-6 bg-slate-800 flex justify-between items-center px-6 text-[10px] text-white">
                      <span>9:41</span>
                      <div className="flex gap-1.5">
                        <span>📶</span>
                        <span>🔋</span>
                      </div>
                    </div>
                    <div className="bg-slate-200 py-2.5 text-center text-xs font-semibold border-b border-slate-300 text-slate-700">
                      💬 Messages
                    </div>
                    <div className="p-4 flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-3 bg-white">
                      <div className="bg-[#e9e9eb] text-black text-sm p-3 rounded-2xl rounded-tl-none max-w-[85%] self-start leading-snug whitespace-pre-wrap">
                        {formData.body || "No template content."}
                      </div>
                    </div>
                    <div className="bg-slate-100 p-2.5 border-t border-slate-300 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full border border-slate-300 px-3.5 py-1.5 text-xs text-slate-400">
                        iMessage
                      </div>
                      <span className="text-slate-400 text-lg">⬆️</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: C.black }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  style={{ borderColor: C.border, color: C.black }}
                  placeholder="e.g., Appointment Confirmation SMS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: C.black }}>
                  Template Type *
                </label>
                <div className="relative">
                  <div
                    className="w-full px-4 py-2.5 rounded-lg border bg-transparent cursor-pointer flex justify-between items-center text-sm"
                    style={{ borderColor: C.border, color: C.black }}
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  >
                    <span>{formData.type || 'Select or create a type'}</span>
                    <span className={`text-xs transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {typeDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border z-20 bg-white shadow-xl max-h-60 overflow-hidden"
                      style={{ borderColor: C.border }}
                    >
                      <div className="p-2 border-b bg-gray-50" style={{ borderColor: C.border }}>
                        <input
                          type="text"
                          value={typeInput}
                          onChange={(e) => setTypeInput(e.target.value)}
                          placeholder="Search or type new type..."
                          className="w-full px-3 py-1.5 rounded border bg-white text-sm"
                          style={{ borderColor: C.border, color: C.black }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {filteredTypes.length > 0 ? (
                          filteredTypes.map((type) => (
                            <div
                              key={type}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTypeChange(type);
                              }}
                              className="px-4 py-2 cursor-pointer text-sm transition hover:bg-gray-50"
                              style={{
                                background: formData.type === type ? C.teal + '15' : 'transparent',
                                color: C.black
                              }}
                            >
                              {type}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-gray-500 italic">No matches</div>
                        )}

                        {typeInput.trim() && !availableTypes.includes(typeInput.trim()) && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddType(typeInput);
                            }}
                            className="px-4 py-2 cursor-pointer text-sm font-semibold border-t hover:bg-teal-50"
                            style={{
                              background: C.teal + '10',
                              color: C.teal,
                              borderColor: C.border
                            }}
                          >
                            + Add "{typeInput.trim()}" as new type
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold" style={{ color: C.black }}>
                    SMS Message Body *
                  </label>
                  <span className={`text-xs ${smsLength > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {smsLength} / 160 ({smsParts} parts)
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border bg-transparent text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
                  style={{ borderColor: C.border, color: C.black }}
                  placeholder="Enter SMS text template. Use variables like {{patient_name}} to personalize."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: C.black }}>
                  Variables
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.variables}
                    onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    style={{ borderColor: C.border, color: C.black }}
                    placeholder="e.g., patient_name, appointment_date (comma separated)"
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border" style={{ borderColor: C.border }}>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color: C.slate }}>
                    Click to insert variables into body
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {commonVariables.map(variable => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => addVariable(variable)}
                        className="px-2.5 py-1 rounded text-xs font-medium transition hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ background: C.teal + '15', color: C.teal }}
                      >
                        +{variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: C.black }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  style={{ borderColor: C.border, color: C.black, backgroundColor: C.white }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t" style={{ borderColor: C.border }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold border transition hover:bg-gray-50"
                  style={{
                    background: C.white,
                    borderColor: C.border,
                    color: C.black,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{
                    background: C.teal,
                    color: C.white,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Saving...' : (mode === 'add' ? 'Add SMS Template' : 'Update SMS Template')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsTemplateModal;
