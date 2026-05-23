// import React, { useState, useEffect } from 'react';
// import { C } from '../constants/data';
// import { emailTemplateService } from '../../service/emailTemplate.service';
// import { toast } from 'sonner';

// const EmailTemplateModal = ({ isOpen, onClose, template, onActionComplete, mode, templateTypes, fetchTemplates }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     type: '',
//     subject: '',
//     body: '',
//     variables: '',
//     status: 'active'
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [previewMode, setPreviewMode] = useState(false);

//   useEffect(() => {
//     if (template && mode !== 'add') {
//       setFormData({
//         name: template.name || '',
//         type: template.type || '',
//         subject: template.subject || '',
//         body: template.body || '',
//         variables: template.variables ? template.variables.join(', ') : '',
//         status: template.status || 'active'
//       });
//     } else if (mode === 'add') {
//       setFormData({
//         name: '',
//         type: '',
//         subject: '',
//         body: '',
//         variables: '',
//         status: 'active'
//       });
//     }
//   }, [template, mode]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const variablesArray = formData.variables
//         .split(',')
//         .map(v => v.trim())
//         .filter(v => v.length > 0);

//       const templateData = {
//         ...formData,
//         variables: variablesArray,
//       };

//       if (mode === 'add') {
//         await emailTemplateService.createEmailTemplate(templateData);
//         toast.success('Email template created successfully');
//       } else if (mode === 'edit') {
//         await emailTemplateService.updateEmailTemplate(template.id, templateData);
//         toast.success('Email template updated successfully');
//       }
//       fetchTemplates()
//       // onActionComplete();
//       onClose();
//     } catch (err) {
//       console.error('Error saving template:', err);
//       setError(err.response?.data?.error || 'Failed to save template. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm('Are you sure you want to delete this email template? This action cannot be undone.')) {
//       return;
//     }

//     setLoading(true);
//     try {
//       await emailTemplateService.deleteEmailTemplate(template.id);
//       toast.success('Email template deleted successfully');
//       onActionComplete();
//       onClose();
//     } catch (err) {
//       console.error('Error deleting template:', err);
//       setError(err.response?.data?.error || 'Failed to delete template. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addVariable = (variable) => {
//     const currentVariables = formData.variables
//       .split(',')
//       .map(v => v.trim())
//       .filter(v => v.length > 0);

//     if (!currentVariables.includes(variable)) {
//       setFormData(prev => ({
//         ...prev,
//         variables: currentVariables.length > 0
//           ? `${prev.variables}, ${variable}`
//           : variable
//       }));
//     }
//   };

//   const commonVariables = [
//     'patient_name', 'doctor_name', 'appointment_date', 'appointment_time',
//     'hospital_name', 'department', 'package_name', 'package_price',
//     'payment_id', 'registration_date', 'email', 'phone'
//   ];

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50">
//       <div
//         className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl"
//         style={{ background: C.card, color: C.black }}
//       >
//         {/* Header */}
//         <div className="p-6 border-b" style={{ borderColor: C.border }}>
//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold" style={{ color: C.black }}>
//               {mode === 'view' ? 'View Template' : mode === 'add' ? 'Add Template' : mode === 'edit' ? 'Edit Template' : 'Delete Template'}
//             </h2>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full flex items-center justify-center transition"
//               style={{ background: C.border, color: C.black }}
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {error && (
//             <div className="mb-4 p-3 rounded-lg" style={{ background: C.red + '20', color: C.red }}>
//               {error}
//             </div>
//           )}

//           {mode === 'delete' ? (
//             <div>
//               <p className="mb-4" style={{ color: C.black }}>
//                 Are you sure you want to delete the email template "<strong>{template?.name}</strong>"?
//               </p>
//               <p className="mb-6" style={{ color: C.slate }}>
//                 This action cannot be undone. All data associated with this template will be permanently removed.
//               </p>
//               <div className="flex gap-4 justify-end">
//                 <button
//                   onClick={onClose}
//                   disabled={loading}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{
//                     background: C.border,
//                     color: C.black,
//                     opacity: loading ? 0.5 : 1
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={loading}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{
//                     background: C.red,
//                     color: C.white,
//                     opacity: loading ? 0.5 : 1
//                   }}
//                 >
//                   {loading ? 'Deleting...' : 'Delete Template'}
//                 </button>
//               </div>
//             </div>
//           ) : mode === 'view' ? (
//             <div>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Template Name</label>
//                   <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.name}</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Type</label>
//                   <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.type}</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Subject</label>
//                   <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.subject}</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Body</label>
//                   <div className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>
//                     <div dangerouslySetInnerHTML={{ __html: formData.body }} />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Variables</label>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.variables.split(',').map((v, idx) => (
//                       <span key={idx} className="px-2 py-1 rounded text-sm" style={{ background: C.teal + '20', color: C.teal }}>
//                         {v.trim()}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Status</label>
//                   <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>
//                     <span className={`px-2 py-1 rounded text-xs font-semibold ${formData.status === 'active'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-gray-100 text-gray-800'
//                       }`}>
//                       {formData.status}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               <div className="flex gap-4 justify-end mt-6">
//                 <button
//                   onClick={onClose}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{ background: C.border, color: C.black }}
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={() => setPreviewMode(!previewMode)}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{ background: C.blue, color: C.white }}
//                 >
//                   {previewMode ? 'Hide Preview' : 'Show Preview'}
//                 </button>
//               </div>

//               {previewMode && (
//                 <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.border, background: C.white }}>
//                   <h3 className="font-semibold mb-2" style={{ color: C.black }}>Email Preview</h3>
//                   <div className="border rounded p-4" style={{ borderColor: C.border }}>
//                     <p className="font-semibold mb-2" style={{ color: C.black }}>Subject: {formData.subject}</p>
//                     <div dangerouslySetInnerHTML={{ __html: formData.body }} />
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Template Name *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg border bg-transparent"
//                   style={{ borderColor: C.border, color: C.black }}
//                   placeholder="e.g., Welcome Email"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Template Type *
//                 </label>
//                 <select
//                   required
//                   value={formData.type}
//                   onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg border bg-transparent"
//                   style={{ borderColor: C.border, color: C.black, backgroundColor: C.white }}
//                 >
//                   <option value="">Select a type</option>
//                   {templateTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Subject Line *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.subject}
//                   onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg border bg-transparent"
//                   style={{ borderColor: C.border, color: C.black }}
//                   placeholder="e.g., Welcome to GlobalCare!"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Email Body *
//                 </label>
//                 <textarea
//                   required
//                   rows={8}
//                   value={formData.body}
//                   onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg border bg-transparent"
//                   style={{ borderColor: C.border, color: C.black }}
//                   placeholder="Enter the email content. You can use HTML tags for formatting."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Variables
//                 </label>
//                 <div className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={formData.variables}
//                     onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
//                     className="flex-1 px-4 py-2 rounded-lg border bg-transparent"
//                     style={{ borderColor: C.border, color: C.black }}
//                     placeholder="e.g., patient_name, doctor_name, appointment_date"
//                   />
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <span className="text-xs" style={{ color: C.slate }}>Common variables:</span>
//                   {commonVariables.map(variable => (
//                     <button
//                       key={variable}
//                       type="button"
//                       onClick={() => addVariable(variable)}
//                       className="px-2 py-1 rounded text-xs transition"
//                       style={{ background: C.teal + '20', color: C.teal }}
//                     >
//                       +{variable}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
//                   Status
//                 </label>
//                 <select
//                   value={formData.status}
//                   onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg border bg-transparent"
//                   style={{ borderColor: C.border, color: C.black, backgroundColor: C.white }}
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>

//               <div className="flex gap-4 justify-end pt-4">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={loading}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{
//                     background: C.border,
//                     color: C.black,
//                     opacity: loading ? 0.5 : 1
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-6 py-2 rounded-lg font-semibold transition"
//                   style={{
//                     background: C.teal,
//                     color: C.white,
//                     opacity: loading ? 0.5 : 1
//                   }}
//                 >
//                   {loading ? 'Saving...' : (mode === 'add' ? 'Add Template' : 'Update Template')}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmailTemplateModal;

import React, { useState, useEffect } from 'react';
import { C } from '../constants/data';
import { emailTemplateService } from '../../service/emailTemplate.service';
import { toast } from 'sonner';

const EmailTemplateModal = ({ isOpen, onClose, template, onActionComplete, mode, templateTypes, fetchTemplates }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subject: '',
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
        subject: template.subject || '',
        body: template.body || '',
        variables: template.variables ? template.variables.join(', ') : '',
        status: template.status || 'active'
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        type: '',
        subject: '',
        body: '',
        variables: '',
        status: 'active'
      });
    }
  }, [template, mode]);

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
        ...formData,
        variables: variablesArray,
      };

      if (mode === 'add') {
        await emailTemplateService.createEmailTemplate(templateData);
        toast.success('Email template created successfully');
      } else if (mode === 'edit') {
        await emailTemplateService.updateEmailTemplate(template.id, templateData);
        toast.success('Email template updated successfully');
      }
      fetchTemplates()
      // onActionComplete();
      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.error || 'Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this email template? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await emailTemplateService.deleteEmailTemplate(template.id);
      toast.success('Email template deleted successfully');
      onActionComplete();
      onClose();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.response?.data?.error || 'Failed to delete template. Please try again.');
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
          : variable
      }));
    }
  };

  const handleAddType = (type) => {
    if (type.trim() && !availableTypes.includes(type.trim())) {
      setAvailableTypes([...availableTypes, type.trim()]);
      setFormData(prev => ({ ...prev, type: type.trim() }));
      setTypeInput('');
      setTypeDropdownOpen(false);
      toast.success(`Type "${type.trim()}" added`);
    } else if (availableTypes.includes(type.trim())) {
      setFormData(prev => ({ ...prev, type: type.trim() }));
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

  const commonVariables = [
    'patient_name', 'doctor_name', 'appointment_date', 'appointment_time',
    'hospital_name', 'department', 'package_name', 'package_price',
    'payment_id', 'registration_date', 'email', 'phone'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl"
        style={{ background: C.card, color: C.black }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: C.border }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: C.black }}>
              {mode === 'view' ? 'View Template' : mode === 'add' ? 'Add Template' : mode === 'edit' ? 'Edit Template' : 'Delete Template'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition"
              style={{ background: C.border, color: C.black }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: C.red + '20', color: C.red }}>
              {error}
            </div>
          )}

          {mode === 'delete' ? (
            <div>
              <p className="mb-4" style={{ color: C.black }}>
                Are you sure you want to delete the email template "<strong>{template?.name}</strong>"?
              </p>
              <p className="mb-6" style={{ color: C.slate }}>
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
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Template Name</label>
                  <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Type</label>
                  <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Subject</label>
                  <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>{formData.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Body</label>
                  <div className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>
                    <div dangerouslySetInnerHTML={{ __html: formData.body }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Variables</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.split(',').map((v, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-sm" style={{ background: C.teal + '20', color: C.teal }}>
                        {v.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>Status</label>
                  <p className="p-3 rounded-lg" style={{ background: C.bg, color: C.black }}>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${formData.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {formData.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{ background: C.border, color: C.black }}
                >
                  Close
                </button>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{ background: C.blue, color: C.white }}
                >
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {previewMode && (
                <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.border, background: C.white }}>
                  <h3 className="font-semibold mb-2" style={{ color: C.black }}>Email Preview</h3>
                  <div className="border rounded p-4" style={{ borderColor: C.border }}>
                    <p className="font-semibold mb-2" style={{ color: C.black }}>Subject: {formData.subject}</p>
                    <div dangerouslySetInnerHTML={{ __html: formData.body }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: C.border, color: C.black }}
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Template Type *
                </label>
                <div className="relative">
                  <div
                    className="w-full px-4 py-2 rounded-lg border bg-transparent cursor-pointer flex justify-between items-center"
                    style={{ borderColor: C.border, color: C.black }}
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  >
                    <span>{formData.type || 'Select or create a type'}</span>
                    <span className={`transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {typeDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded-lg border z-10 bg-white shadow-lg"
                      style={{ borderColor: C.border }}
                    >
                      <div className="p-2 border-b" style={{ borderColor: C.border }}>
                        <input
                          type="text"
                          value={typeInput}
                          onChange={(e) => setTypeInput(e.target.value)}
                          placeholder="Search or type new type..."
                          className="w-full px-3 py-2 rounded border bg-transparent"
                          style={{ borderColor: C.border, color: C.black }}
                          autoFocus
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {filteredTypes.length > 0 && (
                          <>
                            {filteredTypes.map((type) => (
                              <div
                                key={type}
                                onClick={() => handleTypeChange(type)}
                                className="px-4 py-2 cursor-pointer transition hover:opacity-75"
                                style={{
                                  background: formData.type === type ? C.teal + '20' : 'transparent',
                                  color: C.black
                                }}
                              >
                                {type}
                              </div>
                            ))}
                          </>
                        )}

                        {typeInput.trim() && !availableTypes.includes(typeInput.trim()) && (
                          <div
                            onClick={() => handleAddType(typeInput)}
                            className="px-4 py-2 cursor-pointer transition hover:opacity-75 font-semibold border-t"
                            style={{
                              background: C.teal + '20',
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
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: C.border, color: C.black }}
                  placeholder="e.g., Welcome to GlobalCare!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Email Body *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: C.border, color: C.black }}
                  placeholder="Enter the email content. You can use HTML tags for formatting."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Variables
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.variables}
                    onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                    className="flex-1 px-4 py-2 rounded-lg border bg-transparent"
                    style={{ borderColor: C.border, color: C.black }}
                    placeholder="e.g., patient_name, doctor_name, appointment_date"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs" style={{ color: C.slate }}>Common variables:</span>
                  {commonVariables.map(variable => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => addVariable(variable)}
                      className="px-2 py-1 rounded text-xs transition"
                      style={{ background: C.teal + '20', color: C.teal }}
                    >
                      +{variable}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: C.black }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: C.border, color: C.black, backgroundColor: C.white }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
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
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold transition"
                  style={{
                    background: C.teal,
                    color: C.white,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Saving...' : (mode === 'add' ? 'Add Template' : 'Update Template')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;