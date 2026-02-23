const { Agent, User, Student, Application } = require('../models');
const { moveFileToEntityFolder } = require('../services/storageService');
const ResponseHandler = require('../utils/responseHandler');
const AuditService = require('../services/auditService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { AGENT_APPROVAL_STATUS } = require('../utils/constants');
const { generateAgentCode } = require('../utils/agentCodeGenerator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class AgentController {
  /**
   * Get all agents
   * GET /api/agents
   */
  static async getAllAgents(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (page - 1) * limit;

      const query = { approvalStatus: 'approved' };
      if (status) {
        query.approvalStatus = status;
      }

      if (search) {
        query.$or = [
          { agentCode: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
        ];
      }

      const agents = await Agent.find(query)
        .select('-password')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

      const count = await Agent.countDocuments(query);

      // Add activity status based on applications in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const agentsWithActivity = await Promise.all(
        agents.map(async (agent) => {
          const appCount = await Application.countDocuments({
            recruitmentAgentId: agent._id,
            createdAt: { $gte: thirtyDaysAgo }
          });

          let activityStatus = 'Inactive';
          if (appCount >= 5) activityStatus = 'Active';
          else if (appCount >= 2) activityStatus = 'Moderate';

          return {
            ...agent.toObject(),
            activityStatus,
            applicationCount30Days: appCount
          };
        })
      );

      return ResponseHandler.paginated(res, 'Agents retrieved successfully', agentsWithActivity, {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
      });
    } catch (error) {
      logger.error('Get agents error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to get agents', error);
    }
  }

  /**
   * Toggle agent login permission
   * PATCH /api/agents/:id/toggle-permission
   */
  static async toggleLoginPermission(req, res) {
    try {
      const { id } = req.params;
      const { canLogin } = req.body;

      if (typeof canLogin !== 'boolean') {
        return ResponseHandler.badRequest(res, 'canLogin must be a boolean');
      }

      const agent = await Agent.findByIdAndUpdate(
        id,
        { canLogin },
        { new: true }
      ).select('-password');

      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Log audit
      await AuditService.logUpdate(req.user, 'Agent', agent._id,
        { canLogin: !canLogin },
        { canLogin },
        req
      );

      return ResponseHandler.success(res, `Login permission ${canLogin ? 'enabled' : 'disabled'} for ${agent.firstName}`, agent);
    } catch (error) {
      console.error('Toggle permission error:', error);
      logger.error('Toggle permission error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to toggle permission', error);
    }
  }

  /**
   * Get agent by ID
   * GET /api/agents/:id
   */
  static async getAgentById(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id)
        .select('-password')
        .populate('approvedBy', 'id name email');

      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      return ResponseHandler.success(res, 'Agent retrieved successfully', { agent });
    } catch (error) {
      logger.error('Get agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to get agent', error);
    }
  }

  /**
   * Create agent (Registration)
   * POST /api/agents
   */
  static async createAgent(req, res) {
    try {
      const {
        firstName, lastName, email, phone, company_name, companyName
      } = req.body;

      const finalCompanyName = company_name || companyName;

      // 2. Check if email exists
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return ResponseHandler.badRequest(res, 'Email already exists');
      }

      // 3. Generate password setup token
      const setupToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(setupToken).digest('hex');
      const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // 4. Generate unique agentCode
      const agentCode = await generateAgentCode();

      // 5. Create agent
      const agentData = {
        ...req.body,
        agentCode,
        firstName,
        lastName,
        email,
        phone,
        companyName: finalCompanyName,
        password: crypto.randomBytes(16).toString('hex'), // Temporary password
        passwordSetupToken: hashedToken,
        passwordSetupExpires: setupTokenExpires,
        isPasswordSet: false,
        status: 'active',
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: req.userId
      };

      const agent = await Agent.create(agentData);

      // 6. Send Password Setup Email
      // Fire and forget email (with logging)
      emailService.sendPasswordSetupEmail(agent, setupToken)
        .catch(emailError => {
          logger.error('Failed to send password setup email (Background)', { error: emailError.message, agentId: agent._id });
        });

      // 7. Log audit
      await AuditService.logCreate(req.user, 'Agent', agent._id, {
        agentName: `${firstName} ${lastName}`,
        email: agent.email,
        companyName: agent.companyName
      }, req);

      return ResponseHandler.created(res, 'Agent created successfully. Password setup link sent via email.', { agent });
    } catch (error) {
      if (error.code === 11000) {
        return ResponseHandler.badRequest(res, 'Email already exists');
      }
      logger.error('Create agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to register agent', error);
    }
  }

  /**
   * Update agent
   * PUT /api/agents/:id
   */
  static async updateAgent(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Define allowed fields to update (prevent updating sensitive fields like password, _id, etc.)
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phone', 'alternatePhone', 'designation',
        'experience', 'qualification', 'companyName', 'companyType',
        'registrationNumber', 'establishedYear', 'website', 'address',
        'city', 'state', 'pincode', 'country', 'specialization',
        'servicesOffered', 'currentStudents', 'teamSize', 'annualRevenue',
        'partnershipType', 'expectedStudents', 'marketingBudget',
        'whyPartner', 'references', 'additionalInfo', 'documents',
        'accessibleCountries', 'accessibleUniversities'
      ];

      // Map snake_case fields to camelCase
      const fieldMapping = {
        first_name: 'firstName',
        last_name: 'lastName',
        phone: 'phone',
        alternate_phone: 'alternatePhone',
        designation: 'designation',
        experience: 'experience',
        qualification: 'qualification',
        company_name: 'companyName',
        company_type: 'companyType',
        registration_number: 'registrationNumber',
        established_year: 'establishedYear',
        website: 'website',
        address: 'address',
        city: 'city',
        state: 'state',
        pincode: 'pincode',
        country: 'country',
        specialization: 'specialization',
        services_offered: 'servicesOffered',
        current_students: 'currentStudents',
        team_size: 'teamSize',
        annual_revenue: 'annualRevenue',
        partnership_type: 'partnershipType',
        expected_students: 'expectedStudents',
        marketing_budget: 'marketingBudget',
        why_partner: 'whyPartner',
        references: 'references',
        additional_info: 'additionalInfo',
        documents: 'documents',
        accessible_countries: 'accessibleCountries',
        accessible_universities: 'accessibleUniversities'
      };

      const updates = {};

      // Process each field in request body
      Object.keys(req.body).forEach(key => {
        // If it's a snake_case key, map it to camelCase
        if (fieldMapping[key]) {
          const camelCaseKey = fieldMapping[key];
          if (allowedFields.includes(camelCaseKey) && req.body[key] !== undefined) {
            updates[camelCaseKey] = req.body[key];
          }
        }
        // If it's already camelCase and allowed, use it directly
        else if (allowedFields.includes(key) && req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });

      // Handle password update separately (admin only)
      if (req.body.newPassword && req.body.newPassword.trim()) {
        // Validate password strength
        const { validatePassword } = require('../utils/passwordValidator');
        const validation = validatePassword(req.body.newPassword);

        if (!validation.isValid) {
          return ResponseHandler.badRequest(res, validation.errors.join(', '));
        }

        // Update password (will be hashed by pre-save hook)
        agent.password = req.body.newPassword;
        agent.isPasswordSet = true;
      }

      Object.assign(agent, updates);
      await agent.save();

      // Log audit
      await AuditService.logUpdate(req.user, 'Agent', agent._id, {}, updates, req);

      return ResponseHandler.success(res, 'Agent updated successfully', { agent });
    } catch (error) {
      if (error.code === 11000) {
        return ResponseHandler.badRequest(res, 'Duplicate field value');
      }
      logger.error('Update agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update agent', error);
    }
  }

  /**
   * Delete agent
   * DELETE /api/agents/:id
   */
  static async deleteAgent(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Delete associated physical documents
      try {
        const fs = require('fs');
        const path = require('path');
        const UPLOADS_BASE = 'uploads/documents/agents';
        const uploadsDir = path.join(process.cwd(), UPLOADS_BASE);

        if (fs.existsSync(uploadsDir)) {
          const folders = fs.readdirSync(uploadsDir);
          folders.forEach(folder => {
            // Folder naming convention: name_id_date (e.g. ritik_saini_65c3fd..._2024-02-13)
            if (folder.includes(`_${agent._id.toString()}_`)) {
              const folderPath = path.join(uploadsDir, folder);
              fs.rmSync(folderPath, { recursive: true, force: true });
            }
          });
        }
      } catch (fileError) {
        logger.error('Failed to delete agent documents', { error: fileError.message, agentId: id });
        // Continue with agent deletion even if file deletion fails
      }

      await agent.deleteOne();

      // Log audit
      await AuditService.logDelete(req.user, 'Agent', id, {
        agentName: agent.name || `${agent.firstName} ${agent.lastName}`,
        email: agent.email
      }, req);

      return ResponseHandler.success(res, 'Agent deleted successfully');
    } catch (error) {
      logger.error('Delete agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to delete agent', error);
    }
  }

  /**
   * Approve agent
   * PUT /api/agents/:id/approve
   */
  static async approveAgent(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      if (agent.approvalStatus === 'approved') {
        return ResponseHandler.badRequest(res, 'Agent is already approved');
      }

      // 1. Generate unique agentCode if not already assigned
      if (!agent.agentCode) {
        agent.agentCode = await generateAgentCode();
      }

      // 2. Generate secure password setup token (expires in 24 hours)
      const setupToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(setupToken).digest('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // 3. Update agent status (instant approval)
      agent.approvalStatus = 'approved';
      agent.status = 'active';
      agent.approvedAt = new Date();
      agent.approvedBy = req.user.id;
      agent.approvalReason = notes;
      agent.passwordSetupToken = hashedToken;
      agent.passwordSetupExpires = tokenExpires;
      agent.isPasswordSet = false; // Ensure they must set it

      await agent.save();

      // 3. Log audit
      await AuditService.logApprove(req.user, 'Agent', agent._id, {
        agentName: `${agent.firstName} ${agent.lastName}`,
        approvalReason: notes,
      }, req);

      // 4. Send password setup email in BACKGROUND with RETRY (non-blocking)
      // Using setImmediate to run after response is sent
      setImmediate(async () => {
        const maxRetries = 3;
        let attempt = 0;
        let emailSent = false;

        while (attempt < maxRetries && !emailSent) {
          attempt++;
          try {
            await emailService.sendPasswordSetupEmail(agent, setupToken);
            logger.info('Password setup email sent successfully (Background)', {
              agentId: agent._id,
              email: agent.email,
              attempt
            });
            emailSent = true;
          } catch (emailError) {
            logger.error(`Failed to send password setup email (Background) - Attempt ${attempt}/${maxRetries}`, {
              agentId: agent._id,
              email: agent.email,
              error: emailError.message
            });

            // If not the last attempt, wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
              const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
              logger.info(`Retrying email send in ${waitTime}ms...`, { agentId: agent._id });
              await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
              logger.error('All email send attempts failed. Manual intervention required.', {
                agentId: agent._id,
                email: agent.email
              });
            }
          }
        }
      });

      // 5. Return success immediately (don't wait for email)
      return ResponseHandler.success(res, 'Agent approved successfully. Password setup email will be sent shortly.', { agent });
    } catch (error) {
      logger.error('Approve agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to approve agent', error);
    }
  }

  /**
   * Reject (Decline) agent
   * PUT /api/agents/:id/reject
   */
  static async rejectAgent(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      agent.approvalStatus = 'declined'; // Consistent with 'pending', 'approved', 'declined'
      agent.approvedBy = req.user.id;
      agent.declinedAt = new Date();
      agent.approvalReason = notes;
      agent.status = 'inactive';

      await agent.save();

      // Send rejection/decline email
      try {
        await emailService.sendAgentRejectionEmail(agent, notes);
      } catch (emailError) {
        logger.error('Email notification failed', { error: emailError.message });
      }

      await AuditService.logReject(req.user, 'Agent', agent._id, {
        agentName: `${agent.firstName} ${agent.lastName}`,
        approvalReason: notes,
      }, req);

      return ResponseHandler.success(res, 'Agent application declined', { agent });
    } catch (error) {
      logger.error('Reject agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to decline agent', error);
    }
  }

  /**
   * Toggle agent status
   * PUT /api/agents/:id/toggle-status
   */
  static async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      agent.status = agent.status === 'active' ? 'inactive' : 'active';
      await agent.save();

      await AuditService.logStatusChange(req.user, 'Agent', agent._id,
        agent.status === 'active' ? 'inactive' : 'active',
        agent.status,
        req
      );

      return ResponseHandler.success(res, 'Agent status updated successfully', { agent });
    } catch (error) {
      logger.error('Toggle status error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update status', error);
    }
  }

  /**
   * Get agent dashboard statistics
   * GET /api/agents/dashboard/stats
   */
  static async getDashboardStats(req, res) {
    try {
      const agentId = req.userId;

      // Get student IDs for this agent once
      const studentIds = await Student.find({ agentId }).distinct('_id');

      // 1. Get totals and recent items
      const [totalStudents, totalApplications, recentStudents, recentApplications] = await Promise.all([
        Student.countDocuments({ agentId }),
        Application.countDocuments({ studentId: { $in: studentIds } }),
        Student.find({ agentId }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email studentId status createdAt'),
        Application.find({ studentId: { $in: studentIds } })
          .populate('studentId', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

      // 2. Get applications by stage
      const stageStats = await Application.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        { $group: { _id: '$stage', count: { $sum: 1 } } }
      ]);

      // 3. Get earnings summary (if payout model exists, otherwise mock or use commissions)
      // For now, using the agent's stats field or a placeholder
      const agent = await Agent.findById(agentId).select('stats');

      const dashboardData = {
        stats: {
          totalStudents,
          totalApplications,
          totalEarnings: agent.stats?.lifetimeEarnings || 0,
          pendingApplications: stageStats.find(s => s._id === 'Pre-Payment')?.count || 0,
        },
        recentStudents,
        recentApplications,
        stageBreakdown: stageStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      };

      return ResponseHandler.success(res, 'Dashboard statistics retrieved successfully', dashboardData);
    } catch (error) {
      logger.error('Get Agent Dashboard Stats Error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to fetch dashboard statistics', error);
    }
  }

  /**
   * Get agent statistics
   * GET /api/agents/:id/stats
   */
  static async getAgentStats(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id).select('stats');
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      return ResponseHandler.success(res, 'Agent statistics retrieved', { stats: agent.stats });
    } catch (error) {
      logger.error('Get agent stats error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to get statistics', error);
    }
  }

  /**
   * Get pending agents
   * GET /api/agents/pending
   */
  static async getPendingAgents(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const agents = await Agent.find({ approvalStatus: 'pending' })
        .select('-password')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

      const count = await Agent.countDocuments({ approvalStatus: 'pending' });

      return ResponseHandler.paginated(res, 'Pending agents retrieved successfully', agents, {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
      });
    } catch (error) {
      logger.error('Get pending agents error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to get pending agents', error);
    }
  }

  /**
   * Update bank details
   * PUT /api/agents/:id/bank-details
   */
  static async updateBankDetails(req, res) {
    try {
      const { id } = req.params;
      const { bank_name, account_number, account_holder_name, ifsc_code, branch } = req.body;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Store bank details in documents field
      agent.documents = agent.documents || {};
      agent.documents.bank_details = {
        bankName: bank_name,
        accountNumber: account_number,
        accountHolderName: account_holder_name,
        ifscCode: ifsc_code,
        branch: branch,
      };

      await agent.save();

      return ResponseHandler.success(res, 'Bank details updated successfully', { agent });
    } catch (error) {
      logger.error('Update bank details error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to update bank details', error);
    }
  }
  /**
   * Upload agent document
   * POST /api/agents/:id/documents
   */
  static async uploadDocument(req, res) {
    try {
      const { id } = req.params;
      const { documentName } = req.body;
      const file = req.file;

      if (!file) {
        return ResponseHandler.badRequest(res, 'No file uploaded');
      }

      // Helper to clean up temp file
      const cleanupTemp = () => {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      };

      if (!documentName) {
        cleanupTemp();
        return ResponseHandler.badRequest(res, 'Document name is required');
      }

      const agent = await Agent.findById(id);
      if (!agent) {
        cleanupTemp();
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Use storage service to move file
      const relativePath = moveFileToEntityFolder(file, agent, documentName, 'agents');

      // Update the map
      if (!agent.documents) {
        agent.documents = new Map();
      }
      agent.documents.set(documentName, relativePath);
      agent.markModified('documents');

      await agent.save();

      // Log audit
      await AuditService.logUpdate(req.user, 'Agent', agent._id, { action: 'upload_document', document: documentName }, {}, req);

      return ResponseHandler.success(res, 'Document uploaded successfully', {
        agent,
        documents: agent.documents
      });

    } catch (error) {
      // Cleanup temp file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Failed to delete file after error', e);
        }
      }

      logger.error('Upload document error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to upload document', error);
    }
  }
  /**
   * Delete agent document
   * DELETE /api/agents/:id/documents/:documentName
   */
  static async deleteDocument(req, res) {
    try {
      const { id, documentName } = req.params;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      // Check if document exists
      if (!agent.documents || !agent.documents.get(documentName)) {
        return ResponseHandler.notFound(res, 'Document not found');
      }

      const filePath = agent.documents.get(documentName);

      // Create a promise-based unlink to handle file deletion
      const fs = require('fs');
      const util = require('util');
      const unlink = util.promisify(fs.unlink);

      try {
        // Check if file exists before trying to delete
        if (fs.existsSync(filePath)) {
          await unlink(filePath);
        } else {
          console.warn(`File not found at path: ${filePath}, removing reference from DB anyway.`);
        }
      } catch (err) {
        console.error('Error deleting file properties:', err);
        // Continue to remove from DB even if file delete fails (or maybe it was already gone)
      }

      // Remove from map
      agent.documents.delete(documentName);
      agent.markModified('documents');

      await agent.save();

      // Log audit
      await AuditService.logUpdate(req.user, 'Agent', agent._id, { action: 'delete_document', document: documentName }, {}, req);

      return ResponseHandler.success(res, 'Document deleted successfully', {
        agent,
        documents: agent.documents
      });

    } catch (error) {
      logger.error('Delete document error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to delete document', error);
    }
  }

  /**
   * Upload multiple agent documents
   * POST /api/agents/:id/documents/bulk
   */
  static async uploadBulkDocuments(req, res) {
    const fs = require('fs');

    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || Object.keys(files).length === 0) {
        return ResponseHandler.badRequest(res, 'No files uploaded');
      }

      // Helper to cleanup all temp files
      const cleanupAllTemp = () => {
        Object.values(files).flat().forEach(file => {
          if (file && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (e) { }
          }
        });
      };

      const agent = await Agent.findById(id);
      if (!agent) {
        cleanupAllTemp();
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      const uploadedDocs = {};

      for (const [fieldName, fileArray] of Object.entries(files)) {
        const file = fileArray[0]; // Assuming maxCount 1 per field

        // Use storage service to move file
        // Pass fieldName as documentKey to format filename as 'idProof.pdf' etc.
        const relativePath = moveFileToEntityFolder(file, agent, fieldName, 'agents');

        // Update agent document map
        if (!agent.documents) agent.documents = new Map();
        agent.documents.set(fieldName, relativePath);
        uploadedDocs[fieldName] = relativePath;
      }

      agent.markModified('documents');
      await agent.save();

      // Log audit
      await AuditService.logUpdate(req.user, 'Agent', agent._id, { action: 'bulk_upload_documents', count: Object.keys(uploadedDocs).length }, {}, req);

      return ResponseHandler.success(res, 'Documents uploaded successfully', {
        agent,
        documents: agent.documents
      });

    } catch (error) {
      // Cleanup files on error
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) { }
        });
      }
      logger.error('Bulk upload documents error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to upload documents', error);
    }
  }
}

module.exports = AgentController;
