const nodemailer = require('nodemailer');

/**
 * Email Service for sending OTP and other emails
 * Uses SMTP configuration from environment variables
 */

// Create transporter using existing SMTP config
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
    } else {
        console.log('✓ Email service ready');
    }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {number} expiryMinutes - OTP expiry time in minutes
 */
const sendOTPEmail = async (email, otp, expiryMinutes = 5) => {
    try {
        const mailOptions = {
            from: `"Britannica Overseas" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Verify Your Email - Student Registration',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
              <p>Complete your student registration</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for starting your registration with Britannica Overseas. To verify your email address, please use the OTP code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This code will expire in <strong>${expiryMinutes} minutes</strong>.
              </div>
              
              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Never share this code with anyone</li>
                <li>We will never ask for your OTP via phone or email</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Britannica Overseas Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Britannica Overseas. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

/**
 * Send welcome email after successful registration
 * @param {Object} student - Student object
 */
const sendWelcomeEmail = async (student) => {
    try {
        const mailOptions = {
            from: `"Britannica Overseas" <${process.env.EMAIL_FROM}>`,
            to: student.email,
            subject: 'Welcome to Britannica Overseas - Registration Complete',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; }
            .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>Welcome to Britannica Overseas!</h1>
            </div>
            <div class="content">
              <p>Dear ${student.firstName} ${student.lastName},</p>
              <p>Congratulations! Your registration has been successfully completed.</p>
              
              <div class="next-steps">
                <h3>Next Steps:</h3>
                <ol>
                  <li>Our team will review your application</li>
                  <li>You'll receive updates via email at <strong>${student.email}</strong></li>
                  <li>Our counselor will contact you within 24-48 hours</li>
                </ol>
              </div>
              
              <p>Thank you for choosing Britannica Overseas for your educational journey.</p>
              
              <p>Best regards,<br><strong>Britannica Overseas Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Britannica Overseas. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail
};
