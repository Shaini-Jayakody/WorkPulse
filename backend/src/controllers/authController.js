const AuthService = require('../services/authService');
const { AppError } = require('../utils/errorHandler');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { ROLES } = require('../utils/constants');
const { APPROVAL_STATUS } = require('../utils/constants');

// Upload profile picture to Cloudinary
const uploadProfilePictureToCloudinary = (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'workpulse/profile-pictures',
        public_id: `user_${userId}_profile`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from([fileBuffer]).pipe(uploadStream);
  });
};

const buildCredentialsMailtoUrl = ({ to, name, password, role, teamNo, createdBy }) => {
  const senderName = [createdBy?.first_name, createdBy?.last_name].filter(Boolean).join(' ') || 'WorkPulse Super Admin';
  const subject = 'Your WorkPulse account has been created';
  const body = [
    `Hello ${name},`,
    '',
    `Your WorkPulse account has been created by ${senderName}.`,
    '',
    `Email: ${to}`,
    `Password: ${password}`,
    `Role: ${role}`,
    `Team No: ${teamNo || '-'}`,
    '',
    'Please log in and change your password after your first sign in.',
  ].join('\n');

  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
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
      } = req.body;
      
      const result = await AuthService.register({
        first_name,
        last_name,
        email,
        password,
        role: role || 'team_member',
        contact_no,
        birthday,
        gender,
        address,
        team_no
      });

      const user = await User.findById(result.user._id);

      if (req.file) {
        const uploadResult = await uploadProfilePictureToCloudinary(req.file.buffer, user._id);

        user.profile_picture_url = uploadResult.secure_url;
        user.profile_picture_public_id = uploadResult.public_id;

        await user.save();
        result.user = user.getPublicProfile();
      }

      res.status(201).json({
        success: true,
        message: user.approval_status === 'approved'
          ? 'User registered successfully'
          : 'Registration submitted successfully and is pending approval',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Create user by admin/super admin
  async createUser(req, res, next) {
    try {
      const creator = req.user;
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
      } = req.body;

      if (!['admin', 'super_admin'].includes(creator.role)) {
        throw new AppError('Only admins and super admins can create users', 403);
      }

      if (role === ROLES.ADMIN && creator.role !== ROLES.SUPER_ADMIN) {
        throw new AppError('Only super admins can create admin accounts', 403);
      }

      if (!['team_member', 'manager', 'admin'].includes(role)) {
        throw new AppError('Invalid role specified', 400);
      }

      const normalizedEmail = email.toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      const existingContact = await User.findOne({ contact_no });
      if (existingContact) {
        throw new AppError('Contact number already registered', 409);
      }

      const user = new User({
        first_name,
        last_name,
        email: normalizedEmail,
        password,
        role,
        contact_no,
        birthday,
        gender,
        address,
        team_no,
        approval_status: APPROVAL_STATUS.APPROVED,
        isActive: true,
        approved_by: creator._id,
        approved_at: new Date(),
        rejection_reason: '',
      });

      await user.save();

      const mailtoUrl = buildCredentialsMailtoUrl({
        to: normalizedEmail,
        name: `${first_name} ${last_name}`,
        password,
        role,
        teamNo: team_no,
        createdBy: creator,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully. Your mail client has been prepared with the credentials draft.',
        data: { user: user.getPublicProfile(), mailtoUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile
  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user._id);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const { first_name, last_name, contact_no } = req.body;
      const { birthday, gender, address, team_no } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update only provided fields
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (contact_no) user.contact_no = contact_no;
      if (birthday) user.birthday = birthday;
      if (gender) user.gender = gender;
      if (address) user.address = address;
      if (team_no) user.team_no = team_no;

      if (req.file) {
        const uploadResult = await uploadProfilePictureToCloudinary(req.file.buffer, userId);

        user.profile_picture_url = uploadResult.secure_url;
        user.profile_picture_public_id = uploadResult.public_id;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const result = await AuthService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const result = await AuthService.logout(req.user._id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin/manager only)
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find()
        .select('-password -__v')
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID (admin/manager only)
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id).select('-password -__v');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role (admin only)
  async updateUserRole(req, res, next) {
    try {
      const { userId, role } = req.body;
      const currentUser = req.user;

      if (!userId || !role) {
        throw new AppError('User ID and role are required', 400);
      }

      if (!AuthService.canAssignRole(currentUser.role, role)) {
        throw new AppError('You are not allowed to assign this role', 403);
      }

      if (!['team_member', 'manager', 'admin'].includes(role)) {
        throw new AppError('Invalid role specified', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (role === ROLES.MANAGER) {
        const teamNo = req.body.team_no || user.team_no;
        const existingManager = await User.findOne({
          _id: { $ne: user._id },
          team_no: teamNo,
          role: ROLES.MANAGER,
          approval_status: { $in: ['pending_admin_approval', 'approved'] }
        });

        if (existingManager) {
          throw new AppError('This team already has a manager pending approval or approved', 409);
        }

        user.team_no = teamNo;
      }

      if (role === ROLES.ADMIN) {
        user.approval_status = 'pending_super_admin_approval';
        user.isActive = false;
        user.approved_by = null;
        user.approved_at = null;
        user.rejection_reason = '';
        user.role = role;
        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Admin registration submitted for super admin approval',
          data: { user: user.getPublicProfile() }
        });
      }

      user.role = role;
      user.approval_status = 'approved';
      user.isActive = true;
      user.approved_by = currentUser._id;
      user.approved_at = new Date();
      user.rejection_reason = '';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Deactivate user (admin/manager only)
  async deactivateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.isActive = false;
      user.approval_status = 'deactivated';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Activate user (admin/manager only)
  async activateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.isActive = true;
      user.approval_status = 'approved';
      user.approved_by = req.user._id;
      user.approved_at = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin/super admin only)
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (req.user._id.toString() === userId) {
        throw new AppError('You cannot delete your own account', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === ROLES.SUPER_ADMIN) {
        throw new AppError('Super admin accounts cannot be deleted', 403);
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Search users (admin/manager only)
  async searchUsers(req, res, next) {
    try {
      const { query, role } = req.query;
      
      let searchCriteria = {};
      
      if (query) {
        searchCriteria.$or = [
          { first_name: { $regex: query, $options: 'i' } },
          { last_name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { user_id: { $regex: query, $options: 'i' } }
        ];
      }

      if (role) {
        searchCriteria.role = role;
      }

      const users = await User.find(searchCriteria)
        .select('-password -__v')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: users.length,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  async approveUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await AuthService.approveUser(req.user._id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const result = await AuthService.rejectUser(req.user._id, userId, reason);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req, res, next) {
    try {
      const users = await AuthService.getPendingApprovals(req.user);

      res.status(200).json({
        success: true,
        count: users.length,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();