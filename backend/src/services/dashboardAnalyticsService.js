const Report = require('../models/Report');
const User = require('../models/User');
const Project = require('../models/Project');
const { AppError } = require('../utils/errorHandler');

class DashboardAnalyticsService {
  // Get complete data
  async getCompleteDashboardData(weekNumber, year) {
    try {
      const week = parseInt(weekNumber);
      const yr = parseInt(year);

      // Get all data
      const [
        summaryMetrics,
        submissionStatus,
        tasksTrend,
        workloadDistribution,
        recentActivity,
        blockersData,
        teamPerformance
      ] = await Promise.all([
        this.getSummaryMetrics(week, yr),
        this.getSubmissionStatusData(week, yr),
        this.getTasksCompletedTrend(week, yr),
        this.getWorkloadDistribution(week, yr),
        this.getRecentActivity(20),
        this.getBlockersData(week, yr),
        this.getTeamPerformance(week, yr)
      ]);

      return {
        summary: summaryMetrics,
        submissionStatus,
        tasksTrend,
        workloadDistribution,
        recentActivity,
        blockers: blockersData,
        teamPerformance,
        week: { weekNumber: week, year: yr }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  }

  //Get summary 
  async getSummaryMetrics(weekNumber, year) {
    // Get all team members
    const totalTeamMembers = await User.countDocuments({
      role: { $in: ['team_member', 'manager'] },
      isActive: true
    });

    // Get reports for the week
    const weekReports = await Report.find({
      week_number: weekNumber,
      year: year
    });

    const submittedReports = weekReports.filter(r => r.status === 'submitted');
    const totalReports = weekReports.length;
    const submittedCount = submittedReports.length;
    const pendingCount = totalReports - submittedCount;

    // Calculate compliance rate
    const complianceRate = totalTeamMembers > 0 
      ? ((submittedCount / totalTeamMembers) * 100).toFixed(2)
      : 0;

    // Get all blockers
    const allBlockers = [];
    submittedReports.forEach(report => {
      if (report.blockers && report.blockers.length > 0) {
        report.blockers.forEach(blocker => {
          allBlockers.push({
            text: blocker,
            reportId: report._id,
            userId: report.user_id,
            project: report.project
          });
        });
      }
    });

    // Calculate total hours
    const totalHours = submittedReports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
    const avgHours = submittedCount > 0 ? (totalHours / submittedCount).toFixed(1) : 0;

    // Get projects with reports
    const projects = [...new Set(submittedReports.map(r => r.project).filter(Boolean))];

    return {
      totalTeamMembers,
      totalReports,
      submittedReports: submittedCount,
      pendingReports: pendingCount,
      complianceRate: parseFloat(complianceRate),
      totalBlockers: allBlockers.length,
      totalHours,
      averageHours: parseFloat(avgHours),
      activeProjects: projects.length,
      projectsList: projects
    };
  }

  //Get submission status data for charts
  async getSubmissionStatusData(weekNumber, year) {
    // Get all team members
    const teamMembers = await User.find({
      role: { $in: ['team_member', 'manager'] },
      isActive: true
    }).select('first_name last_name email user_id');

    // Get reports for the week
    const reports = await Report.find({
      week_number: weekNumber,
      year: year,
      status: 'submitted'
    });

    // Create status map
    const statusMap = {};
    teamMembers.forEach(member => {
      statusMap[member._id.toString()] = {
        user: member,
        status: 'pending',
        hasSubmitted: false,
        submittedAt: null,
        reportId: null
      };
    });

    // Update with submitted reports
    reports.forEach(report => {
      const userId = report.user_id.toString();
      if (statusMap[userId]) {
        statusMap[userId].status = 'submitted';
        statusMap[userId].hasSubmitted = true;
        statusMap[userId].submittedAt = report.submitted_at;
        statusMap[userId].reportId = report._id;
        statusMap[userId].hours = report.worked_hours || 0;
        statusMap[userId].project = report.project;
      }
    });

    // Check for late submissions (assuming deadline is Friday)
    const today = new Date();
    const weekEnd = this.getWeekEndDate(weekNumber, year);
    const isWeekOver = today > weekEnd;

    // Convert to array and add late status
    const statusData = Object.values(statusMap).map(item => {
      if (item.status === 'pending' && isWeekOver) {
        item.status = 'late';
      }
      return item;
    });

    // Statistics
    const stats = {
      total: statusData.length,
      submitted: statusData.filter(s => s.status === 'submitted').length,
      pending: statusData.filter(s => s.status === 'pending').length,
      late: statusData.filter(s => s.status === 'late').length
    };

    // Data for pie chart
    const pieChartData = [
      { name: 'Submitted', value: stats.submitted, color: '#10B981' },
      { name: 'Pending', value: stats.pending, color: '#F59E0B' },
      { name: 'Late', value: stats.late, color: '#EF4444' }
    ];

    // Data for bar chart (per member)
    const barChartData = statusData.map(item => ({
      name: `${item.user.first_name} ${item.user.last_name}`,
      status: item.status,
      submitted: item.hasSubmitted,
      hours: item.hours || 0
    }));

    return {
      stats,
      pieChartData,
      barChartData,
      members: statusData
    };
  }

  // Get tasks completed trend over time
  async getTasksCompletedTrend(startWeek, startYear, endWeek, endYear) {
    const trendData = [];
    let currentWeek = parseInt(startWeek);
    let currentYear = parseInt(startYear);

    while (
      currentYear < parseInt(endYear) || 
      (currentYear === parseInt(endYear) && currentWeek <= parseInt(endWeek))
    ) {
      // Get reports for the week
      const reports = await Report.find({
        week_number: currentWeek,
        year: currentYear,
        status: 'submitted'
      }).populate('user_id', 'first_name last_name');

      // Calculate tasks completed
      let totalTasks = 0;
      const perMember = {};

      reports.forEach(report => {
        const taskCount = report.tasks_completed ? report.tasks_completed.length : 0;
        totalTasks += taskCount;

        const userName = report.user_id 
          ? `${report.user_id.first_name} ${report.user_id.last_name}`
          : 'Unknown';
        
        if (!perMember[userName]) {
          perMember[userName] = 0;
        }
        perMember[userName] += taskCount;
      });

      // Prepare member data for stacked bar chart
      const memberData = Object.entries(perMember).map(([name, count]) => ({
        name,
        tasks: count
      }));

      trendData.push({
        week: currentWeek,
        year: currentYear,
        weekDisplay: `Week ${currentWeek}, ${currentYear}`,
        totalTasks,
        reportCount: reports.length,
        memberData,
        // For line chart
        tasksPerReport: reports.length > 0 ? (totalTasks / reports.length).toFixed(1) : 0
      });

      // Move to next week
      currentWeek++;
      if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
      }
    }

    // Prepare data for different chart types
    const lineChartData = trendData.map(d => ({
      week: d.weekDisplay,
      tasks: d.totalTasks,
      reports: d.reportCount,
      avgTasks: parseFloat(d.tasksPerReport)
    }));

    return {
      trendData,
      lineChartData,
      summary: {
        totalWeeks: trendData.length,
        totalTasks: trendData.reduce((sum, d) => sum + d.totalTasks, 0),
        averageTasksPerWeek: trendData.length > 0 
          ? (trendData.reduce((sum, d) => sum + d.totalTasks, 0) / trendData.length).toFixed(1)
          : 0
      }
    };
  }

  //Get workload / task distribution by project
  async getWorkloadDistribution(weekNumber, year) {
    // Get all reports for the week
    const reports = await Report.find({
      week_number: weekNumber,
      year: year,
      status: 'submitted'
    }).populate('user_id', 'first_name last_name');

    // Group by project
    const projectData = {};
    reports.forEach(report => {
      const project = report.project || 'Uncategorized';
      if (!projectData[project]) {
        projectData[project] = {
          project,
          reports: [],
          totalTasks: 0,
          totalHours: 0,
          members: new Set(),
          blockers: 0
        };
      }

      projectData[project].reports.push(report);
      projectData[project].totalTasks += report.tasks_completed ? report.tasks_completed.length : 0;
      projectData[project].totalHours += report.worked_hours || 0;
      if (report.user_id) {
        projectData[project].members.add(report.user_id._id.toString());
      }
      if (report.blockers && report.blockers.length > 0) {
        projectData[project].blockers += report.blockers.length;
      }
    });

    // Convert to array and calculate averages
    const projectStats = Object.values(projectData).map(p => ({
      project: p.project,
      reportCount: p.reports.length,
      totalTasks: p.totalTasks,
      totalHours: p.totalHours,
      memberCount: p.members.size,
      blockers: p.blockers,
      averageTasksPerReport: p.reports.length > 0 
        ? (p.totalTasks / p.reports.length).toFixed(1)
        : 0,
      averageHoursPerReport: p.reports.length > 0
        ? (p.totalHours / p.reports.length).toFixed(1)
        : 0
    }));

    // Sort by report count (most active first)
    projectStats.sort((a, b) => b.reportCount - a.reportCount);

    // Data for pie chart
    const pieChartData = projectStats.map(p => ({
      name: p.project,
      value: p.reportCount,
      tasks: p.totalTasks,
      hours: p.totalHours
    }));

    // Data for bar chart
    const barChartData = projectStats.map(p => ({
      project: p.project,
      reports: p.reportCount,
      tasks: p.totalTasks,
      hours: p.totalHours
    }));

    // Data for horizontal bar chart (task distribution)
    const taskDistributionData = projectStats.map(p => ({
      project: p.project,
      tasks: p.totalTasks,
      members: p.memberCount,
      blockers: p.blockers
    }));

    return {
      projects: projectStats,
      pieChartData,
      barChartData,
      taskDistributionData,
      totalProjects: projectStats.length,
      totalReports: reports.length
    };
  }

  //Get recent activity feed
  async getRecentActivity(limit = 20) {
    const recentReports = await Report.find({ status: 'submitted' })
      .sort({ submitted_at: -1 })
      .limit(limit)
      .populate('user_id', 'first_name last_name email user_id')
      .select('project category start_date end_date submitted_at user_id worked_hours blockers tasks_completed');

    const activities = recentReports.map(report => {
      const user = report.user_id || { first_name: 'Unknown', last_name: 'User' };
      const taskCount = report.tasks_completed ? report.tasks_completed.length : 0;
      const hasBlockers = report.blockers && report.blockers.length > 0;

      return {
        id: report._id,
        type: 'report_submitted',
        user: {
          id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          user_id: user.user_id
        },
        project: report.project || 'Uncategorized',
        category: report.category || 'Uncategorized',
        taskCount,
        hasBlockers,
        blockerCount: report.blockers ? report.blockers.length : 0,
        hours: report.worked_hours || 0,
        weekDisplay: `Week ${report.week_number}, ${report.year}`,
        submittedAt: report.submitted_at,
        timeAgo: this.getTimeAgo(report.submitted_at)
      };
    });

    return {
      activities,
      total: activities.length
    };
  }

  //Get blockers data
  async getBlockersData(weekNumber, year) {
    const reports = await Report.find({
      week_number: weekNumber,
      year: year,
      status: 'submitted'
    }).populate('user_id', 'first_name last_name email');

    const blockers = [];
    reports.forEach(report => {
      if (report.blockers && report.blockers.length > 0) {
        report.blockers.forEach(blocker => {
          blockers.push({
            text: blocker,
            user: report.user_id ? {
              id: report.user_id._id,
              name: `${report.user_id.first_name} ${report.user_id.last_name}`,
              email: report.user_id.email
            } : null,
            project: report.project || 'Uncategorized',
            reportId: report._id,
            weekDisplay: `Week ${report.week_number}, ${report.year}`
          });
        });
      }
    });

    // Group blockers by type/category (simple keyword categorization)
    const categorizedBlockers = {
      technical: [],
      resource: [],
      dependency: [],
      requirement: [],
      other: []
    };

    const keywordMap = {
      technical: ['technical', 'bug', 'error', 'issue', 'problem', 'code'],
      resource: ['resource', 'staff', 'team', 'capacity', 'time'],
      dependency: ['dependency', 'third-party', 'external', 'vendor', 'api'],
      requirement: ['requirement', 'scope', 'spec', 'documentation', 'need']
    };

    blockers.forEach(blocker => {
      const text = blocker.text.toLowerCase();
      let categorized = false;
      
      for (const [category, keywords] of Object.entries(keywordMap)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          categorizedBlockers[category].push(blocker);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categorizedBlockers.other.push(blocker);
      }
    });

    // Data for pie chart
    const pieChartData = Object.entries(categorizedBlockers).map(([category, items]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: items.length
    })).filter(item => item.count > 0);

    return {
      total: blockers.length,
      byType: categorizedBlockers,
      pieChartData,
      list: blockers,
      hasBlockers: blockers.length > 0
    };
  }

  // Get team performance metrics
  async getTeamPerformance(weekNumber, year) {
    // Get all team members
    const teamMembers = await User.find({
      role: { $in: ['team_member', 'manager'] },
      isActive: true
    }).select('first_name last_name email user_id');

    // Get all reports for the week
    const reports = await Report.find({
      week_number: weekNumber,
      year: year,
      status: 'submitted'
    });

    // Calculate performance per member
    const performanceData = teamMembers.map(member => {
      const memberReports = reports.filter(r => r.user_id.toString() === member._id.toString());
      const reportCount = memberReports.length;
      const totalTasks = memberReports.reduce((sum, r) => sum + (r.tasks_completed ? r.tasks_completed.length : 0), 0);
      const totalHours = memberReports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
      const totalBlockers = memberReports.reduce((sum, r) => sum + (r.blockers ? r.blockers.length : 0), 0);

      // Productivity score (tasks per hour)
      const productivity = totalHours > 0 ? (totalTasks / totalHours).toFixed(2) : 0;

      return {
        user: {
          id: member._id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          user_id: member.user_id
        },
        reports: reportCount,
        tasks: totalTasks,
        hours: totalHours,
        blockers: totalBlockers,
        productivity: parseFloat(productivity),
        hasSubmitted: reportCount > 0
      };
    });

    // Calculate team averages
    const activeMembers = performanceData.filter(m => m.hasSubmitted);
    const avgTasks = activeMembers.length > 0 
      ? (activeMembers.reduce((sum, m) => sum + m.tasks, 0) / activeMembers.length).toFixed(1)
      : 0;
    const avgHours = activeMembers.length > 0
      ? (activeMembers.reduce((sum, m) => sum + m.hours, 0) / activeMembers.length).toFixed(1)
      : 0;

    // Data for radar chart
    const radarChartData = performanceData
      .filter(m => m.hasSubmitted)
      .map(m => ({
        name: m.user.name,
        tasks: m.tasks,
        hours: m.hours,
        productivity: m.productivity
      }));

    return {
      members: performanceData,
      summary: {
        totalMembers: teamMembers.length,
        activeMembers: activeMembers.length,
        submissionRate: teamMembers.length > 0 
          ? ((activeMembers.length / teamMembers.length) * 100).toFixed(2)
          : 0,
        averageTasks: parseFloat(avgTasks),
        averageHours: parseFloat(avgHours),
        totalTasks: performanceData.reduce((sum, m) => sum + m.tasks, 0),
        totalHours: performanceData.reduce((sum, m) => sum + m.hours, 0),
        totalBlockers: performanceData.reduce((sum, m) => sum + m.blockers, 0)
      },
      radarChartData,
      barChartData: performanceData.map(m => ({
        name: m.user.name,
        tasks: m.tasks,
        hours: m.hours,
        submitted: m.hasSubmitted
      }))
    };
  }

  //Get comprehensive analytics for multiple weeks
  async getMultiWeekAnalytics(startWeek, startYear, endWeek, endYear) {
    const analytics = [];
    let currentWeek = parseInt(startWeek);
    let currentYear = parseInt(startYear);

    while (
      currentYear < parseInt(endYear) || 
      (currentYear === parseInt(endYear) && currentWeek <= parseInt(endWeek))
    ) {
      const weekData = await this.getCompleteDashboardData(currentWeek, currentYear);
      analytics.push({
        week: currentWeek,
        year: currentYear,
        weekDisplay: `Week ${currentWeek}, ${currentYear}`,
        data: weekData
      });

      currentWeek++;
      if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
      }
    }

    return analytics;
  }

  //Get dashboard data for the current week
  async getCurrentWeekDashboard() {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    
    return await this.getCompleteDashboardData(weekNumber, year);
  }

  //Get week end date (Friday)
  getWeekEndDate(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (weekNumber - 1) * 7;
    const monday = new Date(firstDayOfYear);
    monday.setDate(monday.getDate() + days);
    
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    return friday;
  }

  //Get week number from date
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  //Get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }
}

module.exports = new DashboardAnalyticsService();