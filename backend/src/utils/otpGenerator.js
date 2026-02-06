const crypto = require('crypto');

/**
 * Generate a secure 6-digit OTP
 */
const generateOTP = () => {
    // Generate random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

/**
 * Generate a secure random token for password reset/setup
 * @param {number} length - Length of token (default: 32)
 */
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash OTP for secure storage (optional, for extra security)
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = {
    generateOTP,
    generateToken,
    hashOTP
};
