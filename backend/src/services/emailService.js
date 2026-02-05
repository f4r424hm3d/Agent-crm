const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Lazy initialization - only create transporter when email is being sent
    // This prevents blocking the server startup if SMTP is misconfigured
    this.transporter = null;
    this.createTransporter();
  }

  createTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        // Connection timeout and pool settings to prevent hanging
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 5000,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      // Verify connection on creation (non-blocking)
      this.transporter.verify((error) => {
        if (error) {
          logger.warn('SMTP connection verification failed (non-blocking)', { error: error.message });
        } else {
          logger.info('SMTP server is ready to send emails');
        }
      });
    }
    return this.transporter;
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html, attachments = []) {
    try {
      // Ensure transporter is created
      const transporter = this.createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error('Error sending email', { to, subject, error: error.message });
      throw error;
    }
  }

  /**
   * Send agent registration email
   */
  async sendAgentRegistrationEmail(agent) {
    const subject = 'Welcome to University CRM - Registration Pending';
    const html = `
      <h2>Welcome ${agent.first_name} ${agent.last_name}!</h2>
      <p>Thank you for registering as an agent with University CRM.</p>
      <p><strong>Company:</strong> ${agent.company_name}</p>
      <p><strong>Email:</strong> ${agent.email}</p>
      <p>Your registration is currently pending approval from our admin team.</p>
      <p>You will be notified once your account is approved.</p>
      <p>Thank you for your patience!</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send agent approval email
   */
  async sendAgentApprovalEmail(agent) {
    const subject = 'Agent Account Approved - University CRM';
    const html = `
      <h2>Congratulations ${agent.first_name} ${agent.last_name}!</h2>
      <p>Your agent account has been approved.</p>
      <p><strong>Company:</strong> ${agent.company_name}</p>
      <p><strong>Email:</strong> ${agent.email}</p>
      <p>You can now log in and start managing students and applications.</p>
      <p><a href="${process.env.FRONTEND_URL}/login">Login Now</a></p>
      <p>Thank you for partnering with us!</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send agent rejection email
   */
  async sendAgentRejectionEmail(agent, reason) {
    const subject = 'Agent Registration Update - University CRM';
    const html = `
      <h2>Dear ${agent.first_name} ${agent.last_name},</h2>
      <p>Thank you for your interest in becoming an agent with University CRM.</p>
      <p>Unfortunately, we are unable to approve your registration at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send application status update email
   */
  async sendApplicationStatusEmail(application, student, user, newStatus) {
    const subject = `Application Status Update: ${newStatus}`;
    const html = `
      <h2>Application Status Update</h2>
      <p>Dear ${user.name},</p>
      <p>Your application status has been updated.</p>
      <p><strong>University:</strong> ${application.university?.name || 'N/A'}</p>
      <p><strong>Course:</strong> ${application.course?.name || 'N/A'}</p>
      <p><strong>New Status:</strong> ${newStatus.toUpperCase().replace(/_/g, ' ')}</p>
      <p><a href="${process.env.FRONTEND_URL}/applications/${application.id}">View Application</a></p>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send payout approved email
   */
  async sendPayoutApprovedEmail(payout, agent, user) {
    const subject = 'Payout Request Approved';
    const html = `
      <h2>Payout Approved</h2>
      <p>Dear ${user.name},</p>
      <p>Your payout request has been approved.</p>
      <p><strong>Amount:</strong> $${payout.amount}</p>
      <p><strong>Payout Number:</strong> ${payout.payout_number}</p>
      <p>The payment will be processed shortly and credited to your registered bank account.</p>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Dear ${user.name},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return this.sendEmail(user.email, subject, html);
  }
  /**
   * Send welcome email with credentials
   */
  async sendWelcomeWithCredentials(agent, plainPassword) {
    const subject = 'Welcome to University CRM - Your Login Credentials';
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = `
      <h2>Welcome ${agent.firstName || agent.name}!</h2>
      <p>Your agent account has been created/approved.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Email:</strong> ${agent.email}</p>
      <p><strong>Password:</strong> ${plainPassword}</p>
      <p>Please change your password after your first login.</p>
      <br>
      <p>Best regards,</p>
      <p>University CRM Team</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password setup email (first-time)
   */
  async sendPasswordSetupEmail(agent, setupToken) {
    const subject = 'Agent Account Approved - Set Your Password';
    const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${setupToken}`;
    const html = `
      <h2>Congratulations ${agent.firstName || agent.name}!</h2>
      <p>Your agent account has been <strong>approved</strong> by our admin team.</p>
      <p><strong>Your Registered Email:</strong> ${agent.email}</p>
      <p>To access your account, please set your password by clicking the link below:</p>
      <p style="margin: 20px 0;">
        <a href="${setupUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Set Your Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${setupUrl}</p>
      <p><strong>Important:</strong> This link will expire in 24 hours.</p>
      <p><strong>Password Requirements:</strong></p>
      <ul>
        <li>At least 8 characters</li>
        <li>At least one uppercase letter</li>
        <li>At least one lowercase letter</li>
        <li>At least one number</li>
        <li>At least one special character (!@#$%^&*...)</li>
      </ul>
      <br>
      <p>Best regards,</p>
      <p>University CRM Team</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(agent, otp) {
    const subject = 'Password Reset OTP - University CRM';
    const html = `
      <h2>Password Reset Request</h2>
      <p>Dear ${agent.firstName || agent.name},</p>
      <p>We received a request to reset your password. Use the OTP below to verify your identity:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 10 minutes.</strong></p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <br>
      <p>Best regards,</p>
      <p>University CRM Team</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password reset success confirmation
   */
  async sendPasswordResetSuccess(agent) {
    const subject = 'Password Reset Successful - University CRM';
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = `
      <h2>Password Reset Successful</h2>
      <p>Dear ${agent.firstName || agent.name},</p>
      <p>Your password has been successfully reset.</p>
      <p>You can now log in with your new password:</p>
      <p style="margin: 20px 0;">
        <a href="${loginUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login Now
        </a>
      </p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <br>
      <p>Best regards,</p>
      <p>University CRM Team</p>
    `;
    return this.sendEmail(agent.email, subject, html);
  }
}

module.exports = new EmailService();
