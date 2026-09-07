const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all documents from the backend, sorted newest-first.
 */
export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch documents: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Upload a single file to the backend.
 * @param {File} file - The file to upload
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Upload failed: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update the extractedData of a document by ID.
 * @param {string} id - The document _id
 * @param {object} extractedData - The updated extractedData fields
 */
export async function updateDocument(id, extractedData) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(extractedData),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Update failed: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Permanently delete a document by ID.
 * @param {string} id - The document _id
 */
export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Delete failed: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
