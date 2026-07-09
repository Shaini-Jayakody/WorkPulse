// backend/services/aiChatService.js (Updated with proper error handling)
const axios = require('axios');

class AIChatService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // or 'gpt-4' if available
  }

  async generateResponse(userMessage, context) {
    try {
      // Check if API key is set
      if (!this.apiKey) {
        console.warn('OpenAI API key not found. Using mock responses.');
        return this.getMockResponse(userMessage, context);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Chat Error:', error.response?.data || error.message);
      // Fallback to mock response if API fails
      return this.getMockResponse(userMessage, context);
    }
  }

  buildSystemPrompt(context) {
    const { teamReports, summary, weekNumber, year } = context;
    
    // Format team reports for AI context
    const reportsSummary = teamReports.map(report => {
      const user = report.user || { first_name: 'Unknown', last_name: '' };
      return `- ${user.first_name} ${user.last_name}: ${report.tasks_completed?.length || 0} tasks, ${report.worked_hours || 0}h, ${report.blockers?.length || 0} blockers`;
    }).join('\n');

    return `You are a helpful team assistant for WorkPulse, a project management and reporting platform.
    
Current Context:
- Week ${weekNumber}, ${year}
- Total Reports: ${summary.totalReports || 0}
- Submitted Reports: ${summary.submittedReports || 0}
- Compliance Rate: ${summary.complianceRate || 0}%
- Total Hours: ${summary.totalHours || 0}h
- Total Blockers: ${summary.totalBlockers || 0}

Team Member Reports:
${reportsSummary}

Top Projects:
${summary.projectsList?.slice(0, 5).join(', ') || 'No projects'}

Instructions:
1. Be concise and helpful
2. Use the data provided to answer questions
3. If asked about specific team members, refer to the reports above
4. Provide actionable insights when possible
5. Keep responses professional and friendly
6. If you don't know something, say so politely

Format responses with clear sections and bullet points when appropriate.`;
  }

  // Mock responses when no API key is available
  getMockResponse(userMessage, context) {
    const lowerMsg = userMessage.toLowerCase();
    const { teamReports, summary, weekNumber, year } = context;
    
    if (lowerMsg.includes('blocker') || lowerMsg.includes('issue') || lowerMsg.includes('problem')) {
      const blockersList = teamReports
        .filter(r => r.blockers?.length > 0)
        .map(r => `• ${r.user?.first_name || 'Unknown'}: ${r.blockers.join(', ')}`);
      
      if (blockersList.length === 0) {
        return `✅ No blockers reported for Week ${weekNumber}, ${year}. Team is making good progress!`;
      }
      
      return `🔍 Blockers Overview for Week ${weekNumber}, ${year}:\n\n${blockersList.join('\n')}\n\nTotal Blockers: ${summary.totalBlockers || 0}`;
    }
    
    if (lowerMsg.includes('top') || lowerMsg.includes('performer') || lowerMsg.includes('best')) {
      const sorted = [...teamReports].sort((a, b) => 
        (b.tasks_completed?.length || 0) - (a.tasks_completed?.length || 0)
      );
      const top = sorted[0];
      if (top) {
        return `🏆 Top Performer for Week ${weekNumber}, ${year}:\n\n${top.user?.first_name || 'Unknown'} completed ${top.tasks_completed?.length || 0} tasks and worked ${top.worked_hours || 0} hours.`;
      }
      return `No team members found for Week ${weekNumber}, ${year}.`;
    }
    
    if (lowerMsg.includes('summary') || lowerMsg.includes('overview') || lowerMsg.includes('report')) {
      return `📊 Team Summary - Week ${weekNumber}, ${year}:\n\n` +
        `📈 Overall:\n` +
        `• Total Reports: ${summary.totalReports || 0}\n` +
        `• Submitted: ${summary.submittedReports || 0}\n` +
        `• Compliance Rate: ${summary.complianceRate || 0}%\n` +
        `• Total Hours: ${summary.totalHours || 0}h\n` +
        `• Blockers: ${summary.totalBlockers || 0}\n` +
        `• Active Projects: ${summary.projectsList?.length || 0}\n\n` +
        `👥 Team Members:\n` +
        teamReports.map(r => 
          `• ${r.user?.first_name || 'Unknown'}: ${r.tasks_completed?.length || 0} tasks, ${r.worked_hours || 0}h`
        ).join('\n');
    }
    
    return `🤖 I'm your team assistant for WorkPulse.\n\nI can help you with:\n\n` +
      `• 📊 Team performance overview\n` +
      `• 👤 Individual member reports\n` +
      `• ⚠️ Blockers and issues\n` +
      `• 📈 Weekly summaries\n` +
      `• 🏆 Top performers\n\n` +
      `Try asking:\n` +
      `• "What are the blockers?"\n` +
      `• "Show me team summary"\n` +
      `• "Who is the top performer?"\n` +
      `• "Give me an overview"`;
  }

  // Generate a team summary
  async generateTeamSummary(context) {
    try {
      // Check if API key is set
      if (!this.apiKey) {
        console.warn('OpenAI API key not found. Using mock summary.');
        return this.getMockSummary(context);
      }

      const summaryPrompt = `Based on the following team data, provide a concise team summary for Week ${context.weekNumber}, ${context.year}:

Reports: ${context.summary.totalReports || 0} total, ${context.summary.submittedReports || 0} submitted
Compliance: ${context.summary.complianceRate || 0}%
Total Hours: ${context.summary.totalHours || 0}h
Blockers: ${context.summary.totalBlockers || 0}

Team Members:
${context.teamReports.map(r => `- ${r.user?.first_name || 'Unknown'}: ${r.tasks_completed?.length || 0} tasks, ${r.worked_hours || 0}h`).join('\n')}

Please provide a summary covering:
1. Overall team performance
2. Key accomplishments
3. Any concerns or blockers
4. Recommendations for improvement

Keep it brief (3-4 paragraphs) and professional.`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a team performance analyst. Provide clear, actionable summaries.' },
            { role: 'user', content: summaryPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Summary Error:', error);
      return this.getMockSummary(context);
    }
  }

  getMockSummary(context) {
    const { teamReports, summary, weekNumber, year } = context;
    const activeMembers = teamReports.filter(r => r.tasks_completed?.length > 0);
    
    return `📊 Team Summary - Week ${weekNumber}, ${year}:\n\n` +
      `📈 Performance Overview:\n` +
      `• ${activeMembers.length} team members submitted reports this week\n` +
      `• ${summary.complianceRate || 0}% compliance rate\n` +
      `• ${summary.totalHours || 0} total hours worked\n` +
      `• ${summary.totalTasks || 0} tasks completed\n\n` +
      `⚠️ Blockers: ${summary.totalBlockers || 0} reported blockers\n\n` +
      `💡 Key Insights:\n` +
      `• ${summary.totalHours > 0 ? 'Good overall engagement' : 'Low engagement - encourage more participation'}\n` +
      `• ${summary.totalBlockers > 0 ? 'Several blockers identified - prioritize addressing them' : 'No blockers reported - team is progressing well'}\n\n` +
      `📋 Recommendations:\n` +
      `• ${summary.complianceRate < 70 ? 'Improve report submission compliance' : 'Maintain current submission momentum'}\n` +
      `• ${summary.totalBlockers > 0 ? 'Schedule a team meeting to address blockers' : 'Continue with current workflow'}\n` +
      `• Recognize and reward active team members`;
  }
}

module.exports = new AIChatService();