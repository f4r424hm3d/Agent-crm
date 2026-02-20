const mongoose = require('mongoose');

// Sub-schema for unified activity history (status/stage/mail changes)
const statusHistorySchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['status', 'stage', 'mail'],
    required: true
  },
  oldValue: String,
  newValue: String,
  oldStatus: String,
  newStatus: {
    type: String
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedByName: String, // Denormalized
  notes: String,
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Sub-schema for mail history
const mailHistorySchema = new mongoose.Schema({
  sentTo: { type: String, required: true },
  cc: String,
  subject: String,
  greeting: String,
  recipientName: String,
  messageBody: String,
  senderName: String,
  htmlSnapshot: String,
  attachedDocuments: [{
    documentKey: String,
    fileName: String,
    filePath: String
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentByName: String,
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const applicationSchema = new mongoose.Schema({
  // Unique identification
  applicationNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // References
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  recruitmentAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },

  // Snapshots
  studentName: {
    type: String,
    required: true
  },

  // Program Details
  programId: {
    type: String, // External ID
    required: true
  },
  programSnapshot: {
    programName: String,
    universityName: String,
    countryName: String,
    level: String,
    duration: String,
    category: String,
    specialization: String
  },

  // Status & Workflow
  stage: {
    type: String,
    enum: [
      'Pre-Payment',
      'Pre-Submission',
      'Submission',
      'Post-Submission',
      'Admission',
      'Visa-Application',
      'Pre-Arrival',
      'Post-Arrival',
      'Arrival'
    ],
    default: 'Pre-Payment'
  },

  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'cancelled'],
    default: 'unpaid'
  },
  paymentDate: Date,
  paymentProof: [{
    fileName: String,
    originalName: String,
    path: String,
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  applyDate: {
    type: Date,
    default: Date.now
  },

  // Transmission
  isSent: {
    type: Boolean,
    default: false
  },

  // Role-Based Locking
  lockedForAgent: {
    type: Boolean,
    default: false
  },
  submittedByAgent: {
    type: Boolean,
    default: false
  },
  submittedAt: Date,

  // Metadata
  notes: String,
  statusHistory: [statusHistorySchema],
  mailHistory: [mailHistorySchema]
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ applicationNo: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, programId: 1 }, { unique: true });
applicationSchema.index({ stage: 1 });
applicationSchema.index({ paymentStatus: 1 });
applicationSchema.index({ recruitmentAgentId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
