const { AuditLog } = require('../models');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Log audit event
   */
  static async log(data) {
    try {
      const auditLog = await AuditLog.create({
        userId: data.userId || null,
        userName: data.userName || null,
        userRole: data.userRole || null,
        agentId: data.agentId || null,
        agentName: data.agentName || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        description: data.description || null,
      });

      logger.info('Audit log created', {
        auditId: auditLog._id,
        userId: data.userId,
        agentId: data.agentId,
        action: data.action,
        entityType: data.entityType,
      });

      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log', { error: error.message, data });
      // Don't throw - audit logging should never break the main flow
    }
  }

  /**
   * Log user login (Admin/Agent)
   */
  static async logLogin(user, req, userType = 'User') {
    const data = {
      action: 'LOGIN',
      entityType: userType,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (userType === 'Agent') {
      data.agentId = user._id || user.id;
      data.agentName = user.name || `${user.firstName} ${user.lastName}`;
      data.userRole = 'AGENT';
    } else {
      data.userId = user._id || user.id;
      data.userName = user.name;
      data.userRole = user.role;
    }
    data.entityId = user._id || user.id;

    return this.log(data);
  }

  /**
   * Log user logout
   */
  static async logLogout(user, req, userType = 'User') {
    const data = {
      action: 'LOGOUT',
      entityType: userType,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (userType === 'Agent') {
      data.agentId = user._id || user.id;
      data.agentName = user.name || `${user.firstName} ${user.lastName}`;
      data.userRole = 'AGENT';
    } else {
      data.userId = user._id || user.id;
      data.userName = user.name;
      data.userRole = user.role;
    }
    data.entityId = user._id || user.id;

    return this.log(data);
  }

  /**
   * Log create action
   */
  static async logCreate(user, entityType, entityId, newValues, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log update action
   */
  static async logUpdate(user, entityType, entityId, oldValues, newValues, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log delete action
   */
  static async logDelete(user, entityType, entityId, oldValues, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log approval action
   */
  static async logApprove(user, entityType, entityId, details, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'APPROVE',
      entityType,
      entityId,
      newValues: details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log rejection action
   */
  static async logReject(user, entityType, entityId, details, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'REJECT',
      entityType,
      entityId,
      newValues: details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log status change
   */
  static async logStatusChange(user, entityType, entityId, oldStatus, newStatus, req) {
    return this.log({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'STATUS_CHANGE',
      entityType,
      entityId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}

module.exports = AuditService;
