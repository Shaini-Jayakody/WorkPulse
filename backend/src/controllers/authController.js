const AuthService = require('../services/authService');
const { AppError } = require('../utils/errorHandler');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

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
        contact_no 
      } = req.body;
      
      const result = await AuthService.register({
        first_name,
        last_name,
        email,
        password,
        role: role || 'team_member',
        contact_no
      });

      const user = result.user;

      if (req.file) {
        const uploadResult = await uploadProfilePictureToCloudinary(req.file.buffer, user._id);

        user.profile_picture_url = uploadResult.secure_url;
        user.profile_picture_public_id = uploadResult.public_id;

        await user.save();
        result.user = user.getPublicProfile();
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
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
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update only provided fields
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (contact_no) user.contact_no = contact_no;

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

      if (!userId || !role) {
        throw new AppError('User ID and role are required', 400);
      }

      if (!['team_member', 'manager', 'admin'].includes(role)) {
        throw new AppError('Invalid role specified', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.role = role;
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
}

module.exports = new AuthController();