const bcrypt = require('bcryptjs');
const EmailVerification = require('../models/EmailVerification');
const { sendOTPEmail } = require('../utils/emailService');

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email
 * POST /api/otp/send
 */
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        const emailLower = email.toLowerCase();

        // Check rate limit
        const canRequest = await EmailVerification.checkRateLimit(emailLower);
        if (!canRequest) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP requests. Please try again after an hour.'
            });
        }

        // Cleanup old/expired OTP records for this email
        await EmailVerification.cleanup(emailLower);

        // Generate OTP
        const otp = generateOTP();
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        // Hash OTP before storing
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save to database
        await EmailVerification.create({
            email: emailLower,
            otp: hashedOTP,
            expiresAt,
            verified: false,
            attempts: 0
        });

        // Send email
        await sendOTPEmail(emailLower, otp, expiryMinutes);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            expiresIn: expiryMinutes * 60 // seconds
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
};

/**
 * Verify OTP
 * POST /api/otp/verify
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const emailLower = email.toLowerCase();

        // Find latest OTP record
        const verification = await EmailVerification.findOne({
            email: emailLower,
            verified: false
        }).sort({ createdAt: -1 });

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'No OTP found. Please request a new one.'
            });
        }

        // Check if expired
        if (new Date() > verification.expiresAt) {
            return res.status(400).json({
                success: false,
                code: 'OTP_EXPIRED',
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check max attempts
        const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
        if (verification.attempts >= maxAttempts) {
            return res.status(400).json({
                success: false,
                code: 'MAX_ATTEMPTS_EXCEEDED',
                message: 'Maximum verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp.toString(), verification.otp);

        if (!isValid) {
            // Increment attempts
            verification.attempts += 1;
            await verification.save();

            const attemptsLeft = maxAttempts - verification.attempts;

            return res.status(400).json({
                success: false,
                code: 'INVALID_OTP',
                message: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
                attemptsLeft
            });
        }

        // Mark as verified
        verification.verified = true;
        await verification.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            verified: true
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again.'
        });
    }
};

/**
 * Resend OTP
 * POST /api/otp/resend
 */
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const emailLower = email.toLowerCase();

        // Check rate limit
        const canRequest = await EmailVerification.checkRateLimit(emailLower);
        if (!canRequest) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP requests. Please try again after an hour.'
            });
        }

        // Invalidate old OTPs
        await EmailVerification.updateMany(
            { email: emailLower, verified: false },
            { verified: true } // Mark as used
        );

        // Generate new OTP
        const otp = generateOTP();
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        // Hash OTP
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save new OTP
        await EmailVerification.create({
            email: emailLower,
            otp: hashedOTP,
            expiresAt,
            verified: false,
            attempts: 0
        });

        // Send email
        await sendOTPEmail(emailLower, otp, expiryMinutes);

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email',
            expiresIn: expiryMinutes * 60
        });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP. Please try again.'
        });
    }
};
