const mongoose = require('mongoose');

// Sub-schema for status history (embedded)
const statusHistorySchema = new mongoose.Schema({
  oldStatus: String,
  newStatus: {
    type: String,
    required: true
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

const applicationSchema = new mongoose.Schema({
  // References
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  // Denormalized fields for performance
  studentName: String,
  studentEmail: String,
  agentName: String,
  universityName: String,
  courseName: String,

  // Status
  applicationStatus: {
    type: String,
    enum: [
      'submitted',
      'documents_verified',
      'university_applied',
      'offer_received',
      'accepted',
      'visa_applied',
      'enrolled',
      'commission_eligible',
      'paid',
      'rejected'
    ],
    default: 'submitted'
  },
  source: String,
  notes: String,

  // Embedded status history
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ agentId: 1 });
applicationSchema.index({ universityId: 1 });
applicationSchema.index({ courseId: 1 });
applicationSchema.index({ applicationStatus: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
