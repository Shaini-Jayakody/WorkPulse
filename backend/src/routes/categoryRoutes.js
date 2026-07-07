const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const { validateCategory, validate } = require('../utils/validators');

// All category routes require authentication
router.use(protect);

// Category CRUD routes
router.post(
  '/',
  hasMinimumRole('manager'),
  validateCategory,
  validate,
  categoryController.createCategory
);

router.get('/', categoryController.getCategories);
router.get('/stats', hasMinimumRole('manager'), categoryController.getCategoryStats);
router.get('/:id', categoryController.getCategoryById);

router.put(
  '/:id',
  hasMinimumRole('manager'),
  validateCategory,
  validate,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  hasMinimumRole('manager'),
  categoryController.deleteCategory
);

module.exports = router;