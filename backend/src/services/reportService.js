const Report = require('../models/Report');
const { AppError } = require('../utils/errorHandler');

class ReportService {

  //Create a new report
  async createReport(userId, reportData) {
    const { 
      start_date, 
      end_date, 
      project, 
      category, 
      tasks_completed, 
      tasks_planned, 
      blockers, 
      worked_hours, 
      notes, 
      links 
    } = reportData;

    // Validate date range
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (start > end) {
      throw new AppError('Start date cannot be after end date', 400);
    }

    // Check if report already exists for the week
    const existingReport = await Report.findOne({
      user_id: userId,
      start_date: {
        $gte: new Date(start.setHours(0, 0, 0, 0)),
        $lt: new Date(start.setHours(23, 59, 59, 999))
      }
    });

    if (existingReport) {
      throw new AppError('A report already exists for this week', 409);
    }

    const report = new Report({
      user_id: userId,
      start_date,
      end_date,
      project,
      category,
      tasks_completed: tasks_completed || [],
      tasks_planned: tasks_planned || [],
      blockers: blockers || [],
      worked_hours: worked_hours || 0,
      notes: notes || '',
      links: links || [],
      status: 'draft'
    });

    await report.save();
    return report;
  }

  //Get a report by ID
  async getReportById(reportId, userId) {
    const report = await Report.findOne({ 
      _id: reportId,
      user_id: userId 
    });

    if (!report) {
      throw new AppError('Report not found or you do not have access', 404);
    }

    return report;
  }

  //Get report by report_id
  async getReportByReportId(report_id, userId) {
    const report = await Report.findOne({ 
      report_id,
      user_id: userId 
    });

    if (!report) {
      throw new AppError('Report not found or you do not have access', 404);
    }

    return report;
  }

  //Get all reports for a user (organized by week)
  async getUserReports(userId, filters = {}) {
    const query = { user_id: userId };
    
    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.project) {
      query.project = { $regex: filters.project, $options: 'i' };
    }
    
    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    if (filters.start_date && filters.end_date) {
      query.start_date = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date)
      };
    }

    const reports = await Report.find(query)
      .sort({ start_date: -1 })
      .lean();

    // Organize by week
    const organizedReports = {};
    reports.forEach(report => {
      const weekKey = `Week ${report.week_number}, ${report.year}`;
      if (!organizedReports[weekKey]) {
        organizedReports[weekKey] = [];
      }
      organizedReports[weekKey].push(report);
    });

    return {
      reports,
      organized: organizedReports,
      total: reports.length
    };
  }

  //Update a report
  async updateReport(reportId, userId, updateData) {
    const report = await Report.findOne({ 
      _id: reportId,
      user_id: userId 
    });

    if (!report) {
      throw new AppError('Report not found or you do not have access', 404);
    }

    // Don't allow update for submitted reports
    if (report.status === 'submitted') {
      throw new AppError('Cannot update a submitted report', 400);
    }

    // Validate date range (if update dates)
    if (updateData.start_date && updateData.end_date) {
      const start = new Date(updateData.start_date);
      const end = new Date(updateData.end_date);
      
      if (start > end) {
        throw new AppError('Start date cannot be after end date', 400);
      }
    }

    // Update fields
    const allowedUpdates = [
      'start_date', 'end_date', 'project', 'category', 
      'tasks_completed', 'tasks_planned', 'blockers', 
      'worked_hours', 'notes', 'links'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        report[field] = updateData[field];
      }
    });

    await report.save();
    return report;
  }

  //Submit a report
  async submitReport(reportId, userId) {
    const report = await Report.findOne({ 
      _id: reportId,
      user_id: userId 
    });

    if (!report) {
      throw new AppError('Report not found or you do not have access', 404);
    }

    // Validate required fields before submission
    const requiredFields = ['project', 'category'];
    const missingFields = requiredFields.filter(field => !report[field]);
    
    if (missingFields.length > 0) {
      throw new AppError(`Cannot submit: Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Check if tasks_completed is not empty
    if (!report.tasks_completed || report.tasks_completed.length === 0) {
      throw new AppError('Cannot submit: At least one completed task is required', 400);
    }

    report.status = 'submitted';
    report.submitted_at = new Date();
    
    await report.save();
    return report;
  }

  //Delete a report (only draft reports can be deleted)
  async deleteReport(reportId, userId) {
    const report = await Report.findOne({ 
      _id: reportId,
      user_id: userId 
    });

    if (!report) {
      throw new AppError('Report not found or you do not have access', 404);
    }

    if (report.status === 'submitted') {
      throw new AppError('Cannot delete a submitted report', 400);
    }

    await report.deleteOne();
    return { message: 'Report deleted successfully' };
  }

  //Get report statistics for a user
  async getUserReportStats(userId) {
    const totalReports = await Report.countDocuments({ user_id: userId });
    const submittedReports = await Report.countDocuments({ 
      user_id: userId, 
      status: 'submitted' 
    });
    const draftReports = await Report.countDocuments({ 
      user_id: userId, 
      status: 'draft' 
    });

    // Get total hours worked
    const hoursResult = await Report.aggregate([
      { $match: { user_id: userId } },
      { $group: { 
        _id: null, 
        totalHours: { $sum: '$worked_hours' },
        avgHours: { $avg: '$worked_hours' }
      }}
    ]);

    return {
      totalReports,
      submittedReports,
      draftReports,
      totalHours: hoursResult[0]?.totalHours || 0,
      averageHours: hoursResult[0]?.avgHours || 0,
      completionRate: totalReports > 0 ? (submittedReports / totalReports * 100).toFixed(2) : 0
    };
  }

  //Get report by week (for a specific week)
  async getReportByWeek(userId, weekNumber, year) {
    const report = await Report.findOne({
      user_id: userId,
      week_number: weekNumber,
      year: year
    });

    return report;
  }

  //Get recent reports for a user
  async getRecentReports(userId, limit = 5) {
    const reports = await Report.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return reports;
  }
}

module.exports = new ReportService();