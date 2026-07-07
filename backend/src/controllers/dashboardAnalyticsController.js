const DashboardAnalyticsService = require('../services/dashboardAnalyticsService');
const { AppError } = require('../utils/errorHandler');

class DashboardAnalyticsController {
  //Get complete data for a specific week
  async getDashboardData(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getCompleteDashboardData(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get current week data
  async getCurrentWeekDashboard(req, res, next) {
    try {
      const data = await DashboardAnalyticsService.getCurrentWeekDashboard();

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get summary
  async getSummaryMetrics(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getSummaryMetrics(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get submission status data for charts
  async getSubmissionStatus(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getSubmissionStatusData(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get tasks completed trend
  async getTasksTrend(req, res, next) {
    try {
      const { startWeek, startYear, endWeek, endYear } = req.query;

      if (!startWeek || !startYear || !endWeek || !endYear) {
        throw new AppError('Start week, start year, end week, and end year are required', 400);
      }

      const data = await DashboardAnalyticsService.getTasksCompletedTrend(
        parseInt(startWeek),
        parseInt(startYear),
        parseInt(endWeek),
        parseInt(endYear)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get workload distribution by project
  async getWorkloadDistribution(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getWorkloadDistribution(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get recent activity feed
  async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;

      const data = await DashboardAnalyticsService.getRecentActivity(limit);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get blockers data
  async getBlockersData(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getBlockersData(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get team performance data
  async getTeamPerformance(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const data = await DashboardAnalyticsService.getTeamPerformance(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get multi-week analytics
  async getMultiWeekAnalytics(req, res, next) {
    try {
      const { startWeek, startYear, endWeek, endYear } = req.query;

      if (!startWeek || !startYear || !endWeek || !endYear) {
        throw new AppError('Start week, start year, end week, and end year are required', 400);
      }

      const data = await DashboardAnalyticsService.getMultiWeekAnalytics(
        parseInt(startWeek),
        parseInt(startYear),
        parseInt(endWeek),
        parseInt(endYear)
      );

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //Get all analytics data for charts
  async getAllChartData(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const [
        summary,
        submissionStatus,
        tasksTrend,
        workload,
        blockers,
        performance
      ] = await Promise.all([
        DashboardAnalyticsService.getSummaryMetrics(parseInt(weekNumber), parseInt(year)),
        DashboardAnalyticsService.getSubmissionStatusData(parseInt(weekNumber), parseInt(year)),
        DashboardAnalyticsService.getTasksCompletedTrend(
          Math.max(1, parseInt(weekNumber) - 8),
          parseInt(year),
          parseInt(weekNumber),
          parseInt(year)
        ),
        DashboardAnalyticsService.getWorkloadDistribution(parseInt(weekNumber), parseInt(year)),
        DashboardAnalyticsService.getBlockersData(parseInt(weekNumber), parseInt(year)),
        DashboardAnalyticsService.getTeamPerformance(parseInt(weekNumber), parseInt(year))
      ]);

      res.status(200).json({
        success: true,
        data: {
          week: { weekNumber: parseInt(weekNumber), year: parseInt(year) },
          summary,
          submissionStatus,
          tasksTrend,
          workload,
          blockers,
          performance
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardAnalyticsController();