const { body, validationResult, param, query } = require('express-validator');

const MINIMUM_AGE = 18;

const calculateAge = (value) => {
  const birthDate = new Date(value);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

//uservalidation
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

  body('birthday')
    .notEmpty()
    .withMessage('Birthday is required')
    .isISO8601()
    .withMessage('Birthday must be a valid date')
    .custom((value) => {
      const age = calculateAge(value);
      if (age === null) {
        throw new Error('Birthday must be a valid date');
      }
      if (age < MINIMUM_AGE) {
        throw new Error('User must be at least 18 years old');
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selected'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 250 })
    .withMessage('Address must be between 5 and 250 characters'),

  body('team_no')
    .notEmpty()
    .withMessage('Team number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Team number must be between 1 and 50 characters'),
  
  body('role')
    .optional()
    .isIn(['team_member', 'manager','admin','super_admin'])
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
  .normalizeEmail()
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .withMessage('Please provide a valid email'),

    body('role')
    .optional()
    .isIn(['team_member', 'manager','admin','super_admin'])
    .withMessage('Invalid role specified'),
  
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
  ,

  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('Birthday must be a valid date')
    .custom((value) => {
      const age = calculateAge(value);
      if (age === null) {
        throw new Error('Birthday must be a valid date');
      }
      if (age < MINIMUM_AGE) {
        throw new Error('User must be at least 18 years old');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selected'),

  body('address')
    .optional()
    .isLength({ min: 5, max: 250 })
    .withMessage('Address must be between 5 and 250 characters'),

  body('team_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Team number must be between 1 and 50 characters')
];


//report validation
// Validation rules for create/update a report
const validateReport = [
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        throw new Error('Start date cannot be in the future');
      }
      return true;
    }),
  
  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date in ISO8601 format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const start = new Date(req.body.start_date);
      const end = new Date(value);
      if (start > end) {
        throw new Error('End date must be after start date');
      }
      // Check if date range is within 7 days (one week)
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        throw new Error('Date range cannot exceed 7 days (one week)');
      }
      return true;
    }),
  
  body('project')
    .notEmpty()
    .withMessage('Project is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/)
    .withMessage('Project name contains invalid characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/)
    .withMessage('Category name contains invalid characters'),
  
  body('tasks_completed')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Tasks completed must be an array with at least one task')
    .custom((value) => {
      if (value && value.length > 0) {
        const invalidItems = value.filter(item => typeof item !== 'string' || item.trim().length === 0);
        if (invalidItems.length > 0) {
          throw new Error('Each task must be a non-empty string');
        }
        if (value.some(item => item.length > 500)) {
          throw new Error('Each task cannot exceed 500 characters');
        }
      }
      return true;
    }),
  
  body('tasks_planned')
    .optional()
    .isArray()
    .withMessage('Tasks planned must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const invalidItems = value.filter(item => typeof item !== 'string' || item.trim().length === 0);
        if (invalidItems.length > 0) {
          throw new Error('Each planned task must be a non-empty string');
        }
        if (value.some(item => item.length > 500)) {
          throw new Error('Each planned task cannot exceed 500 characters');
        }
      }
      return true;
    }),
  
  body('blockers')
    .optional()
    .isArray()
    .withMessage('Blockers must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const invalidItems = value.filter(item => typeof item !== 'string' || item.trim().length === 0);
        if (invalidItems.length > 0) {
          throw new Error('Each blocker must be a non-empty string');
        }
        if (value.some(item => item.length > 500)) {
          throw new Error('Each blocker cannot exceed 500 characters');
        }
      }
      return true;
    }),
  
  body('worked_hours')
    .optional()
    .isFloat({ min: 0, max: 168 })
    .withMessage('Worked hours must be a number between 0 and 168')
    .custom((value) => {
      if (value && !Number.isFinite(value)) {
        throw new Error('Worked hours must be a valid number');
      }
      return true;
    }),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
    .customSanitizer(value => value ? value.trim() : ''),
  
  body('links')
    .optional()
    .isArray()
    .withMessage('Links must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        const invalidLinks = value.filter(link => !urlRegex.test(link));
        if (invalidLinks.length > 0) {
          throw new Error(`Invalid URL(s): ${invalidLinks.join(', ')}`);
        }
        if (value.some(link => link.length > 2048)) {
          throw new Error('Each link cannot exceed 2048 characters');
        }
      }
      return true;
    })
];

// Validation rules for report query filters
const validateReportFilters = [
  query('status')
    .optional()
    .isIn(['draft', 'submitted', 'late'])
    .withMessage('Invalid status filter. Must be: draft, submitted, or late'),
  
  query('project')
    .optional()
    .isString()
    .withMessage('Project must be a string')
    .isLength({ max: 100 })
    .withMessage('Project filter cannot exceed 100 characters'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ max: 50 })
    .withMessage('Category filter cannot exceed 50 characters'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO8601 format'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in ISO8601 format')
    .custom((value, { req }) => {
      if (req.query.start_date && value) {
        const start = new Date(req.query.start_date);
        const end = new Date(value);
        if (start > end) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
];

// Validation rules for report_id
const validateReportId = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Invalid report ID format'),
  
  param('report_id')
    .optional()
    .isString()
    .withMessage('Report ID must be a string')
    .isLength({ min: 10, max: 20 })
    .withMessage('Report ID must be between 10 and 20 characters')
];

// Validation rules for week and year 
const validateWeekYear = [
  param('weekNumber')
    .notEmpty()
    .withMessage('Week number is required')
    .isInt({ min: 1, max: 53 })
    .withMessage('Week number must be between 1 and 53'),
  
  param('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
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

// Middleware to handle validation errors
const asyncValidate = (validationRules) => {
  return async (req, res, next) => {
    await Promise.all(validationRules.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  };
};


//validation for dashboard
// Validation rules for dashboard filters
const validateDashboardFilters = [
  query('user_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  query('project')
    .optional()
    .isString()
    .withMessage('Project must be a string')
    .isLength({ max: 100 })
    .withMessage('Project filter cannot exceed 100 characters'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ max: 50 })
    .withMessage('Category filter cannot exceed 50 characters')
];

// Validation rules for date range
const validateDateRange = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const start = new Date(req.query.startDate);
      const end = new Date(value);
      if (start > end) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];


//validation for project
const validateProject = [
  body('project_name')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/)
    .withMessage('Project name contains invalid characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('assigned_users')
    .optional()
    .isArray()
    .withMessage('Assigned users must be an array')
    .custom((value) => {
      if (value) {
        const invalidIds = value.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
        if (invalidIds.length > 0) {
          throw new Error('Invalid user ID format');
        }
      }
      return true;
    }),
  
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.start_date && value) {
        const start = new Date(req.body.start_date);
        const end = new Date(value);
        if (start > end) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'archived'])
    .withMessage('Status must be planning, active, on_hold, completed, or archived'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value && value.some(tag => tag.length > 30)) {
        throw new Error('Tags cannot exceed 30 characters');
      }
      return true;
    })
];


//validation for category
const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/)
    .withMessage('Category name contains invalid characters'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9a-fA-F]{6}$/)
    .withMessage('Please provide a valid hex color code (e.g., #6B7280)'),
  
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string')
    .isLength({ max: 5 })
    .withMessage('Icon cannot exceed 5 characters')
];

//exports
module.exports = {
  // Auth validations
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validatePasswordReset,
  validateUpdateProfile,
  
  // Report validations
  validateReport,
  validateReportFilters,
  validateReportId,
  validateWeekYear,

  // Dashboard validations
   validateDashboardFilters,
   validateDateRange,

   // Project and category validations
   validateProject,
   validateCategory,
  
  // Common middleware
  validate,
  asyncValidate
};