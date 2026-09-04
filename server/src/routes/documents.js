const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const LandDocument = require('../models/LandDocument');
const { processDocument } = require('../services/mockAiProcessor');

/**
 * POST /api/upload
 * Accepts a single file upload, creates a DB record, and triggers mock AI processing.
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF or image file.' });
    }

    const landDocument = new LandDocument({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'Pending',
    });

    await landDocument.save();

    // Trigger mock AI processing in the background
    processDocument(landDocument._id);

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: landDocument,
    });
  } catch (err) {
    console.error('[Upload Error]', err.message);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents
 * Returns all documents sorted by newest first.
 */
router.get('/documents', async (_req, res) => {
  try {
    const documents = await LandDocument.find().sort({ uploadDate: -1 });
    return res.json(documents);
  } catch (err) {
    console.error('[Fetch Error]', err.message);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;
