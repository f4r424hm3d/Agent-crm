const mongoose = require('mongoose');

/**
 * Email Verification Schema
 * Stores OTP codes for email verification during student registration
 * Features: TTL index for auto-deletion, rate limiting, attempt tracking
 */
const emailVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete when expiresAt is reached
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    requestCount: {
        type: Number,
        default: 1
    },
    lastRequestAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient lookups
emailVerificationSchema.index({ email: 1, verified: 1 });
emailVerificationSchema.index({ createdAt: 1 });

// Static method to check rate limit
emailVerificationSchema.statics.checkRateLimit = async function (email) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await this.countDocuments({
        email: email.toLowerCase(),
        createdAt: { $gte: oneHourAgo }
    });

    return count < 5; // Max 5 requests per hour
};

// Static method to cleanup old records
emailVerificationSchema.statics.cleanup = async function (email) {
    await this.deleteMany({
        email: email.toLowerCase(),
        $or: [
            { expiresAt: { $lt: new Date() } },
            { verified: true }
        ]
    });
};

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
