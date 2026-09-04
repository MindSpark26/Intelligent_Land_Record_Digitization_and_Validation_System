'use client';

import { useEffect, useState } from 'react';
import { fetchDocuments } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // Auto-refresh every 4 seconds to pick up mock AI updates
    const interval = setInterval(loadDocuments, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Document Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track uploaded land records and their AI processing status.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Documents',
            value: documents.length,
            color: 'from-slate-600 to-slate-800',
            iconBg: 'bg-slate-700',
          },
          {
            label: 'Pending',
            value: documents.filter((d) => d.status === 'Pending').length,
            color: 'from-slate-400 to-slate-500',
            iconBg: 'bg-slate-400',
          },
          {
            label: 'Needs Review',
            value: documents.filter((d) => d.status === 'Needs Review').length,
            color: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-500',
          },
          {
            label: 'Validated',
            value: documents.filter((d) => d.status === 'Validated').length,
            color: 'from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents table */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Uploaded Documents</h2>
          <button
            onClick={loadDocuments}
            className="text-xs text-slate-500 hover:text-orange-500 font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading documents...
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-500">⚠ {error}</p>
            <p className="text-xs text-slate-400 mt-1">Make sure the backend server is running on port 5000.</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0v3.375m0-3.375V16.5m0-5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No documents uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Go to <a href="/upload" className="text-orange-500 hover:underline">Upload Document</a> to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 truncate max-w-xs">
                            {doc.originalName || doc.filename}
                          </p>
                          {doc.fileSize && (
                            <p className="text-[11px] text-slate-400">
                              {(doc.fileSize / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4">
                      {doc.confidenceScore != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                doc.confidenceScore >= 70
                                  ? 'bg-emerald-500'
                                  : doc.confidenceScore >= 50
                                  ? 'bg-orange-500'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${doc.confidenceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {doc.confidenceScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
