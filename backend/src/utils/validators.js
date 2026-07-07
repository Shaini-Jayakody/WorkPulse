const { body, validationResult } = require('express-validator');

// Validation rules for registration
const validateRegister = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens'),
  
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter'),
  
  body('role')
    .optional()
    .isIn(['team_member', 'manager', 'admin'])
    .withMessage('Invalid role specified'),
  
  body('contact_no')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^\+?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid contact number (10-15 digits)')
];

// Validation rules for login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for change password
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
];

// Validation rules for reset password 
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
];

// Validation rules for update user profile
const validateUpdateProfile = [
  body('first_name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens'),
  
  body('last_name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens'),
  
  body('contact_no')
    .optional()
    .matches(/^\+?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid contact number (10-15 digits)')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validatePasswordReset,
  validateUpdateProfile,
  validate
};