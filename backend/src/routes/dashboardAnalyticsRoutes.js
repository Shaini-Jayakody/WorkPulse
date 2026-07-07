const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/dashboardAnalyticsController');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const { validateWeekYear, validate } = require('../utils/validators');

// All analytics routes require authentication (manager)
router.use(protect);
router.use(hasMinimumRole('manager'));

// Current week data
router.get('/current', analyticsController.getCurrentWeekDashboard);

// Complete dashboard data
router.get(
  '/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getDashboardData
);

// Summary metrics
router.get(
  '/summary/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getSummaryMetrics
);

// Submission status for charts
router.get(
  '/submission/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getSubmissionStatus
);

// Tasks completed trend
router.get(
  '/tasks-trend',
  analyticsController.getTasksTrend
);

// Workload distribution
router.get(
  '/workload/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getWorkloadDistribution
);

// Blockers data
router.get(
  '/blockers/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getBlockersData
);

// Team performance
router.get(
  '/performance/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getTeamPerformance
);

// Recent activity
router.get('/recent-activity', analyticsController.getRecentActivity);

// Multi-week analytics
router.get('/multi-week', analyticsController.getMultiWeekAnalytics);

// All chart data in one request
router.get(
  '/all-charts/week/:weekNumber/:year',
  validateWeekYear,
  validate,
  analyticsController.getAllChartData
);

module.exports = router;