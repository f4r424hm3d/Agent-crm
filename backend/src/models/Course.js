const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  universityName: String, // Denormalized

  name: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['UG', 'PG', 'Diploma', 'Certificate'],
    required: true
  },
  duration: String,
  tuitionFee: {
    type: Number,
    default: 0
  },
  intake: String,
  eligibility: String,

  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ universityId: 1, status: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ name: 'text' });

module.exports = mongoose.model('Course', courseSchema);
