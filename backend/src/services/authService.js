const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

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
    const { first_name, last_name, email, password, role, contact_no } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Check if contact number already exists
    const existingContact = await User.findOne({ contact_no });
    if (existingContact) {
      throw new AppError('Contact number already registered', 409);
    }

    // Create new user (auto-generated user_id )
    const user = new User({
      first_name,
      last_name,
      email,
      password,
      role: role || 'team_member',
      contact_no
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user,
      token
    };
  }

  // Login user
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
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
}

module.exports = new AuthService();