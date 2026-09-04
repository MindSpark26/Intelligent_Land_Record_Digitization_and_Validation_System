const LandDocument = require('../models/LandDocument');

// Pool of dummy extracted data to randomly pick from
const dummyDataPool = [
  { ownerName: 'Ramesh Kumar', surveyNumber: '104/2', village: 'Paldi', district: 'Ahmedabad', area: '2.5 acres' },
  { ownerName: 'Sunita Devi', surveyNumber: '78/1', village: 'Mandal', district: 'Jaipur', area: '1.8 acres' },
  { ownerName: 'Anil Sharma', surveyNumber: '215/3', village: 'Bhopal Nagar', district: 'Indore', area: '3.2 acres' },
  { ownerName: 'Priya Patel', surveyNumber: '56/7', village: 'Vasna', district: 'Vadodara', area: '0.9 acres' },
  { ownerName: 'Mohan Singh', surveyNumber: '332/1', village: 'Kheri', district: 'Lucknow', area: '4.1 acres' },
];

/**
 * Simulates AI processing on a newly uploaded document.
 * After a 3-second delay, updates the document with mock extracted data.
 */
function processDocument(documentId) {
  setTimeout(async () => {
    try {
      const doc = await LandDocument.findById(documentId);
      if (!doc || doc.status !== 'Pending') return;

      // Generate random confidence score between 40-75
      const confidenceScore = Math.round((Math.random() * 35 + 40) * 10) / 10;

      // Pick random dummy data
      const extractedData = dummyDataPool[Math.floor(Math.random() * dummyDataPool.length)];

      await LandDocument.findByIdAndUpdate(documentId, {
        status: 'Needs Review',
        confidenceScore,
        extractedData,
      });

      console.log(`[Mock AI] Processed document ${documentId} — confidence: ${confidenceScore}%`);
    } catch (err) {
      console.error(`[Mock AI] Error processing document ${documentId}:`, err.message);
    }
  }, 3000);
}

module.exports = { processDocument };
