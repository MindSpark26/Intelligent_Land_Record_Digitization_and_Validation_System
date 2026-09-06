const mongoose = require('mongoose');

const extractedDataSchema = new mongoose.Schema(
  {
    landownerDetails: {
      primaryOwnerName: { type: String, default: "" },
      fatherOrHusbandName: { type: String, default: "" }
    },
    surveyNumber: { type: String, default: "" },
    khasraNumber: { type: String, default: "" },
    khataNumber: { type: String, default: "" },
    plotArea: { type: String, default: "" },
    district: { type: String, default: "" },
    tehsil: { type: String, default: "" },
    village: { type: String, default: "" },
    landClassification: { type: String, default: "" },
    ownershipDetails: { type: String, default: "" },
    mutationRecords: { type: String, default: "" },
    registrationInformation: { type: String, default: "" },
  },
  { _id: false }
);

const documentQualitySchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    legibility: { type: String, default: 'Unknown' },
    issuesDetected: { type: [String], default: [] },
    aiBaseConfidence: { type: Number, default: 0 }
  },
  { _id: false }
);

const scoringDetailsSchema = new mongoose.Schema(
  {
    completeness: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    validity: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
    missingCriticalFields: { type: [String], default: [] },
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
    scoringDetails: {
      type: scoringDetailsSchema,
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
