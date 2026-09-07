'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchDocuments, deleteDocument } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import DocumentModal from '@/components/DocumentModal';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const filteredAndSortedDocuments = useMemo(() => {
    let result = documents.filter((doc) => {
      const name = doc.originalName || doc.filename || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate);
        case 'date-asc':
          return new Date(a.createdAt || a.uploadDate) - new Date(b.createdAt || b.uploadDate);
        case 'score-desc':
          return (b.scoringDetails?.finalScore ?? b.confidenceScore ?? 0) - (a.scoringDetails?.finalScore ?? a.confidenceScore ?? 0);
        case 'score-asc':
          return (a.scoringDetails?.finalScore ?? a.confidenceScore ?? 0) - (b.scoringDetails?.finalScore ?? b.confidenceScore ?? 0);
        case 'alpha-asc':
          return (a.originalName || a.filename || "").localeCompare(b.originalName || b.filename || "", undefined, { numeric: true, sensitivity: 'base' });
        case 'alpha-desc':
          return (b.originalName || b.filename || "").localeCompare(a.originalName || a.filename || "", undefined, { numeric: true, sensitivity: 'base' });
        default:
          return 0;
      }
    });
    return result;
  }, [documents, searchTerm, sortBy]);

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

  const handleViewEdit = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDocumentSaved = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) => (d._id === updatedDoc._id ? updatedDoc : d))
    );
    setSelectedDocument(updatedDoc);
  };

  const handleDelete = (doc) => {
    setDocumentToDelete(doc);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete._id);
      setDocuments((prev) => prev.filter((d) => d._id !== documentToDelete._id));
      setDocumentToDelete(null);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="relative h-full min-h-screen">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }} />
      <div className="relative z-10">

      {/* Hero Banner Section */}
      <div className="-mx-8 -mt-8 mb-8 relative h-64 sm:h-72 flex items-end overflow-hidden shadow-sm">
        <div className="absolute inset-0">
          <img 
            src="/banner.jpg" 
            alt="Agricultural Land" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-slate-900/10" />
        </div>
        <div className="relative z-10 px-8 pb-8 w-full">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">Land AI</h2>
          <p className="text-lg text-slate-200 font-medium max-w-2xl drop-shadow-sm">
            Digitize, analyze, and manage agricultural land records with high-precision AI verification.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Document Dashboard</h3>
        <p className="text-sm text-slate-600 mt-1">
          Track uploaded land records and their AI processing status.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Documents',
            value: documents.length,
            iconBg: 'bg-blue-50',
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13h3l-2.25 2.25 2.25 2.25h-3" />
              </svg>
            )
          },
          {
            label: 'Pending',
            value: documents.filter((d) => d.status === 'Pending').length,
            iconBg: 'bg-slate-100',
            icon: (
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                <circle cx="14" cy="14" r="4.5" fill="white" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 12v2l1.5 1.5" />
              </svg>
            )
          },
          {
            label: 'Needs Review',
            value: documents.filter((d) => d.status === 'Needs Review').length,
            iconBg: 'bg-orange-50',
            icon: (
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2-2m1-2a3 3 0 11-6 0 3 3 0 016 0z" fill="white" />
              </svg>
            )
          },
          {
            label: 'Validated',
            value: documents.filter((d) => d.status === 'Validated').length,
            iconBg: 'bg-green-50',
            icon: (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                <circle cx="14" cy="14" r="4.5" fill="white" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.5l1.5 1.5 2.5-3" />
              </svg>
            )
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents table */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-800 shrink-0 w-full sm:w-auto">Uploaded Documents</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full sm:w-64 text-slate-800"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white w-full sm:w-auto text-slate-800"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="score-desc">Score: High to Low</option>
              <option value="score-asc">Score: Low to High</option>
              <option value="alpha-asc">Name: A to Z</option>
              <option value="alpha-desc">Name: Z to A</option>
            </select>

            <button
              onClick={loadDocuments}
              className="text-xs text-slate-500 hover:text-orange-500 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap px-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Refresh
            </button>
          </div>
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
          <div className="px-6 py-16 text-center flex flex-col items-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <svg className="w-24 h-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                {/* Document (Background) */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                {/* Map Pin (Foreground) */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" fill="white" strokeWidth="1.2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-800">No documents uploaded yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Get started by uploading your first land record for AI validation.
            </p>
            <a
              href="/upload"
              className="inline-block px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 shadow-sm transition-all"
            >
              Upload Document
            </a>
          </div>
        ) : filteredAndSortedDocuments.length === 0 && searchTerm ? (
          <div className="px-6 py-16 text-center flex flex-col items-center">
            <p className="text-base font-medium text-slate-800">No documents match your search query.</p>
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
                    Final Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedDocuments.map((doc) => (
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
                      {doc.scoringDetails && doc.scoringDetails.finalScore != null ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  doc.scoringDetails.finalScore >= 70
                                    ? 'bg-emerald-500'
                                    : doc.scoringDetails.finalScore >= 50
                                    ? 'bg-orange-500'
                                    : 'bg-red-400'
                                }`}
                                style={{ width: `${doc.scoringDetails.finalScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {doc.scoringDetails.finalScore}%
                            </span>
                          </div>
                          {doc.scoringDetails.missingCriticalFields && doc.scoringDetails.missingCriticalFields.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded w-max">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Critical Fields Missing
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewEdit(doc)}
                          className="px-3 py-1.5 text-xs font-semibold text-orange-600 border border-orange-300 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          View / Edit
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Document View/Edit Modal */}
      <DocumentModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={handleDocumentSaved}
      />
      {/* Custom Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDocumentToDelete(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to permanently delete this record? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
