'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/services/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setUploadResult(null);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadDocument(file);
      setUploadResult(result);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Land Record</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload scanned land records (PDF or images) for AI-powered digitization.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-8">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-orange-500 bg-orange-50/50'
                : file
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.webp"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-input"
            />

            {file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Drag & drop your land record here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or click to browse files
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PDF</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">JPEG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PNG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">TIFF</span>
                  <span className="text-slate-300">•</span>
                  <span>Max 20MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Success message */}
          {uploadResult && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">{uploadResult.message}</p>
                <p className="text-xs text-emerald-500 mt-0.5">
                  The AI engine is now processing your document. Check the dashboard for status updates.
                </p>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              id="upload-submit-button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                !file || uploading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Upload...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload & Start AI Processing
                </>
              )}
            </button>

            {uploadResult && (
              <button
                onClick={() => router.push('/')}
                className="py-3 px-6 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                View Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Your documents are securely processed using AI-powered OCR and NLP engines.
          </div>
        </div>
      </div>
    </div>
  );
}
