const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/auth');
const { hasRole, hasMinimumRole } = require('../middleware/roleCheck');
const uploadProfileImage = require('../middleware/uploadProfileImage');
const { 
  validateRegister, 
  validateLogin, 
  validatePasswordChange,
  validateUpdateProfile,
  validate 
} = require('../utils/validators');

// Public routes
router.post('/register', uploadProfileImage, validateRegister, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);

// Protected routes (require authentication)
router.use(protect);

// Profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', uploadProfileImage, validateUpdateProfile, validate, authController.updateProfile);
router.post('/logout', authController.logout);
router.put('/change-password', validatePasswordChange, validate, authController.changePassword);

// Admin/Manager only routes
router.get('/users', hasMinimumRole('manager'), authController.getAllUsers);
router.get('/users/search', hasMinimumRole('manager'), authController.searchUsers);
router.get('/users/:id', hasMinimumRole('manager'), authController.getUserById);
router.put('/users/role', hasRole('admin'), authController.updateUserRole);
router.put('/users/:userId/deactivate', hasMinimumRole('manager'), authController.deactivateUser);
router.put('/users/:userId/activate', hasMinimumRole('manager'), authController.activateUser);

module.exports = router;