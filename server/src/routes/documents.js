const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const fs = require('fs');
const LandDocument = require('../models/LandDocument');
const { processLandDocument } = require('../services/aiExtractor');

/**
 * POST /api/upload
 * Accepts a single file upload, creates a DB record, and triggers AI processing.
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF or image file.' });
    }

    // --- Step 1: Create initial record ---
    let landDocument;
    try {
      landDocument = new LandDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        status: 'Processing',
      });
      await landDocument.save();
    } catch (dbErr) {
      console.error('MongoDB Save Error (initial):', dbErr);
      return res.status(500).json({ error: 'Database save failed', details: dbErr.message });
    }

    // --- Step 2: AI extraction ---
    const fileBuffer = fs.readFileSync(req.file.path);
    const aiResult = await processLandDocument(fileBuffer, req.file.mimetype);

    // --- Step 3: Update record with AI data ---
    landDocument.extractedData = aiResult.extractedData;
    landDocument.documentQuality = aiResult.documentQuality;
    landDocument.confidenceScore = aiResult.extractedData.confidenceScore;

    // Apply business logic based on confidence score
    if (landDocument.confidenceScore >= 75) {
      landDocument.status = 'Validated';
    } else {
      landDocument.status = 'Needs Review';
    }

    try {
      await landDocument.save();
    } catch (dbErr) {
      console.error('MongoDB Save Error (update):', dbErr);
      return res.status(500).json({ error: 'Database save failed', details: dbErr.message });
    }

    // --- Step 4: Only respond with success after save succeeds ---
    return res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: landDocument,
      quality: aiResult.documentQuality,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({ error: 'Failed to upload document', details: err.message });
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
