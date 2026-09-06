'use client';

import { useState } from 'react';
import { updateDocument } from '@/lib/api';

/**
 * Field definitions for the extracted data form.
 * Grouped logically with labels for display.
 */
const FIELD_DEFS = [
  { key: 'landownerDetails.primaryOwnerName', label: 'Primary Owner Name' },
  { key: 'landownerDetails.fatherOrHusbandName', label: "Father / Husband's Name" },
  { key: 'surveyNumber', label: 'Survey Number' },
  { key: 'khasraNumber', label: 'Khasra Number' },
  { key: 'khataNumber', label: 'Khata Number' },
  { key: 'plotArea', label: 'Plot Area' },
  { key: 'district', label: 'District' },
  { key: 'tehsil', label: 'Tehsil' },
  { key: 'village', label: 'Village' },
  { key: 'landClassification', label: 'Land Classification' },
  { key: 'ownershipDetails', label: 'Ownership Details' },
  { key: 'mutationRecords', label: 'Mutation Records' },
  { key: 'registrationInformation', label: 'Registration Information' },
];

/**
 * Safely get a nested value from an object using a dot-separated key.
 */
function getNestedValue(obj, path) {
  if (!obj) return '';
  return path.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : ''), obj);
}

/**
 * Build a flat form-data object from extractedData using field definitions.
 */
function buildFormData(extractedData) {
  const data = {};
  for (const field of FIELD_DEFS) {
    data[field.key] = getNestedValue(extractedData, field.key);
  }
  return data;
}

/**
 * Convert flat form-data back into the nested API payload structure.
 */
function formDataToPayload(formData) {
  const payload = {};
  const landownerDetails = {};

  for (const [key, value] of Object.entries(formData)) {
    if (key.startsWith('landownerDetails.')) {
      const subKey = key.replace('landownerDetails.', '');
      landownerDetails[subKey] = value;
    } else {
      payload[key] = value;
    }
  }

  if (Object.keys(landownerDetails).length > 0) {
    payload.landownerDetails = landownerDetails;
  }

  return payload;
}

/**
 * DocumentModal — displays document details in read-only mode by default.
 * An "Edit Data" button switches all fields to editable inputs.
 * "Save Changes" persists edits to the backend and returns to read-only mode.
 */
export default function DocumentModal({ document, isOpen, onClose, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(document?.extractedData));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !document) return null;

  const NUMERIC_FIELDS = ['khasraNumber', 'khataNumber', 'surveyNumber', 'plotArea', 'mutationRecords'];

  const validateField = (key, value) => {
    if (!value) return null;
    if (NUMERIC_FIELDS.includes(key)) {
      if (/[a-zA-Z]/.test(value)) {
        return 'Only numbers are allowed';
      }
    } else {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return 'Only letters and spaces are allowed';
      }
    }
    return null;
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    const errorMsg = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: errorMsg }));
  };

  const handleEdit = () => {
    setFormData(buildFormData(document.extractedData));
    setErrors({});
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setFormData(buildFormData(document.extractedData));
    setErrors({});
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = formDataToPayload(formData);
      const result = await updateDocument(document._id, payload);
      onSaved(result.document);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setError(null);
    setErrors({});
    onClose();
  };

  const hasErrors = Object.values(errors).some((err) => err !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Document Details</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
              {document.originalName || document.filename}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Meta info */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Status</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{document.status}</p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Final Score</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {document.scoringDetails && document.scoringDetails.finalScore != null ? `${document.scoringDetails.finalScore}%` : '—'}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Uploaded</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {new Date(document.uploadDate).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Extracted data fields */}
          {!document.extractedData ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No extracted data available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {FIELD_DEFS.map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                    {field.label}
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white text-slate-800 ${
                          errors[field.key]
                            ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
                            : 'border-slate-200 focus:ring-orange-500/40 focus:border-orange-500'
                        }`}
                      />
                      {errors[field.key] && (
                        <span className="text-red-500 text-sm mt-1 block">{errors[field.key]}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-800 py-2 px-3 bg-slate-50 rounded-lg min-h-[38px] flex items-center">
                      {getNestedValue(document.extractedData, field.key) || (
                        <span className="text-slate-300">—</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">⚠ {error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {document.extractedData && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || hasErrors}
                  className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-5 py-2 text-sm font-semibold text-orange-600 border border-orange-300 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Edit Data
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
