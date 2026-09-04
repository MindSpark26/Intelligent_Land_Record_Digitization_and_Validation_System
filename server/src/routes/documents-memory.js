const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { v4: uuidv4 } = require('crypto');

// ---------- In-Memory Store ----------
const documents = [];

function generateId() {
  // Simple unique ID without external dependency
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Pool of dummy extracted data
const dummyDataPool = [
  { ownerName: 'Ramesh Kumar', surveyNumber: '104/2', village: 'Paldi', district: 'Ahmedabad', area: '2.5 acres' },
  { ownerName: 'Sunita Devi', surveyNumber: '78/1', village: 'Mandal', district: 'Jaipur', area: '1.8 acres' },
  { ownerName: 'Anil Sharma', surveyNumber: '215/3', village: 'Bhopal Nagar', district: 'Indore', area: '3.2 acres' },
  { ownerName: 'Priya Patel', surveyNumber: '56/7', village: 'Vasna', district: 'Vadodara', area: '0.9 acres' },
  { ownerName: 'Mohan Singh', surveyNumber: '332/1', village: 'Kheri', district: 'Lucknow', area: '4.1 acres' },
];

/**
 * Mock AI processor — after 3s, updates document status.
 */
function processDocument(docId) {
  setTimeout(() => {
    const doc = documents.find((d) => d._id === docId);
    if (!doc || doc.status !== 'Pending') return;

    doc.status = 'Needs Review';
    doc.confidenceScore = Math.round((Math.random() * 35 + 40) * 10) / 10;
    doc.extractedData = dummyDataPool[Math.floor(Math.random() * dummyDataPool.length)];

    console.log(`[Mock AI] Processed document ${docId} — confidence: ${doc.confidenceScore}%`);
  }, 3000);
}

/**
 * POST /api/upload
 */
router.post('/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF or image file.' });
    }

    const doc = {
      _id: generateId(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      status: 'Pending',
      confidenceScore: null,
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
});

/**
 * GET /api/documents
 */
router.get('/documents', (_req, res) => {
  try {
    // Return sorted newest first
    const sorted = [...documents].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return res.json(sorted);
  } catch (err) {
    console.error('[Fetch Error]', err.message);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;
