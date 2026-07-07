const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const { validateProject, validate } = require('../utils/validators');

// All project routes require authentication
router.use(protect);

// Project CRUD routes
router.post(
  '/',
  hasMinimumRole('manager'),
  validateProject,
  validate,
  projectController.createProject
);

router.get('/', projectController.getProjects);
router.get('/stats', hasMinimumRole('manager'), projectController.getProjectStats);
router.get('/user', projectController.getUserProjects);
router.get('/category/:category', projectController.getProjectsByCategory);
router.get('/:id', projectController.getProjectById);
router.get('/project-id/:project_id', projectController.getProjectByProjectId);

router.put(
  '/:id',
  hasMinimumRole('manager'),
  validateProject,
  validate,
  projectController.updateProject
);

router.put(
  '/:id/assign',
  hasMinimumRole('manager'),
  projectController.assignUsers
);

router.put(
  '/:id/remove',
  hasMinimumRole('manager'),
  projectController.removeUsers
);

router.put(
  '/:id/archive',
  hasMinimumRole('manager'),
  projectController.archiveProject
);

router.put(
  '/:id/restore',
  hasMinimumRole('manager'),
  projectController.restoreProject
);

router.delete(
  '/:id',
  hasMinimumRole('manager'),
  projectController.deleteProject
);

module.exports = router;