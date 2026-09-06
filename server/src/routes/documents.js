const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const fs = require('fs');
const LandDocument = require('../models/LandDocument');
const { processLandDocument } = require('../services/aiExtractor');
const { calculateDocumentScore } = require('../utils/scoringService');

/**
 * POST /api/upload
 * Accepts a single file upload, creates a DB record, and triggers AI processing.
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF or image file.' });
    }

    // --- Step 1: AI extraction ---
    const response = await fetch(req.file.path);
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const aiResult = await processLandDocument(fileBuffer, req.file.mimetype);

    // --- Step 2: Score document and save ---
    const aiBaseConfidence = aiResult.documentQuality?.aiBaseConfidence || 0;
    const { scoringDetails, status } = calculateDocumentScore(aiResult.extractedData, false, aiBaseConfidence);

    const landDocument = new LandDocument({
      filename: req.file.filename,
      originalName: req.file.originalname,
      cloudinaryUrl: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: status,
      scoringDetails: scoringDetails,
      extractedData: aiResult.extractedData,
      documentQuality: aiResult.documentQuality,
    });

    try {
      await landDocument.save();
    } catch (dbErr) {
      console.error('MongoDB Save Error:', dbErr);
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
    return res.status(500).json({ error: 'AI failed to process the document', details: err.message });
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

/**
 * PUT /api/documents/:id
 * Updates the extractedData fields of an existing document.
 * Recalculates confidenceScore and status based on the edited data.
 */
router.put('/documents/:id', async (req, res) => {
  try {
    const { landownerDetails, ...flatFields } = req.body;

    // --- Step 1: Fetch existing document to merge data for scoring ---
    const existing = await LandDocument.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Build the merged extractedData object for scoring
    const mergedData = existing.extractedData
      ? JSON.parse(JSON.stringify(existing.extractedData))
      : {};

    // Apply flat field edits
    for (const [key, value] of Object.entries(flatFields)) {
      mergedData[key] = value;
    }

    // Apply nested landownerDetails edits
    if (landownerDetails && typeof landownerDetails === 'object') {
      if (!mergedData.landownerDetails) {
        mergedData.landownerDetails = {};
      }
      for (const [key, value] of Object.entries(landownerDetails)) {
        mergedData.landownerDetails[key] = value;
      }
    }

    // --- Step 2: Recalculate score and status ---
    const { scoringDetails, status: newStatus } = calculateDocumentScore(mergedData, true, 100);

    // --- Step 3: Build dot-notation update payload ---
    const updateObj = {};

    for (const [key, value] of Object.entries(flatFields)) {
      updateObj[`extractedData.${key}`] = value;
    }

    if (landownerDetails && typeof landownerDetails === 'object') {
      for (const [key, value] of Object.entries(landownerDetails)) {
        updateObj[`extractedData.landownerDetails.${key}`] = value;
      }
    }

    // Append recalculated scoring details and status
    updateObj['scoringDetails'] = scoringDetails;
    updateObj['status'] = newStatus;

    const updated = await LandDocument.findByIdAndUpdate(
      req.params.id,
      { $set: updateObj },
      { new: true, runValidators: true }
    );

    return res.json({ message: 'Document updated successfully', document: updated });
  } catch (err) {
    console.error('[Update Error]', err.message);
    return res.status(500).json({ error: 'Failed to update document', details: err.message });
  }
});

/**
 * DELETE /api/documents/:id
 * Permanently removes a document from the database.
 */
router.delete('/documents/:id', async (req, res) => {
  try {
    const deleted = await LandDocument.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('[Delete Error]', err.message);
    return res.status(500).json({ error: 'Failed to delete document', details: err.message });
  }
});

module.exports = router;
