const { Application, Student, Counter } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const AuditService = require('../services/auditService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

class ApplicationController {
  /**
   * Get Students without any applications (Pending)
   * GET /api/applications/pending-students
   */
  static async getPendingStudents(req, res) {
    try {
      const matchQuery = {};

      // If Agent, only show their students
      if (req.userRole === 'AGENT') {
        const agentIdString = req.userId.toString();
        const agentId = new mongoose.Types.ObjectId(agentIdString);
        matchQuery.$or = [
          { agentId: agentId },
          { referredBy: agentIdString }
        ];
      }

      const students = await Student.aggregate([
        {
          $match: {
            ...matchQuery,
            isCompleted: true
          }
        },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'studentId',
            as: 'apps'
          }
        },
        {
          $addFields: {
            isApplied: { $gt: [{ $size: '$apps' }, 0] }
          }
        },
        // Only show students who haven't applied yet
        { $match: { isApplied: false } },
        { $project: { password: 0, apps: 0 } }
      ]);

      return ResponseHandler.success(res, 'Pending students retrieved successfully', students);
    } catch (error) {
      logger.error('Get Pending Students Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch pending students', error);
    }
  }

  /**
   * Get Students with applications (Applied)
   * GET /api/applications/applied-students
   */
  static async getAppliedStudents(req, res) {
    try {
      const matchQuery = {};

      // If Agent, only show their students (created directly OR referred)
      if (req.userRole === 'AGENT') {
        const agentIdString = req.userId.toString();
        const agentId = new mongoose.Types.ObjectId(agentIdString);
        matchQuery.$or = [
          { agentId: agentId },
          { referredBy: agentIdString }
        ];
      }

      const students = await Student.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'studentId',
            as: 'applications'
          }
        },
        { $match: { 'applications.0': { $exists: true } } },
        {
          $addFields: {
            referredByObjId: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$referredBy", null] },
                    { $ne: ["$referredBy", ""] },
                    { $eq: [{ $strLenCP: "$referredBy" }, 24] } // Simple check for ObjectId length
                  ]
                },
                then: { $toObjectId: "$referredBy" },
                else: null
              }
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'referredByObjId',
            foreignField: '_id',
            as: 'agentReferrer'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'referredByObjId',
            foreignField: '_id',
            as: 'userReferrer'
          }
        },
        {
          $addFields: {
            referredByName: {
              $cond: {
                if: { $gt: [{ $size: "$agentReferrer" }, 0] },
                then: { $concat: [{ $arrayElemAt: ["$agentReferrer.firstName", 0] }, " ", { $arrayElemAt: ["$agentReferrer.lastName", 0] }] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$userReferrer" }, 0] },
                    then: { $arrayElemAt: ["$userReferrer.name", 0] },
                    else: "Direct"
                  }
                }
              }
            },
            referredByRole: {
              $cond: {
                if: { $gt: [{ $size: "$agentReferrer" }, 0] },
                then: "Agent",
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$userReferrer" }, 0] },
                    then: { $arrayElemAt: ["$userReferrer.role", 0] },
                    else: "Direct"
                  }
                }
              }
            }
          }
        },
        { $project: { password: 0, agentReferrer: 0, userReferrer: 0, referredByObjId: 0 } }
      ]);

      return ResponseHandler.success(res, 'Applied students retrieved successfully', students);
    } catch (error) {
      logger.error('Get Applied Students Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch applied students', error);
    }
  }

  /**
   * Create new Application
   * POST /api/applications
   */
  static async createApplication(req, res) {
    try {
      const { studentId, programId, programSnapshot, notes } = req.body;

      // 1. Basic validation
      if (!studentId || !programId || !programSnapshot) {
        return ResponseHandler.badRequest(res, 'Missing required fields');
      }

      // 2. Authorization & Ownership Check
      const student = await Student.findById(studentId);
      if (!student) {
        return ResponseHandler.notFound(res, 'Student not found');
      }

      // Check if agent owns this student (either created directly OR referred)
      if (req.userRole === 'AGENT') {
        const isOwner = student.agentId?.toString() === req.userId.toString();
        const isReferrer = student.referredBy?.toString() === req.userId.toString();

        if (!isOwner && !isReferrer) {
          return ResponseHandler.forbidden(res, 'You can only apply for your own students');
        }
      }

      // 3. Duplicate Check (Student + Program)
      const existingApp = await Application.findOne({ studentId, programId });
      if (existingApp) {
        return ResponseHandler.badRequest(res, 'Application already exists for this student and program');
      }

      // 4. Generate Application Number (APP-YYYY-XXXXX)
      const currentYear = new Date().getFullYear();
      const counterKey = `APP-${currentYear}`;

      const counter = await Counter.findOneAndUpdate(
        { id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const seqNumber = counter.seq.toString().padStart(5, '0');
      const applicationNo = `${counterKey}-${seqNumber}`;

      // 5. Create Application
      const application = await Application.create({
        applicationNo,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        recruitmentAgentId: student.agentId || req.userId,
        programId,
        programSnapshot,
        notes,
        stage: 'Pre-Payment',
        paymentStatus: 'unpaid'
      });

      // 6. Audit & Logging
      await AuditService.logCreate(req.user, 'Application', application._id, application.toJSON(), req);
      logger.info('Application created', { applicationNo, studentId, agentId: req.userId });

      return ResponseHandler.created(res, 'Application submitted successfully', application);
    } catch (error) {
      logger.error('Create Application Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to create application', error);
    }
  }

  /**
   * Get all Applications with filters
   * GET /api/applications
   */
  static async getApplications(req, res) {
    try {
      const { page = 1, limit = 10, stage, paymentStatus } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (stage) query.stage = stage;
      if (paymentStatus) query.paymentStatus = paymentStatus;

      // Role-based filtering
      if (req.userRole === 'AGENT') {
        query.recruitmentAgentId = req.userId;
      } else if (req.userRole === 'STUDENT') {
        query.studentId = req.userId;
      }

      const totalItems = await Application.countDocuments(query);
      const applications = await Application.find(query)
        .populate('studentId', 'firstName lastName email passportNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return ResponseHandler.paginated(res, 'Applications retrieved', applications, {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems
      });
    } catch (error) {
      logger.error('Get Applications Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch applications', error);
    }
  }

  /**
   * Get all Applications for a specific student
   * GET /api/applications/student/:studentId
   */
  static async getStudentApplications(req, res) {
    try {
      const { studentId } = req.params;

      // Validate studentId
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return ResponseHandler.badRequest(res, 'Invalid student ID');
      }

      // Check student exists
      const student = await Student.findById(studentId).select('firstName lastName email phone nationality passportNumber agentId referredBy documents');
      if (!student) {
        return ResponseHandler.notFound(res, 'Student not found');
      }

      // Role-based access
      if (req.userRole === 'AGENT') {
        const isOwner = student.agentId?.toString() === req.userId.toString();
        const isReferrer = student.referredBy?.toString() === req.userId.toString();
        if (!isOwner && !isReferrer) {
          return ResponseHandler.forbidden(res, 'Access denied');
        }
      }

      const applications = await Application.find({ studentId })
        .sort({ createdAt: -1 });

      return ResponseHandler.success(res, 'Student applications retrieved', {
        student,
        applications
      });
    } catch (error) {
      logger.error('Get Student Applications Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch student applications', error);
    }
  }

  /**
   * Get single Application by ID
   * GET /api/applications/:id
   */
  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      const application = await Application.findById(id)
        .populate('studentId', 'firstName lastName email phone nationality passportNumber gender dateOfBirth address city state country postalCode documents');

      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      // Role-based access
      if (req.userRole === 'AGENT') {
        if (application.recruitmentAgentId.toString() !== req.userId.toString()) {
          return ResponseHandler.forbidden(res, 'Access denied');
        }
      } else if (req.userRole === 'STUDENT') {
        if (application.studentId._id.toString() !== req.userId.toString()) {
          return ResponseHandler.forbidden(res, 'Access denied');
        }
      }

      return ResponseHandler.success(res, 'Application retrieved', application);
    } catch (error) {
      logger.error('Get Application By ID Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch application', error);
    }
  }

  /**
   * Delete Application
   * DELETE /api/applications/:id
   * Only allowed when paymentStatus !== 'paid'
   */
  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      const application = await Application.findById(id);
      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      // Business Rule: Paid applications cannot be deleted
      if (application.paymentStatus === 'paid') {
        return ResponseHandler.forbidden(res, 'Paid applications cannot be deleted');
      }

      // Role-based access
      if (req.userRole === 'AGENT') {
        if (application.recruitmentAgentId.toString() !== req.userId.toString()) {
          return ResponseHandler.forbidden(res, 'Access denied');
        }
      }

      await AuditService.logDelete(req.user, 'Application', application._id, application.toJSON(), req);
      await Application.findByIdAndDelete(id);

      logger.info('Application deleted', { applicationNo: application.applicationNo, deletedBy: req.userId });
      return ResponseHandler.success(res, 'Application deleted successfully');
    } catch (error) {
      logger.error('Delete Application Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to delete application', error);
    }
  }

  /**
   * Update Application Payment Status
   * PUT /api/applications/:id/status
   * Options: paid, unpaid, cancelled
   */
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      const validStatuses = ['paid', 'unpaid', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ResponseHandler.badRequest(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const application = await Application.findById(id);
      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      const oldStatus = application.paymentStatus;

      // Update status
      application.paymentStatus = status;
      if (status === 'paid') {
        application.paymentDate = new Date();
      }

      // Add to status history
      const userName = req.user?.name || req.user?.firstName
        ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
        : 'System';

      application.statusHistory.push({
        actionType: 'status',
        oldValue: oldStatus,
        newValue: status,
        oldStatus: oldStatus,
        newStatus: status,
        changedBy: req.userId,
        changedByName: userName,
        notes: notes || `Payment status changed from ${oldStatus} to ${status}`,
        changedAt: new Date()
      });

      await application.save();

      await AuditService.logStatusChange(req.user, 'Application', application._id, oldStatus, status, req);
      logger.info('Application status updated', { applicationNo: application.applicationNo, oldStatus, newStatus: status });

      return ResponseHandler.success(res, 'Payment status updated successfully', application);
    } catch (error) {
      logger.error('Update Application Status Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update status', error);
    }
  }

  /**
   * Update Application Stage
   * PUT /api/applications/:id/stage
   */
  static async updateApplicationStage(req, res) {
    try {
      const { id } = req.params;
      const { stage, notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      const validStages = [
        'Pre-Payment', 'Pre-Submission', 'Submission', 'Post-Submission',
        'Admission', 'Visa-Application', 'Pre-Arrival', 'Post-Arrival', 'Arrival'
      ];

      if (!validStages.includes(stage)) {
        return ResponseHandler.badRequest(res, `Invalid stage. Must be one of: ${validStages.join(', ')}`);
      }

      const application = await Application.findById(id);
      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      const oldStage = application.stage;

      // Update stage
      application.stage = stage;

      // Add to status history
      const userName = req.user?.name || req.user?.firstName
        ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
        : 'System';

      application.statusHistory.push({
        actionType: 'stage',
        oldValue: oldStage,
        newValue: stage,
        changedBy: req.userId,
        changedByName: userName,
        notes: notes || `Stage changed from ${oldStage} to ${stage}`,
        changedAt: new Date()
      });

      await application.save();

      await AuditService.logStatusChange(req.user, 'Application', application._id, oldStage, stage, req);
      logger.info('Application stage updated', { applicationNo: application.applicationNo, oldStage, newStage: stage });

      return ResponseHandler.success(res, 'Stage updated successfully', application);
    } catch (error) {
      logger.error('Update Application Stage Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update stage', error);
    }
  }

  /**
   * Send Application Mail — Professional HTML Template
   * POST /api/applications/:id/send-mail
   */
  static async sendApplicationMail(req, res) {
    try {
      const { id } = req.params;
      const { sentTo, cc, greeting, messageBody, footer, attachedDocumentKeys } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      if (!sentTo || !messageBody) {
        return ResponseHandler.badRequest(res, 'Recipient email and message body are required');
      }

      const application = await Application.findById(id)
        .populate('studentId');

      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      const student = application.studentId || {};
      const snapshot = application.programSnapshot || {};
      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

      // Helper: format date
      const fmtDate = (d) => {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return ''; }
      };

      // Helper: build table row
      const row = (label, value) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;color:#374151;width:200px;background:#f8fafc;">${label}</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#1f2937;">${value || ''}</td>
        </tr>`;

      // Helper: section header
      const sectionHeader = (title) => `
        <tr><td colspan="2" style="padding:12px;background:#1e40af;color:white;font-weight:700;font-size:14px;border:none;">${title}</td></tr>`;

      // Build document attachment list in body
      const attachments = [];
      const attachedDocs = [];
      let attachmentListHtml = '';

      if (attachedDocumentKeys && attachedDocumentKeys.length > 0 && student.documents) {
        const studentDocs = student.documents instanceof Map ? Object.fromEntries(student.documents) : student.documents;

        for (const key of attachedDocumentKeys) {
          const docInfo = studentDocs[key];
          if (!docInfo) continue;

          // Handle both string paths and object {path, originalName}
          let docPath, docOriginalName;
          if (typeof docInfo === 'string') {
            docPath = docInfo;
            docOriginalName = path.basename(docInfo);
          } else if (docInfo.path) {
            docPath = docInfo.path;
            docOriginalName = docInfo.originalName || path.basename(docInfo.path);
          } else {
            continue;
          }

          const filePath = path.join(process.cwd(), docPath);
          if (fs.existsSync(filePath)) {
            attachments.push({ filename: docOriginalName, path: filePath });
            attachedDocs.push({ documentKey: key, fileName: docOriginalName, filePath: docPath });
          }
        }

        if (attachedDocs.length > 0) {
          attachmentListHtml = `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr><td colspan="2" style="padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;font-weight:700;color:#059669;font-size:13px;">
                📎 Attachments (${attachedDocs.length})
              </td></tr>
              ${attachedDocs.map(d => `<tr><td colspan="2" style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;color:#374151;">• ${d.fileName}</td></tr>`).join('')}
            </table>`;
        }
      }

      // ══════════════════════════════════════════════
      // BUILD PROFESSIONAL HTML EMAIL
      // ══════════════════════════════════════════════
      const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:20px 0;">
<tr><td align="center">
<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">Britannica Overseas</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">Education Consultancy</p>
    </td>
  </tr>

  <!-- Greeting & Message -->
  <tr>
    <td style="padding:28px 30px 20px;">
      <p style="margin:0 0 16px;font-size:15px;color:#1f2937;">${greeting || 'Dear Sir/Madam'},</p>
      <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${messageBody}</div>
    </td>
  </tr>

  <!-- Program Table -->
  <tr>
    <td style="padding:0 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:6px;overflow:hidden;">
        ${sectionHeader('Program')}
        ${row('Program', snapshot.programName || '')}
        ${row('University', snapshot.universityName || '')}
        ${snapshot.level ? row('Level', snapshot.level) : ''}
        ${snapshot.duration ? row('Duration', snapshot.duration) : ''}
        ${snapshot.specialization ? row('Specialization', snapshot.specialization) : ''}
      </table>
    </td>
  </tr>

  <!-- Personal Info Table -->
  <tr>
    <td style="padding:0 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:6px;overflow:hidden;">
        ${sectionHeader('Personal Info')}
        ${row('Student Name', studentName)}
        ${row('Father Name', student.fatherName || '')}
        ${row('Mother Name', student.motherName || '')}
        ${row('Country of Citizenship', student.nationality || '')}
        ${row('Gender', student.gender || '')}
        ${row('D.O.B', fmtDate(student.dateOfBirth))}
        ${row('First Language', student.firstLanguage || '')}
        ${row('Marital Status', student.maritalStatus || '')}
        ${row('Passport Number', student.passportNumber || '')}
        ${row('Passport Expiry', fmtDate(student.passportExpiry))}
      </table>
    </td>
  </tr>

  <!-- Address Details -->
  <tr>
    <td style="padding:0 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:6px;overflow:hidden;">
        ${sectionHeader('Address Details')}
        ${row('Address', student.address || '')}
        ${row('City', student.city || '')}
        ${row('State/Province', student.state || '')}
        ${row('Country', student.country || '')}
        ${row('Postal/Zipcode', student.postalCode || '')}
      </table>
    </td>
  </tr>

  <!-- Education Summary -->
  <tr>
    <td style="padding:0 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:6px;overflow:hidden;">
        ${sectionHeader('Education Summary')}
        ${row('Country of Education', student.educationCountry || '')}
        ${row('Highest Level of Education', student.highestLevel || '')}
        ${row('Grading Scheme', student.gradingScheme || '')}
        ${row('Grade Average', student.gradeAverage || '')}
      </table>
    </td>
  </tr>

  <!-- Attachment List -->
  ${attachmentListHtml ? `<tr><td style="padding:0 30px 20px;">${attachmentListHtml}</td></tr>` : ''}

  <!-- Footer Signature -->
  <tr>
    <td style="padding:20px 30px 24px;border-top:2px solid #e5e7eb;">
      <div style="font-size:13px;color:#374151;line-height:1.8;white-space:pre-wrap;">${(footer || '').replace(/\n/g, '<br>')}</div>
    </td>
  </tr>

  <!-- Bottom Bar -->
  <tr>
    <td style="background:#1e3a8a;padding:12px 30px;text-align:center;">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);">
        &copy; ${new Date().getFullYear()} Britannica Overseas Education. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>`;

      // Send email
      const subject = `Application ${application.applicationNo} - ${snapshot.programName || 'Program Application'} - ${studentName}`;

      await emailService.sendEmail(sentTo, subject, htmlContent, attachments);

      // Get user name
      const userName = req.user?.name || req.user?.firstName
        ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
        : 'System';

      // Add to mail history
      application.mailHistory.push({
        sentTo,
        cc: cc || '',
        subject,
        greeting: greeting || 'Dear Sir/Madam',
        messageBody,
        htmlSnapshot: htmlContent,
        attachedDocuments: attachedDocs,
        sentBy: req.userId,
        sentByName: userName,
        sentAt: new Date()
      });

      // Also add to status history timeline
      application.statusHistory.push({
        actionType: 'mail',
        newValue: `Email sent to ${sentTo}`,
        changedBy: req.userId,
        changedByName: userName,
        notes: `Email sent to ${sentTo}${attachedDocs.length > 0 ? ` with ${attachedDocs.length} attachment(s)` : ''}`,
        changedAt: new Date()
      });

      // Update isSent flag
      application.isSent = true;

      await application.save();

      logger.info('Application mail sent', { applicationNo: application.applicationNo, sentTo, attachments: attachedDocs.length });

      return ResponseHandler.success(res, 'Email sent successfully', {
        mailEntry: application.mailHistory[application.mailHistory.length - 1]
      });
    } catch (error) {
      logger.error('Send Application Mail Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to send email', error);
    }
  }

  /**
   * Update Payment with proof upload
   * PUT /api/applications/:id/pay
   */
  static async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const { paymentDate, notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHandler.badRequest(res, 'Invalid application ID');
      }

      const application = await Application.findById(id);
      if (!application) {
        return ResponseHandler.notFound(res, 'Application not found');
      }

      const oldStatus = application.paymentStatus;

      // We ONLY update the paymentDate, we DO NOT change the paymentStatus to 'paid' anymore.
      application.paymentDate = paymentDate ? new Date(paymentDate) : new Date();

      // Handle uploaded files
      if (req.files && req.files.length > 0) {
        const paymentDir = path.join(process.cwd(), 'uploads', 'payments', application.applicationNo);
        if (!fs.existsSync(paymentDir)) {
          fs.mkdirSync(paymentDir, { recursive: true });
        }

        for (const file of req.files) {
          const ext = path.extname(file.originalname);
          const safeName = `payment_${Date.now()}${ext}`;
          const targetPath = path.join(paymentDir, safeName);

          // Move from temp to payment folder
          try {
            fs.renameSync(file.path, targetPath);
          } catch (e) {
            fs.copyFileSync(file.path, targetPath);
            fs.unlinkSync(file.path);
          }

          const relativePath = path.join('uploads', 'payments', application.applicationNo, safeName);

          application.paymentProof.push({
            fileName: safeName,
            originalName: file.originalname,
            path: relativePath,
            mimeType: file.mimetype,
            size: file.size,
            uploadedAt: new Date()
          });
        }
      }

      // History entry
      const userName = req.user?.name || req.user?.firstName
        ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
        : 'System';

      application.statusHistory.push({
        actionType: 'status',
        oldValue: oldStatus,
        newValue: oldStatus, // Status remains the same
        oldStatus: oldStatus,
        newStatus: oldStatus, // Status remains the same
        changedBy: req.userId,
        changedByName: userName,
        notes: notes || `Invoice uploaded`,
        changedAt: new Date()
      });

      await application.save();

      await AuditService.logStatusChange(req.user, 'Application', application._id, oldStatus, oldStatus, req);
      logger.info('Payment updated', {
        applicationNo: application.applicationNo,
        proofCount: req.files?.length || 0
      });

      return ResponseHandler.success(res, 'Payment updated successfully', application);
    } catch (error) {
      logger.error('Update Payment Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update payment', error);
    }
  }
}

module.exports = ApplicationController;
