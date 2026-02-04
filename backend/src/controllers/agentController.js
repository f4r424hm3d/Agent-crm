const { Agent, User } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const AuditService = require('../services/auditService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { AGENT_APPROVAL_STATUS } = require('../utils/constants');
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

      const query = {};
      if (status) {
        query.approvalStatus = status;
      }

      if (search) {
        query.$or = [
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

      return ResponseHandler.paginated(res, 'Agents retrieved successfully', agents, {
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
      // 1. Get data from request
      const {
        firstName, lastName, name, email, phone, company_name, companyName
      } = req.body;

      const finalName = name || `${firstName} ${lastName}`;
      const finalCompanyName = company_name || companyName;

      // 2. Check if email exists
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return ResponseHandler.badRequest(res, 'Email already exists');
      }

      // 3. Generate password setup token
      const { generateToken } = require('../utils/otpGenerator');
      const setupToken = generateToken();

      // 4. Create temporary password (will need to be changed)
      const tempPassword = crypto.randomBytes(16).toString('hex');

      // 5. Save to DB with password setup token
      const agentData = {
        ...req.body,
        // Overrides
        name: finalName,
        company_name: finalCompanyName,
        password: tempPassword, // Temporary password
        isPasswordSet: false,
        passwordSetupToken: setupToken,
        passwordSetupExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        status: 'active',
        approvalStatus: 'approved',
        approvedAt: new Date(),
      };

      const agent = new Agent(agentData);
      await agent.save();

      // 6. Send Password Setup Email
      const tempAgent = {
        firstName: firstName || name?.split(' ')[0] || 'Partner',
        name: finalName,
        email: email,
        companyName: finalCompanyName
      };

      // Fire and forget email (with logging)
      emailService.sendPasswordSetupEmail(tempAgent, setupToken)
        .catch(emailError => {
          logger.error('Failed to send password setup email (Background)', { error: emailError.message, agentId: agent._id });
        });

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
        'firstName', 'lastName', 'phone', 'alternatePhone', 'designation',
        'experience', 'qualification', 'companyName', 'companyType',
        'registrationNumber', 'establishedYear', 'website', 'address',
        'city', 'state', 'pincode', 'country', 'specialization',
        'servicesOffered', 'currentStudents', 'teamSize', 'annualRevenue',
        'partnershipType', 'expectedStudents', 'marketingBudget',
        'whyPartner', 'references', 'additionalInfo', 'documents'
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
        documents: 'documents'
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

      await agent.deleteOne();

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
      const { approval_notes } = req.body;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      if (agent.approvalStatus === 'approved') {
        return ResponseHandler.badRequest(res, 'Agent is already approved');
      }

      // 1. Generate new random password
      const plainPassword = crypto.randomBytes(8).toString('hex');

      // 2. Send Email FIRST
      try {
        await emailService.sendWelcomeWithCredentials(agent, plainPassword);
      } catch (emailError) {
        logger.error('Failed to send approval email', { error: emailError.message });
        return ResponseHandler.serverError(res, 'Failed to send approval email. Agent not approved.', emailError);
      }

      // 3. Hash Password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 4. Update DB
      agent.approvalStatus = 'approved';
      agent.status = 'active';
      agent.approvedAt = new Date();
      agent.approvedBy = req.user.id; // Changed from req.userId to req.user.id as per instruction
      agent.approvalNotes = approval_notes;
      agent.password = hashedPassword; // Update with HASHED password

      await agent.save();

      await AuditService.logApprove(req.user, 'Agent', agent._id, {
        agentName: `${agent.firstName} ${agent.lastName}`,
        approvalNotes: approval_notes,
      }, req);

      return ResponseHandler.success(res, 'Agent approved and credentials sent successfully', { agent });
    } catch (error) {
      logger.error('Approve agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to approve agent', error);
    }
  }

  /**
   * Reject agent
   * PUT /api/agents/:id/reject
   */
  static async rejectAgent(req, res) {
    try {
      const { id } = req.params;
      const { approval_notes } = req.body;

      const agent = await Agent.findById(id);
      if (!agent) {
        return ResponseHandler.notFound(res, 'Agent not found');
      }

      agent.approvalStatus = 'rejected';
      agent.approvedBy = req.userId;
      agent.rejectedAt = new Date();
      agent.approvalNotes = approval_notes;
      agent.status = 'inactive';

      await agent.save();

      // Send rejection email
      try {
        await emailService.sendAgentRejectionEmail(agent, approval_notes);
      } catch (emailError) {
        logger.error('Email notification failed', { error: emailError.message });
      }

      await AuditService.logReject(req.user, 'Agent', agent._id, {
        agentName: `${agent.firstName} ${agent.lastName}`,
        approvalNotes: approval_notes,
      }, req);

      return ResponseHandler.success(res, 'Agent rejected', { agent });
    } catch (error) {
      logger.error('Reject agent error', { error: error.message });
      return ResponseHandler.serverError(res, 'Failed to reject agent', error);
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
}

module.exports = AgentController;
