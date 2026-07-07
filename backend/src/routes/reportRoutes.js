const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const { 
  validateReport, 
  validateReportFilters, 
  validateReportId,
  validateWeekYear,
  validate 
} = require('../utils/validators');

// All report routes require authentication
router.use(protect);

// Report CRUD routes with validations
router.post(
  '/', 
  validateReport, 
  validate, 
  reportController.createReport
);

router.get(
  '/',
  validateReportFilters,
  validate,
  reportController.getUserReports
);

router.get('/stats', reportController.getUserReportStats);
router.get('/recent', reportController.getRecentReports);

router.get(
  '/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  reportController.getReportByWeek
);

router.get(
  '/:id',
  validateReportId,
  validate,
  reportController.getReportById
);

router.get(
  '/report-id/:report_id',
  reportController.getReportByReportId
);

router.put(
  '/:id',
  validateReportId,
  validateReport,
  validate,
  reportController.updateReport
);

router.put(
  '/:id/submit',
  validateReportId,
  validate,
  reportController.submitReport
);

router.delete(
  '/:id',
  validateReportId,
  validate,
  reportController.deleteReport
);

module.exports = router;