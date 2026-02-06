const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  commissionRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommissionRule'
  },

  // Denormalized fields
  agentName: String,
  studentName: String,
  courseName: String,

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

  calculatedAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes
commissionSchema.index({ applicationId: 1 }, { unique: true });
commissionSchema.index({ agentId: 1, status: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
