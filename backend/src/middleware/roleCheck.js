const { AppError } = require('../utils/errorHandler');
const { ROLE_HIERARCHY } = require('../utils/constants');

// Check if user has required role
const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const userRole = req.user.role;
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      throw new AppError(`Role '${userRole}' is not authorized for this action`, 403);
    }
  };
};

// Check if user has permission
const hasMinimumRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userRoleLevel >= requiredLevel) {
      next();
    } else {
      throw new AppError(`Insufficient permissions. Required: ${requiredRole}`, 403);
    }
  };
};

// Check if user is accessing allowed resource (own resource/has required role)
const isOwnResourceOrAuthorized = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const userId = req.user._id.toString();
    const resourceId = resourceUserId.toString();

    // Allow if own resource
    if (userId === resourceId) {
      return next();
    }

    // Allow if admin or manager
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    throw new AppError('Not authorized to access this resource', 403);
  };
};

module.exports = {
  hasRole,
  hasMinimumRole,
  isOwnResourceOrAuthorized
};