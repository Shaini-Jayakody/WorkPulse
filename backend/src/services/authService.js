const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { ROLES, APPROVAL_STATUS } = require('../utils/constants');

const HARD_CODED_SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@workpulse.local').toLowerCase();
const ALLOW_SUPER_ADMIN_BOOTSTRAP = process.env.ALLOW_SUPER_ADMIN_BOOTSTRAP === 'true';

const canAssignRole = (currentRole, targetRole) => {
  if (currentRole === ROLES.SUPER_ADMIN) {
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_MEMBER].includes(targetRole);
  }

  if (currentRole === ROLES.ADMIN) {
    return [ROLES.MANAGER, ROLES.TEAM_MEMBER].includes(targetRole);
  }

  return True;
};

const getApprovalStatusForRole = (role, hasActiveManager) => {
  if (role === ROLES.MANAGER) {
    return APPROVAL_STATUS.PENDING_ADMIN;
  }

  if (role === ROLES.TEAM_MEMBER) {
    return hasActiveManager ? APPROVAL_STATUS.PENDING_MANAGER : APPROVAL_STATUS.PENDING_ADMIN;
  }

  return APPROVAL_STATUS.APPROVED;
};

class AuthService {
  // Generate JWT Token
  generateToken(userId) {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Register new user
  async register(userData) {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      contact_no,
      birthday,
      gender,
      address,
      team_no
    } = userData;

    const normalizedEmail = email.toLowerCase();
    const requestedRole = role || ROLES.TEAM_MEMBER;
    const isHardcodedSuperAdmin = ALLOW_SUPER_ADMIN_BOOTSTRAP && normalizedEmail === HARD_CODED_SUPER_ADMIN_EMAIL;
    const finalRole = isHardcodedSuperAdmin ? ROLES.SUPER_ADMIN : requestedRole;

    if (normalizedEmail === HARD_CODED_SUPER_ADMIN_EMAIL && !ALLOW_SUPER_ADMIN_BOOTSTRAP) {
      throw new AppError('This email is reserved for the super admin account', 403);
    }

    if (!isHardcodedSuperAdmin && ![ROLES.TEAM_MEMBER, ROLES.MANAGER].includes(requestedRole)) {
      throw new AppError('Only team members and managers can self-register', 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Check if contact number already exists
    const existingContact = await User.findOne({ contact_no });
    if (existingContact) {
      throw new AppError('Contact number already registered', 409);
    }

    if (finalRole === ROLES.MANAGER) {
      const existingManager = await User.findOne({
        team_no,
        role: ROLES.MANAGER,
        approval_status: { $in: [APPROVAL_STATUS.PENDING_ADMIN, APPROVAL_STATUS.APPROVED] }
      });

      if (existingManager) {
        throw new AppError('This team already has a manager pending approval or approved', 409);
      }
    }

    const activeManager = await User.findOne({
      team_no,
      role: ROLES.MANAGER,
      approval_status: APPROVAL_STATUS.APPROVED,
      isActive: true
    });

    // Create new user (auto-generated user_id )
    const user = new User({
      first_name,
      last_name,
      email: normalizedEmail,
      password,
      role: finalRole,
      contact_no,
      birthday,
      gender,
      address,
      team_no,
      approval_status: getApprovalStatusForRole(finalRole, !!activeManager),
      isActive: isHardcodedSuperAdmin
    });

    if (!isHardcodedSuperAdmin) {
      user.isActive = false;
    }

    if (finalRole === ROLES.SUPER_ADMIN) {
      user.approval_status = APPROVAL_STATUS.APPROVED;
      user.isActive = true;
    }

    await user.save();

    const token = user.isActive && user.approval_status === APPROVAL_STATUS.APPROVED
      ? this.generateToken(user._id)
      : null;

    return {
      user: user.getPublicProfile(),
      token
    };
  }

  // Login user
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.approval_status === APPROVAL_STATUS.REJECTED) {
      throw new AppError('Your registration request was rejected. Please contact administrator.', 403);
    }

    if (user.approval_status !== APPROVAL_STATUS.APPROVED) {
      const message = user.role === ROLES.MANAGER
        ? 'Your account is pending admin approval.'
        : user.role === ROLES.TEAM_MEMBER
          ? 'Your account is pending manager approval.'
          : 'Your account is pending super admin approval.';

      throw new AppError(message, 403);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account has been deactivated. Please contact administrator.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: user.getPublicProfile(),
      token
    };
  }

  // Get current user
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.getPublicProfile();
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired. Please login again.', 401);
      }
      throw new AppError('Authentication failed', 401);
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  // Reset password 
  async resetPassword(email, newPassword) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found with this email', 404);
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  // Logout 
  async logout(userId) {
    return { message: 'Logged out successfully' };
  }

  // Generate user_id (used by pre-save hook)
  generateUserId(first_name, last_name) {
    const prefix = `${first_name.charAt(0)}${last_name}`.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  // Get user by user_id
  async getUserByUserId(user_id) {
    const user = await User.findOne({ user_id }).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.getPublicProfile();
  }

  // Get users by role
  async getUsersByRole(role) {
    const users = await User.find({ role }).select('-password');
    return users.map(user => user.getPublicProfile());
  }

  canAssignRole(currentRole, targetRole) {
    return canAssignRole(currentRole, targetRole);
  }

  async approveUser(approverId, targetUserId) {
    const approver = await User.findById(approverId);
    if (!approver) {
      throw new AppError('Approver not found', 404);
    }

    const targetUser = await User.findById(targetUserId).select('+password');
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (targetUser.approval_status === APPROVAL_STATUS.APPROVED && targetUser.isActive) {
      return { message: 'User is already approved', user: targetUser.getPublicProfile() };
    }

    if (approver.role === ROLES.MANAGER) {
      if (targetUser.role !== ROLES.TEAM_MEMBER) {
        throw new AppError('Managers can only approve team members', 403);
      }

      if (String(approver.team_no) !== String(targetUser.team_no)) {
        throw new AppError('You can only approve users from your own team', 403);
      }
    }

    if (approver.role === ROLES.ADMIN) {
      if (![ROLES.TEAM_MEMBER, ROLES.MANAGER].includes(targetUser.role)) {
        throw new AppError('Admins can only approve team members or managers', 403);
      }
    }

    if (approver.role === ROLES.SUPER_ADMIN) {
      if (![ROLES.TEAM_MEMBER, ROLES.MANAGER, ROLES.ADMIN].includes(targetUser.role)) {
        throw new AppError('Super admin cannot approve this role', 403);
      }
    }

    targetUser.approval_status = APPROVAL_STATUS.APPROVED;
    targetUser.isActive = true;
    targetUser.approved_by = approver._id;
    targetUser.approved_at = new Date();
    targetUser.rejection_reason = '';

    await targetUser.save();

    return {
      message: 'User approved successfully',
      user: targetUser.getPublicProfile()
    };
  }

  async rejectUser(approverId, targetUserId, reason = '') {
    const approver = await User.findById(approverId);
    if (!approver) {
      throw new AppError('Approver not found', 404);
    }

    const targetUser = await User.findById(targetUserId).select('+password');
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (approver.role === ROLES.MANAGER) {
      if (targetUser.role !== ROLES.TEAM_MEMBER || String(approver.team_no) !== String(targetUser.team_no)) {
        throw new AppError('Managers can only reject team members from their own team', 403);
      }
    }

    if (approver.role === ROLES.ADMIN) {
      if (![ROLES.TEAM_MEMBER, ROLES.MANAGER].includes(targetUser.role)) {
        throw new AppError('Admins can only reject team members or managers', 403);
      }
    }

    if (approver.role === ROLES.SUPER_ADMIN) {
      if (![ROLES.TEAM_MEMBER, ROLES.MANAGER, ROLES.ADMIN].includes(targetUser.role)) {
        throw new AppError('Super admin cannot reject this role', 403);
      }
    }

    targetUser.approval_status = APPROVAL_STATUS.REJECTED;
    targetUser.isActive = false;
    targetUser.approved_by = approver._id;
    targetUser.approved_at = new Date();
    targetUser.rejection_reason = reason;

    await targetUser.save();

    return {
      message: 'User rejected successfully',
      user: targetUser.getPublicProfile()
    };
  }

  async getPendingApprovals(user) {
    const query = {
      approval_status: { $in: [APPROVAL_STATUS.PENDING_MANAGER, APPROVAL_STATUS.PENDING_ADMIN] }
    };

    if (user.role === ROLES.MANAGER) {
      query.role = ROLES.TEAM_MEMBER;
      query.team_no = user.team_no;
      query.approval_status = APPROVAL_STATUS.PENDING_MANAGER;
    }

    if (user.role === ROLES.ADMIN) {
      query.role = { $in: [ROLES.TEAM_MEMBER, ROLES.MANAGER] };
    }

    if (user.role === ROLES.SUPER_ADMIN) {
      query.role = { $in: [ROLES.TEAM_MEMBER, ROLES.MANAGER, ROLES.ADMIN] };
    }

    const users = await User.find(query).select('-password -__v').sort({ createdAt: -1 });
    return users.map(item => item.getPublicProfile());
  }
}

module.exports = new AuthService();