const mongoose = require('mongoose');

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
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt for extensibility
  }
);

module.exports = mongoose.model('LandDocument', landDocumentSchema);
