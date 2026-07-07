const Report = require('../models/Report');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

class DashboardService {
  //Get all team reports for a specific week
  async getTeamReportsByWeek(weekNumber, year, filters = {}) {
    const query = {
      week_number: parseInt(weekNumber),
      year: parseInt(year),
      status: 'submitted' // Only show submitted reports
    };

    // Apply additional filters
    if (filters.user_id) {
      query.user_id = filters.user_id;
    }

    if (filters.project) {
      query.project = { $regex: filters.project, $options: 'i' };
    }

    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    const reports = await Report.find(query)
      .populate('user_id', 'first_name last_name email user_id role')
      .sort({ 'user_id.first_name': 1 });

    // Group reports by user
    const groupedReports = {};
    reports.forEach(report => {
      const userId = report.user_id._id.toString();
      if (!groupedReports[userId]) {
        groupedReports[userId] = {
          user: report.user_id,
          reports: []
        };
      }
      groupedReports[userId].reports.push(report);
    });

    return {
      week: { weekNumber, year },
      totalReports: reports.length,
      totalUsers: Object.keys(groupedReports).length,
      reports: groupedReports
    };
  }

  //Get all members with their submission status for a specific week
  async getTeamSubmissionStatus(weekNumber, year) {
    // Get all team members
    const teamMembers = await User.find({ 
      role: { $in: ['team_member', 'manager'] },
      isActive: true 
    }).select('first_name last_name email user_id role');

    // Get all submitted reports for the week
    const reports = await Report.find({
      week_number: parseInt(weekNumber),
      year: parseInt(year),
      status: 'submitted'
    }).select('user_id submitted_at');

    // Create a map of user_id to report
    const submittedMap = {};
    reports.forEach(report => {
      submittedMap[report.user_id.toString()] = report;
    });

    // Build submission status for each member
    const submissionStatus = teamMembers.map(member => {
      const userId = member._id.toString();
      const hasSubmitted = !!submittedMap[userId];
      
      let status = 'pending';
      let submittedAt = null;
      
      if (hasSubmitted) {
        status = 'submitted';
        submittedAt = submittedMap[userId].submitted_at;
      }

      // Check if late (assuming reports are due on Friday)
      const today = new Date();
      const weekEnd = this.getWeekEndDate(weekNumber, year);
      if (!hasSubmitted && today > weekEnd) {
        status = 'late';
      }

      return {
        user: member,
        status,
        submittedAt,
        hasSubmitted
      };
    });

    // Statistics
    const stats = {
      total: submissionStatus.length,
      submitted: submissionStatus.filter(s => s.status === 'submitted').length,
      pending: submissionStatus.filter(s => s.status === 'pending').length,
      late: submissionStatus.filter(s => s.status === 'late').length,
      complianceRate: submissionStatus.length > 0 
        ? ((submissionStatus.filter(s => s.status === 'submitted').length / submissionStatus.length) * 100).toFixed(2)
        : 0
    };

    return {
      week: { weekNumber, year },
      stats,
      members: submissionStatus
    };
  }

  //Get team dashboard summary
  async getTeamDashboardSummary(weekNumber, year) {
    // Get submission status
    const submissionStatus = await this.getTeamSubmissionStatus(weekNumber, year);

    // Get all submitted reports for the week
    const reports = await Report.find({
      week_number: parseInt(weekNumber),
      year: parseInt(year),
      status: 'submitted'
    }).populate('user_id', 'first_name last_name email user_id');

    // Calculate summary
    const totalHours = reports.reduce((sum, report) => sum + (report.worked_hours || 0), 0);
    const avgHours = reports.length > 0 ? (totalHours / reports.length).toFixed(1) : 0;

    // Get all blockers across team
    const allBlockers = [];
    reports.forEach(report => {
      if (report.blockers && report.blockers.length > 0) {
        report.blockers.forEach(blocker => {
          allBlockers.push({
            blocker,
            user: report.user_id,
            reportId: report._id
          });
        });
      }
    });

    // Get top projects
    const projectCount = {};
    reports.forEach(report => {
      const project = report.project || 'Uncategorized';
      projectCount[project] = (projectCount[project] || 0) + 1;
    });

    const topProjects = Object.entries(projectCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([project, count]) => ({ project, count }));

    // Get categories
    const categoryCount = {};
    reports.forEach(report => {
      const category = report.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    return {
      week: { weekNumber, year },
      submission: submissionStatus,
      metrics: {
        totalReports: reports.length,
        totalTeamMembers: submissionStatus.total,
        totalHours,
        averageHours: avgHours,
        totalBlockers: allBlockers.length,
        submissionRate: submissionStatus.stats.complianceRate
      },
      blockers: allBlockers,
      topProjects,
      categories
    };
  }

   //Get team report trends over time
  async getTeamTrends(startWeek, startYear, endWeek, endYear) {
    const trends = [];
    
    // Generate weeks between start and end
    let currentWeek = parseInt(startWeek);
    let currentYear = parseInt(startYear);
    
    while (currentYear < parseInt(endYear) || 
           (currentYear === parseInt(endYear) && currentWeek <= parseInt(endWeek))) {
      
      const weekData = await this.getTeamDashboardSummary(currentWeek, currentYear);
      
      trends.push({
        week: currentWeek,
        year: currentYear,
        weekDisplay: `Week ${currentWeek}, ${currentYear}`,
        totalReports: weekData.metrics.totalReports,
        totalTeamMembers: weekData.metrics.totalTeamMembers,
        submissionRate: weekData.metrics.submissionRate,
        totalHours: weekData.metrics.totalHours,
        totalBlockers: weekData.metrics.totalBlockers
      });

      // Move to next week
      currentWeek++;
      if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
      }
    }

    return trends;
  }

  //Get member report history
  async getTeamMemberHistory(userId, limit = 10) {
    const reports = await Report.find({
      user_id: userId,
      status: 'submitted'
    })
    .sort({ start_date: -1 })
    .limit(limit)
    .populate('user_id', 'first_name last_name email user_id');

    const user = reports.length > 0 ? reports[0].user_id : await User.findById(userId).select('first_name last_name email user_id');

    // Get statistics for the user
    const allReports = await Report.find({
      user_id: userId,
      status: 'submitted'
    });

    const totalReports = allReports.length;
    const totalHours = allReports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
    const avgHours = totalReports > 0 ? (totalHours / totalReports).toFixed(1) : 0;

    // Get project distribution
    const projects = {};
    allReports.forEach(report => {
      const project = report.project || 'Uncategorized';
      projects[project] = (projects[project] || 0) + 1;
    });

    return {
      user,
      summary: {
        totalReports,
        totalHours,
        averageHours: avgHours,
        projects
      },
      recentReports: reports
    };
  }

  //Get submission status by member for a date range
  async getSubmissionStatusByDateRange(startDate, endDate) {
    const reports = await Report.find({
      start_date: { $gte: new Date(startDate) },
      end_date: { $lte: new Date(endDate) },
      status: 'submitted'
    }).populate('user_id', 'first_name last_name email user_id role');

    // Group by user
    const userStatus = {};
    reports.forEach(report => {
      const userId = report.user_id._id.toString();
      if (!userStatus[userId]) {
        userStatus[userId] = {
          user: report.user_id,
          reports: []
        };
      }
      userStatus[userId].reports.push(report);
    });

    return {
      startDate,
      endDate,
      totalReports: reports.length,
      totalUsers: Object.keys(userStatus).length,
      userStatus
    };
  }

  //Get all unique projects/categories from reports
  async getTeamProjectsAndCategories() {
    const projects = await Report.distinct('project', { status: 'submitted' });
    const categories = await Report.distinct('category', { status: 'submitted' });

    // Get project with counts
    const projectCounts = await Report.aggregate([
      { $match: { status: 'submitted' } },
      { $group: { 
        _id: '$project', 
        count: { $sum: 1 },
        lastUsed: { $max: '$createdAt' }
      }},
      { $sort: { count: -1 } }
    ]);

    return {
      projects: projectCounts.map(p => ({
        name: p._id || 'Uncategorized',
        count: p.count,
        lastUsed: p.lastUsed
      })),
      categories: categories.filter(c => c)
    };
  }

  //Get recent team activity
  async getRecentTeamActivity(limit = 20) {
    const recentReports = await Report.find({ status: 'submitted' })
      .sort({ submitted_at: -1 })
      .limit(limit)
      .populate('user_id', 'first_name last_name email user_id')
      .select('project category start_date end_date submitted_at user_id worked_hours blockers');

    const activities = recentReports.map(report => ({
      id: report._id,
      user: report.user_id,
      project: report.project,
      category: report.category,
      submittedAt: report.submitted_at,
      weekDisplay: `Week ${report.week_number}, ${report.year}`,
      workedHours: report.worked_hours || 0,
      hasBlockers: report.blockers && report.blockers.length > 0,
      type: 'report_submitted'
    }));

    return {
      activities,
      total: activities.length
    };
  }

  // Get week end date
  getWeekEndDate(weekNumber, year) {
    // assumes week starts on Monday
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (weekNumber - 1) * 7;
    const monday = new Date(firstDayOfYear);
    monday.setDate(monday.getDate() + days);
    // Get Friday (end of work week)
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    return friday;
  }

  //Get manager dashboard overview
  async getManagerOverview() {
    // Get current week
    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentYear = now.getFullYear();

    // Get current week data
    const currentWeekData = await this.getTeamDashboardSummary(currentWeek, currentYear);

    // Get previous week data 
    let prevWeek = currentWeek - 1;
    let prevYear = currentYear;
    if (prevWeek === 0) {
      prevWeek = 52;
      prevYear = currentYear - 1;
    }
    const prevWeekData = await this.getTeamDashboardSummary(prevWeek, prevYear);

    // Get recent activity
    const recentActivity = await this.getRecentTeamActivity(10);

    // Get team projects
    const projects = await this.getTeamProjectsAndCategories();

    // Calculate changes
    const submissionRateChange = currentWeekData.metrics.submissionRate - prevWeekData.metrics.submissionRate;
    const reportCountChange = currentWeekData.metrics.totalReports - prevWeekData.metrics.totalReports;

    return {
      currentWeek: {
        week: currentWeek,
        year: currentYear,
        data: currentWeekData
      },
      previousWeek: {
        week: prevWeek,
        year: prevYear,
        data: prevWeekData
      },
      changes: {
        submissionRate: submissionRateChange,
        reportCount: reportCountChange,
        hasImproved: submissionRateChange > 0
      },
      recentActivity,
      projects: projects.projects.slice(0, 10),
      categories: projects.categories
    };
  }

  //Get week number from date
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

module.exports = new DashboardService();