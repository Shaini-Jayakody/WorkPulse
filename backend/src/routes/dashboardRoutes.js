const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const { 
  validateDashboardFilters,
  validateWeekYear,
  validateDateRange,
  validate 
} = require('../utils/validators');

// All dashboard routes require authentication (manager role)
router.use(protect);
router.use(hasMinimumRole('manager'));


// Overview and summary
router.get('/overview', dashboardController.getManagerOverview);

// Team reports by week
router.get(
  '/reports/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  dashboardController.getTeamReportsByWeek
);

// Submission status
router.get(
  '/submission/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  dashboardController.getTeamSubmissionStatus
);

// Dashboard summary
router.get(
  '/summary/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  dashboardController.getTeamDashboardSummary
);

// Team trends
router.get(
  '/trends',
  dashboardController.getTeamTrends
);

// Team member history
router.get(
  '/member/:userId/history',
  dashboardController.getTeamMemberHistory
);

// Submission by date range
router.get(
  '/submission/date-range',
  validateDateRange,
  validate,
  dashboardController.getSubmissionStatusByDateRange
);

// Projects and categories
router.get('/projects-categories', dashboardController.getTeamProjectsAndCategories);

// Recent activity
router.get('/recent-activity', dashboardController.getRecentTeamActivity);

// Export reports
router.get(
  '/export/week/:weekNumber/:year/:format',
  validateWeekYear,
  validate,
  dashboardController.exportTeamReports
);

module.exports = router;