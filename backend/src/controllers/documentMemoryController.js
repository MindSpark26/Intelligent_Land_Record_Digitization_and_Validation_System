const { calculateDocumentScore } = require('../utils/scoringService');

// ---------- In-Memory Store ----------
const documents = [];

function generateId() {
  // Simple unique ID without external dependency
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Pool of dummy extracted data (proper schema)
const dummyDataPool = [
  { landownerDetails: { primaryOwnerName: 'Ramesh Kumar' }, surveyNumber: '104/2', village: 'Paldi', district: 'Ahmedabad', plotArea: { value: '2.5', unit: 'Acres' } },
  { landownerDetails: { primaryOwnerName: 'Sunita Devi' }, surveyNumber: '78/1', village: 'Mandal', district: 'Jaipur', plotArea: { value: '1.8', unit: 'Acres' } },
  { landownerDetails: { primaryOwnerName: 'Anil Sharma' }, surveyNumber: '215/3', village: 'Bhopal Nagar', district: 'Indore', plotArea: { value: '3.2', unit: 'Hectares' } },
  { landownerDetails: { primaryOwnerName: 'Priya Patel' }, surveyNumber: '56/7', village: 'Vasna', district: 'Vadodara', plotArea: { value: '0.9', unit: 'Bigha' } },
  { landownerDetails: { primaryOwnerName: 'Mohan Singh' }, surveyNumber: '332/1', village: 'Kheri', district: 'Lucknow', plotArea: { value: '4.1', unit: 'Guntha' } },
];

/**
 * Mock AI processor — after 3s, updates document status.
 */
function processDocument(docId) {
  setTimeout(() => {
    const doc = documents.find((d) => d._id === docId);
    if (!doc || doc.status !== 'Pending') return;

    doc.extractedData = dummyDataPool[Math.floor(Math.random() * dummyDataPool.length)];
    const aiBaseConfidence = Math.round(Math.random() * 35 + 40);
    const { scoringDetails, status } = calculateDocumentScore(doc.extractedData, false, aiBaseConfidence);

    doc.scoringDetails = scoringDetails;
    doc.status = status;

    console.log(`[Mock AI] Processed document ${docId} — finalScore: ${doc.scoringDetails.finalScore}`);
  }, 3000);
}

/**
 * POST /api/upload
 */
function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF or image file.' });
    }

    const doc = {
      _id: generateId(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      cloudinaryUrl: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      status: 'Pending',
      scoringDetails: null,
      extractedData: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    documents.push(doc);

    // Trigger mock AI processing
    processDocument(doc._id);

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: doc,
    });
  } catch (err) {
    console.error('[Upload Error]', err.message);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
}

/**
 * GET /api/documents
 */
function getDocuments(_req, res) {
  try {
    // Return sorted newest first
    const sorted = [...documents].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return res.json(sorted);
  } catch (err) {
    console.error('[Fetch Error]', err.message);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

/**
 * PUT /api/documents/:id
 * Updates extractedData fields of an in-memory document.
 */
function updateDocument(req, res) {
  try {
    const doc = documents.find((d) => d._id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { landownerDetails, ...flatFields } = req.body;

    // Ensure extractedData exists
    if (!doc.extractedData) {
      doc.extractedData = {};
    }

    // Apply flat fields
    for (const [key, value] of Object.entries(flatFields)) {
      doc.extractedData[key] = value;
    }

    // Apply nested landownerDetails fields
    if (landownerDetails && typeof landownerDetails === 'object') {
      if (!doc.extractedData.landownerDetails) {
        doc.extractedData.landownerDetails = {};
      }
      for (const [key, value] of Object.entries(landownerDetails)) {
        doc.extractedData.landownerDetails[key] = value;
      }
    }

    // Recalculate score and status based on edited data
    const { scoringDetails, status: newStatus } = calculateDocumentScore(doc.extractedData, true, 100);
    delete doc.extractedData.confidenceScore;
    delete doc.confidenceScore;
    doc.scoringDetails = scoringDetails;
    doc.status = newStatus;

    doc.updatedAt = new Date().toISOString();

    return res.json({ message: 'Document updated successfully', document: doc });
  } catch (err) {
    console.error('[Update Error]', err.message);
    return res.status(500).json({ error: 'Failed to update document', details: err.message });
  }
}

/**
 * DELETE /api/documents/:id
 * Permanently removes a document from the in-memory store.
 */
function deleteDocument(req, res) {
  try {
    const index = documents.findIndex((d) => d._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    documents.splice(index, 1);
    return res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('[Delete Error]', err.message);
    return res.status(500).json({ error: 'Failed to delete document', details: err.message });
  }
}

module.exports = { uploadDocument, getDocuments, updateDocument, deleteDocument };
