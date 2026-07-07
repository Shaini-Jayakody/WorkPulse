const DashboardService = require('../services/dashboardService');
const { AppError } = require('../utils/errorHandler');

class DashboardController {
  //Get team reports for a specific week
  async getTeamReportsByWeek(req, res, next) {
    try {
      const { weekNumber, year } = req.params;
      const filters = {
        user_id: req.query.user_id,
        project: req.query.project,
        category: req.query.category
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const result = await DashboardService.getTeamReportsByWeek(
        parseInt(weekNumber),
        parseInt(year),
        filters
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get submission status for a specific week
  async getTeamSubmissionStatus(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const result = await DashboardService.getTeamSubmissionStatus(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get team dashboard summary
  async getTeamDashboardSummary(req, res, next) {
    try {
      const { weekNumber, year } = req.params;

      const result = await DashboardService.getTeamDashboardSummary(
        parseInt(weekNumber),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get team trends over time
  async getTeamTrends(req, res, next) {
    try {
      const { startWeek, startYear, endWeek, endYear } = req.query;

      if (!startWeek || !startYear || !endWeek || !endYear) {
        throw new AppError('Start week, start year, end week, and end year are required', 400);
      }

      const result = await DashboardService.getTeamTrends(
        startWeek,
        startYear,
        endWeek,
        endYear
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get member report history
  async getTeamMemberHistory(req, res, next) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const result = await DashboardService.getTeamMemberHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get submission status by date range
  async getSubmissionStatusByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      const result = await DashboardService.getSubmissionStatusByDateRange(
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get projects and categories
  async getTeamProjectsAndCategories(req, res, next) {
    try {
      const result = await DashboardService.getTeamProjectsAndCategories();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get recent team activity
  async getRecentTeamActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;

      const result = await DashboardService.getRecentTeamActivity(limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  //Get manager overview
  async getManagerOverview(req, res, next) {
    try {
      const result = await DashboardService.getManagerOverview();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get export data for reports
  async exportTeamReports(req, res, next) {
    try {
      const { weekNumber, year, format = 'json' } = req.params;

      const reports = await DashboardService.getTeamReportsByWeek(
        parseInt(weekNumber),
        parseInt(year)
      );

      if (format === 'csv') {
        // Convert to CSV
        const csvData = this.convertToCSV(reports);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=team_reports_week${weekNumber}_${year}.csv`);
        return res.send(csvData);
      }

      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      next(error);
    }
  }

  //Convert reports to CSV
  convertToCSV(data) {
    const rows = [];
    // Headers
    const headers = ['User', 'Email', 'Week', 'Project', 'Category', 'Tasks Completed', 'Tasks Planned', 'Blockers', 'Hours Worked', 'Submitted At'];
    rows.push(headers.join(','));

    // Data
    Object.values(data.reports).forEach(group => {
      group.reports.forEach(report => {
        const row = [
          `${report.user_id.first_name} ${report.user_id.last_name}`,
          report.user_id.email,
          `Week ${report.week_number}, ${report.year}`,
          report.project || '',
          report.category || '',
          (report.tasks_completed || []).join('; '),
          (report.tasks_planned || []).join('; '),
          (report.blockers || []).join('; '),
          report.worked_hours || 0,
          report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : ''
        ];
        rows.push(row.map(cell => `"${cell}"`).join(','));
      });
    });

    return rows.join('\n');
  }
}

module.exports = new DashboardController();