const mongoose = require('mongoose');

const commissionRuleSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },

  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },

  priority: {
    type: Number,
    default: 0
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
commissionRuleSchema.index({ agentId: 1, universityId: 1, courseId: 1 });
commissionRuleSchema.index({ priority: -1 });

module.exports = mongoose.model('CommissionRule', commissionRuleSchema);
