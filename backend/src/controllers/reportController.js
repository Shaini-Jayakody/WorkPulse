const ReportService = require('../services/reportService');
const { AppError } = require('../utils/errorHandler');

class ReportController {
  //Create a new report
  async createReport(req, res, next) {
    try {
      const userId = req.user._id;
      const reportData = req.body;

      const report = await ReportService.createReport(userId, reportData);

      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all reports for the user
  async getUserReports(req, res, next) {
    try {
      const userId = req.user._id;
      const filters = req.query;

      const result = await ReportService.getUserReports(userId, filters);

      res.status(200).json({
        success: true,
        data: {
          reports: result.reports,
          organized: result.organized,
          total: result.total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a report by ID
 async getReportById(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const report = await ReportService.getReportById(id, userId);

      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a report by report_id
  async getReportByReportId(req, res, next) {
    try {
      const userId = req.user._id;
      const { report_id } = req.params;

      const report = await ReportService.getReportByReportId(report_id, userId);

      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  //Update a report
  async updateReport(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const report = await ReportService.updateReport(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  //Submit a report
  async submitReport(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const report = await ReportService.submitReport(id, userId);

      res.status(200).json({
        success: true,
        message: 'Report submitted successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  //Delete a report
  async deleteReport(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const result = await ReportService.deleteReport(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  //Get report statistics for the user
  async getUserReportStats(req, res, next) {
    try {
      const userId = req.user._id;

      const stats = await ReportService.getUserReportStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  //Get report by specific week
  async getReportByWeek(req, res, next) {
    try {
      const userId = req.user._id;
      const { weekNumber, year } = req.params;

      const report = await ReportService.getReportByWeek(userId, parseInt(weekNumber), parseInt(year));

      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get recent reports
  async getRecentReports(req, res, next) {
    try {
      const userId = req.user._id;
      const limit = parseInt(req.query.limit) || 5;

      const reports = await ReportService.getRecentReports(userId, limit);

      res.status(200).json({
        success: true,
        data: { reports }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();