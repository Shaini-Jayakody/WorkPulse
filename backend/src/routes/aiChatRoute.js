// backend/routes/aiChatRoutes.js
const express = require('express');
const router = express.Router();
// const aiChatService = require('../services/aiChatService');
const protect = require('../middleware/auth');
const { hasMinimumRole } = require('../middleware/roleCheck');
const Report = require('../models/Report');
const User = require('../models/User');

// IMPORTANT: Comment out the service import initially if it's causing issues
let aiChatService;
try {
  aiChatService = require('../services/aiChatService');
} catch (error) {
  console.warn('AI Chat Service not available, using mock responses');
  // Create a mock service
  aiChatService = {
    generateResponse: async (msg, ctx) => `This is a mock response for: ${msg}`,
    generateTeamSummary: async (ctx) => `Mock team summary for Week ${ctx.weekNumber}`
  };
}

// Helper to get team data for context
const getTeamContext = async (weekNumber, year) => {
  // Get all team members
  const teamMembers = await User.find({
    role: { $in: ['team_member', 'manager'] },
    isActive: true
  });

  // Get reports for the week
  const reports = await Report.find({
    week_number: parseInt(weekNumber),
    year: parseInt(year),
    status: 'submitted'
  }).populate('user_id', 'first_name last_name email');

  // Calculate summary
  const totalReports = reports.length;
  const submittedReports = reports.filter(r => r.status === 'submitted').length;
  const totalHours = reports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
  const totalBlockers = reports.reduce((sum, r) => sum + (r.blockers?.length || 0), 0);
  
  // Get unique projects
  const projects = [...new Set(reports.map(r => r.project).filter(Boolean))];

  const complianceRate = teamMembers.length > 0 
    ? Math.round((submittedReports / teamMembers.length) * 100)
    : 0;

  // Format team reports
  const teamReports = reports.map(report => ({
    user: report.user_id,
    tasks_completed: report.tasks_completed || [],
    worked_hours: report.worked_hours || 0,
    blockers: report.blockers || [],
    project: report.project,
    category: report.category,
  }));

  return {
    summary: {
      totalReports,
      submittedReports,
      complianceRate,
      totalHours,
      totalBlockers,
      projectsList: projects,
    },
    teamReports,
    weekNumber,
    year,
  };
};

// Chat endpoint
router.post('/chat', protect, hasMinimumRole('manager'), async (req, res) => {
  try {
    const { message, weekNumber, year } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const context = await getTeamContext(weekNumber || new Date().getWeek(), year || new Date().getFullYear());
    
    const response = await aiChatService.generateResponse(message, context);
    
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Generate team summary
router.post('/summary', protect, hasMinimumRole('manager'), async (req, res) => {
  try {
    const { weekNumber, year } = req.body;
    
    const context = await getTeamContext(weekNumber || new Date().getWeek(), year || new Date().getFullYear());
    
    const summary = await aiChatService.generateTeamSummary(context);
    
    res.json({ summary });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Add getWeek helper
Date.prototype.getWeek = function() {
  const date = new Date(this);
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

module.exports = router;