const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: String,
  logoUrl: String,
  website: String,

  defaultCommission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0
    }
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  // Denormalized stats
  stats: {
    totalCourses: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
universitySchema.index({ country: 1, status: 1 });
universitySchema.index({ name: 'text' });

module.exports = mongoose.model('University', universitySchema);
