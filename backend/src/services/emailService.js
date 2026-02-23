const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const Setting = require('../models/Setting');

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
        secure: process.env.SMTP_PORT == 465,
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
   * Fetch platform settings
   */
  async getPlatformSettings() {
    try {
      const platformNameSetting = await Setting.findOne({ key: 'platform_name' });
      const logoSetting = await Setting.findOne({ key: 'logo_light' });
      return {
        platformName: platformNameSetting?.value || 'University CRM',
        logo: logoSetting?.value || null
      };
    } catch (error) {
      logger.error('Error fetching platform settings', { error: error.message });
      return { platformName: 'University CRM', logo: null };
    }
  }

  /**
   * Wrap content in a common HTML layout
   */
  getEmailLayout(content, platformName, title, logo = null, headerColor = '#4F46E5') {
    return `
      <div style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; background-color: #f3f4f6; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: ${headerColor}; padding: 40px 20px; text-align: center;">
            ${logo ? `<img src="${logo}" alt="${platformName}" style="max-height: 600px; max-width: 200px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">` : ''}
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">${platformName}</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px;">
            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 22px; font-weight: 700; text-align: center;">${title}</h2>
            <div style="color: #4b5563; font-size: 16px;">
              ${content}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;">
            
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Best regards,</p>
              <p style="font-size: 16px; font-weight: 700; color: ${headerColor}; margin: 5px 0 0 0;">${platformName} Team</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${platformName}. All rights reserved.</p>
          <p style="margin: 5px 0;">This is an automated security notification from your account.</p>
          <p style="margin: 5px 0;"><a href="${process.env.FRONTEND_URL}" style="color: ${headerColor}; text-decoration: none; font-weight: 600;">Visit our website</a></p>
        </div>
      </div>
    `;
  }

  /**
   * Send agent registration email
   */
  async sendAgentRegistrationEmail(agent) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Welcome to ${platformName} - Registration Pending`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Partner';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Thank you for registering as an agent with <strong>${platformName}</strong>. We have received your registration details:</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;"><strong>Company:</strong> ${agent.companyName || agent.company_name || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${agent.email}</p>
      </div>
      <p>Your registration is currently <strong>pending approval</strong> from our admin team. You will be notified via email once your account has been reviewed.</p>
      <p>Thank you for your patience and interest in partnering with us!</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Registration Received', logo);
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send agent approval email
   */
  async sendAgentApprovalEmail(agent) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Agent Account Approved - ${platformName}`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Partner';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Your agent account has been <strong>approved</strong>. You are now officially a partner with <strong>${platformName}</strong>.</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #dcfce7;">
        <p style="margin: 5px 0;"><strong>Company:</strong> ${agent.companyName || agent.company_name || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${agent.email}</p>
      </div>
      <p>You can now log in and start managing students and applications through your partner portal.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
          Login to Your Portal
        </a>
      </div>
      <p>We look forward to a successful partnership!</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Congratulations!', logo, '#10B981');
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send agent rejection email
   */
  async sendAgentRejectionEmail(agent, reason) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Registration Update - ${platformName}`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Applicant';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Thank you for your interest in becoming an agent with <strong>${platformName}</strong>.</p>
      <p>Unfortunately, after reviewing your application, we are unable to approve your registration at this time.</p>
      ${reason ? `
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #fee2e2;">
        <p style="margin: 0; color: #b91c1c;"><strong>Reason for decision:</strong><br>${reason}</p>
      </div>` : ''}
      <p>If you have any questions or would like to provide additional information for a future re-evaluation, please feel free to contact our support team.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Application Status Update', logo, '#EF4444');
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send application status update email
   */
  async sendApplicationStatusEmail(application, student, user, newStatus) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Application Status Update - ${platformName}`;
    const statusText = newStatus.toUpperCase().replace(/_/g, ' ');

    const content = `
      <p>Dear ${user.name || 'User'},</p>
      <p>There has been an update to an application on <strong>${platformName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;"><strong>Student:</strong> ${student.firstName} ${student.lastName}</p>
        <p style="margin: 5px 0;"><strong>University:</strong> ${application.university?.name || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Course:</strong> ${application.course?.name || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #4f46e5; font-weight: bold;">${statusText}</span></p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/applications/${application.id}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Application
        </a>
      </div>
    `;

    const html = this.getEmailLayout(content, platformName, 'Application Status Update', logo);
    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send payout approved email
   */
  async sendPayoutApprovedEmail(payout, agent, user) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Payout Request Approved - ${platformName}`;

    const content = `
      <p>Dear ${user.name || 'User'},</p>
      <p>We are pleased to inform you that your payout request has been <strong>approved</strong>.</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #dcfce7;">
        <p style="margin: 5px 0;"><strong>Amount:</strong> <span style="font-size: 18px; font-weight: bold; color: #10b981;">$${payout.amount}</span></p>
        <p style="margin: 5px 0;"><strong>Payout ID:</strong> ${payout.payout_number}</p>
      </div>
      <p>The payment will be processed shortly and credited to your registered bank account. Thank you for your continued partnership!</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Payout Approved', logo, '#10B981');
    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Password Reset Request - ${platformName}`;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const content = `
      <p>Dear ${user.name || 'User'},</p>
      <p>We received a request to reset the password for your <strong>${platformName}</strong> account.</p>
      <p>If you made this request, please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p><strong>Note:</strong> This link will expire in 1 hour. If you did not request this change, you can safely ignore this email.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Password Reset', logo);
    return this.sendEmail(user.email, subject, html);
  }
  /**
   * Send welcome email with credentials
   */
  async sendWelcomeWithCredentials(agent, plainPassword) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Welcome to ${platformName} - Your Login Credentials`;
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Partner';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Your agent account has been successfully created and approved on <strong>${platformName}</strong>.</p>
      <p>You can now access your portal using the following credentials:</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #4f46e5;">${loginUrl}</a></p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${agent.email}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #eee; padding: 2px 5px; border-radius: 4px;">${plainPassword}</code></p>
      </div>
      <p style="color: #ef4444; font-weight: bold;">Important: Please change your password immediately after your first login for security reasons.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Welcome Credentials', logo);
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password setup email (first-time)
   */
  async sendPasswordSetupEmail(agent, setupToken) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Agent Account Approved - Set Your Password - ${platformName}`;
    const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${setupToken}`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Partner';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Your agent account has been <strong>approved</strong> by our admin team on <strong>${platformName}</strong>. You are now officially a partner!</p>
      <p>To access your account, please set your password by clicking the button below:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${setupUrl}" 
           style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Set Your Password
        </a>
      </div>
      <p><strong>Note:</strong> This link will expire in 24 hours. After setting your password, you can log in to your dashboard.</p>
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Password Requirements:</strong> Minimum 8 characters, including uppercase, lowercase, numbers, and special characters.</p>
      </div>
    `;

    const html = this.getEmailLayout(content, platformName, 'Account Approved', logo);
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(agent, otp) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Password Reset OTP - ${platformName}`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'User';

    const content = `
      <p>Dear ${fullName},</p>
      <p>We received a request to reset your password for your <strong>${platformName}</strong> account. Use the OTP below to verify your identity:</p>
      <div style="background-color: #f3f4f6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px dashed #4f46e5;">
        <h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; color: #4f46e5;">${otp}</h1>
      </div>
      <p><strong>Important:</strong> This OTP will expire in 10 minutes. If you did not request a password reset, please secure your account or contact support.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Verification Required', logo);
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send password reset success confirmation
   */
  async sendPasswordResetSuccess(agent) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Password Reset Successful - ${platformName}`;
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'User';

    const content = `
      <p>Dear ${fullName},</p>
      <p>Your password for <strong>${platformName}</strong> has been successfully reset. You can now log in with your new password.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" 
           style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Login to Your Account
        </a>
      </div>
      <p>If you did not make this change, please contact our support team immediately as your account security might be compromised.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Password Updated', logo, '#10B981');
    return this.sendEmail(agent.email, subject, html);
  }

  /**
   * Send student welcome email with password setup link
   */
  async sendStudentWelcomeEmail(student, setupToken) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Welcome to ${platformName} - Set Your Password`;
    const setupUrl = `${process.env.FRONTEND_URL}/student/setup-password?token=${setupToken}`;
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    
    const content = `
      <p>Dear ${fullName},</p>
      <p>Congratulations! Your registration with <strong>${platformName}</strong> has been successful. Your journey with us begins here.</p>
      <p>To get started and access your student portal, please set up your account password by clicking the button below:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${setupUrl}" 
           style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
          Create Your Password
        </a>
      </div>
      <p><strong>Note:</strong> This link is valid for 24 hours. After it expires, you can use the "Forgot Password" option to request a new link.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Welcome!', logo);
    return this.sendEmail(student.email, subject, html);
  }

  /**
   * Send student password reset OTP
   */
  async sendStudentPasswordResetOTP(student, otp) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Password Reset OTP - ${platformName}`;
    const fullName = student.firstName || 'Student';
    
    const content = `
      <p>Dear ${fullName},</p>
      <p>We received a request to reset the password for your <strong>${platformName}</strong> account. Use the 6-digit OTP below to verify your identity:</p>
      <div style="background-color: #f3f4f6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px dashed #4f46e5;">
        <h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; color: #4f46e5;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 10 minutes.</strong></p>
      <p>If you didn't request a password reset, please ignore this email or contact support.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Password Reset', logo);
    return this.sendEmail(student.email, subject, html);
  }

  /**
   * Send student password reset success confirmation
   */
  async sendStudentPasswordResetSuccess(student) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Password Reset Successful - ${platformName}`;
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const fullName = student.firstName || 'Student';
    
    const content = `
      <p>Dear ${fullName},</p>
      <p>Your password for <strong>${platformName}</strong> has been successfully reset. You can now log in with your new password.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Login to Your Portal
        </a>
      </div>
      <p>If you didn't make this change, please contact our support team immediately.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Password Updated!', logo, '#10B981');
    return this.sendEmail(student.email, subject, html);
  }

  /**
   * Send verification OTP for partner applications
   */
  async sendVerificationOTP(email, otp) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Email Verification Code - ${platformName}`;
    
    const content = `
      <p>Hello,</p>
      <p>Thank you for your interest in the <strong>${platformName}</strong> Partner Program. Please use the following code to verify your email address:</p>
      <div style="background-color: #f3f4f6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px dashed #4f46e5;">
        <h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; color: #4f46e5;">${otp}</h1>
      </div>
      <p><strong>This code will expire in 10 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Verify Your Email', logo);
    return this.sendEmail(email, subject, html);
  }

  /**
   * Send "Application Under Review" email to agent
   */
  async sendApplicationUnderReviewEmail(agent, trackingLink) {
    const { platformName, logo } = await this.getPlatformSettings();
    const subject = `Application Received - ${platformName}`;
    const fullName = agent.firstName || 'Partner';
    
    const content = `
      <p>Dear ${fullName},</p>
      <p>Your application has been successfully submitted to the <strong>${platformName}</strong> Partner Program. Your application is currently <strong>Under Review</strong> by our team.</p>
      <p>We will notify you once there is an update on your status. You can track your application anytime using the link below:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${trackingLink}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Application Status
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #4f46e5; font-size: 14px;">${trackingLink}</p>
    `;

    const html = this.getEmailLayout(content, platformName, 'Application Received', logo);
    return this.sendEmail(agent.email, subject, html);
  }
}

module.exports = new EmailService();
