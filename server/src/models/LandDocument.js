const mongoose = require('mongoose');

const extractedDataSchema = new mongoose.Schema(
  {
    ownerName: { type: String, default: 'Not Available' },
    fatherName: { type: String, default: 'Not Available' },
    surveyNumber: { type: String, default: 'Not Available' },
    area: { type: String, default: 'Not Available' },
    village: { type: String, default: 'Not Available' },
    transactionType: { type: String, default: 'Not Available' },
    confidenceScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const documentQualitySchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    legibility: { type: String, default: 'Unknown' },
    issuesDetected: { type: [String], default: [] },
  },
  { _id: false }
);

const landDocumentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Needs Review', 'Validated'],
      default: 'Pending',
    },
    confidenceScore: {
      type: Number,
      default: null,
    },
    extractedData: {
      type: extractedDataSchema,
      default: null,
    },
    documentQuality: {
      type: documentQualitySchema,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt for extensibility
  }
);

module.exports = mongoose.model('LandDocument', landDocumentSchema);
