const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Sub-schema for embedded documents
const studentDocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const studentSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // Personal details
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  nationality: String,
  passportNumber: String,
  passportExpiry: Date,

  // Address
  address: String,
  city: String,
  country: String,
  postalCode: String,

  // Academic
  academicLevel: String,

  // Agent reference
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // Embedded documents array
  documents: [studentDocumentSchema],

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes (email is already indexed via unique: true)
studentSchema.index({ agentId: 1, status: 1 });
studentSchema.index({ passportNumber: 1 });

// Hash password before saving
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide password in JSON responses
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
