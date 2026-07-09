import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Paper,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EventNote,
  Assessment,
  TrendingUp,
  CheckCircle,
  Pending,
  Warning,
  ArrowForward,
  Add,
  Refresh,
  Schedule,
  Work,
  EmojiEvents,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { format } from 'date-fns';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledCard = styled(Card)({
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
  },
});

const MetricCard = styled(Card)({
  borderRadius: '16px',
  padding: '20px 24px',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  background: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
});

const IconWrapper = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '12px',
});

const QuickActionButton = styled(Button)({
  borderRadius: '12px',
  padding: '12px 20px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  justifyContent: 'flex-start',
  gap: '12px',
  width: '100%',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  color: '#1E293B',
  background: 'white',
  '&:hover': {
    background: '#F8FAFC',
    borderColor: '#3B82F6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
  },
});

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '11px',
  height: '24px',
  backgroundColor: 
    status === 'submitted' ? 'rgba(16, 185, 129, 0.1)' :
    status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
    status === 'draft' ? 'rgba(148, 163, 184, 0.1)' :
    'rgba(239, 68, 68, 0.1)',
  color: 
    status === 'submitted' ? '#10B981' :
    status === 'pending' ? '#F59E0B' :
    status === 'draft' ? '#94A3B8' :
    '#EF4444',
}));

// ============================================
// COMPONENT
// ============================================

const TeamMemberDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    submittedReports: 0,
    pendingReports: 0,
    draftReports: 0,
    completionRate: 0,
    totalHours: 0,
    averageHours: 0,
    streak: 0,
    totalTasks: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Get current week number
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();

      // Fetch user profile
      const profileRes = await api.get('/auth/profile');
      const userData = profileRes.data.data.user;
      setUser(userData);

      // Fetch reports for the user
      const reportsRes = await api.get(`/reports/week/${weekNumber}/${year}`);
      const reports = reportsRes.data.data?.report || [];
      const allReports = reports ? [reports] : [];

      // Fetch all user reports for stats
      const allReportsRes = await api.get('/reports');
      const allUserReports = allReportsRes.data.data?.reports || [];

      // Calculate stats
      const total = allUserReports.length;
      const submitted = allUserReports.filter(r => r.status === 'submitted').length;
      const pending = allUserReports.filter(r => r.status === 'pending' || r.status === 'draft').length;
      const draft = allUserReports.filter(r => r.status === 'draft').length;
      const totalHours = allUserReports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
      const totalTasks = allUserReports.reduce((sum, r) => sum + (r.tasks_completed ? r.tasks_completed.length : 0), 0);
      
      // Calculate completion rate
      const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;
      
      // Calculate average hours
      const avgHours = total > 0 ? Math.round(totalHours / total) : 0;

      // Calculate streak (consecutive weeks with submitted reports)
      const streak = calculateStreak(allUserReports);

      setStats({
        totalReports: total,
        submittedReports: submitted,
        pendingReports: pending,
        draftReports: draft,
        completionRate,
        totalHours,
        averageHours: avgHours,
        streak,
        totalTasks,
      });

      // Get recent reports (last 4)
      const sortedReports = allUserReports
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);
      setRecentReports(sortedReports);

      setSuccess('Dashboard updated successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper: Get week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Helper: Calculate streak
  const calculateStreak = (reports) => {
    if (!reports || reports.length === 0) return 0;
    
    const submittedReports = reports
      .filter(r => r.status === 'submitted')
      .sort((a, b) => new Date(b.submitted_at || b.createdAt) - new Date(a.submitted_at || a.createdAt));
    
    if (submittedReports.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Get the current week number
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    // Check if there's a submission for the current week
    const hasCurrentWeek = submittedReports.some(r => 
      r.week_number === currentWeek && r.year === currentYear
    );
    
    if (!hasCurrentWeek) {
      // If no submission this week, check if we're early in the week (Monday-Wednesday)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        // Still early in the week, don't break streak
        streak = 1;
      } else {
        return 0;
      }
    }
    
    // Calculate consecutive weeks
    let checkWeek = currentWeek;
    let checkYear = currentYear;
    let found = hasCurrentWeek;
    
    while (found) {
      streak++;
      checkWeek--;
      if (checkWeek < 1) {
        checkWeek = 52;
        checkYear--;
      }
      found = submittedReports.some(r => 
        r.week_number === checkWeek && r.year === checkYear
      );
    }
    
    return streak;
  };

  const getStatusLabel = (status) => {
    return status === 'submitted' ? 'Submitted' :
           status === 'pending' ? 'Pending' :
           status === 'draft' ? 'Draft' :
           'Unknown';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
          <Typography variant="body2" color="#94A3B8" sx={{ mt: 2 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Messages */}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B">
            Dashboard
          </Typography>
          <Typography variant="body2" color="#94A3B8" sx={{ mt: 0.5 }}>
            Welcome back{user ? `, ${user.first_name}` : ''}! Here's your weekly report summary
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              color: '#64748B',
              borderColor: '#E2E8F0',
              '&:hover': { borderColor: '#3B82F6' },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/reports/create"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.35)',
              },
            }}
          >
            New Report
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <IconWrapper sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}>
              <Assessment sx={{ color: '#3B82F6' }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {stats.totalReports}
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              Total Reports
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <IconWrapper sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)' }}>
              <CheckCircle sx={{ color: '#10B981' }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {stats.submittedReports}
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              Submitted
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <IconWrapper sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)' }}>
              <Pending sx={{ color: '#F59E0B' }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {stats.pendingReports}
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              Pending
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <IconWrapper sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)' }}>
              <EmojiEvents sx={{ color: '#8B5CF6' }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {stats.streak}w
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              Week Streak
            </Typography>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Progress Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B">
                  Weekly Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${stats.submittedReports} / ${stats.totalReports} submitted`} 
                    size="small" 
                    sx={{ borderRadius: '6px' }} 
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="#64748B">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1E293B">
                      {stats.completionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.completionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
                      },
                    }}
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="#94A3B8">Hours Worked</Typography>
                  <Typography variant="body1" fontWeight={600} color="#1E293B">
                    {stats.totalHours}h
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="#94A3B8">Avg / Week</Typography>
                  <Typography variant="body1" fontWeight={600} color="#1E293B">
                    {stats.averageHours}h
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="#94A3B8">Tasks Completed</Typography>
                  <Typography variant="body1" fontWeight={600} color="#1E293B">
                    {stats.totalTasks}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <QuickActionButton
                  component={Link}
                  to="/reports/create"
                  startIcon={<Add sx={{ color: '#3B82F6' }} />}
                >
                  Create New Report
                </QuickActionButton>
                <QuickActionButton
                  component={Link}
                  to="/reports"
                  startIcon={<EventNote sx={{ color: '#8B5CF6' }} />}
                >
                  View All Reports
                </QuickActionButton>
                <QuickActionButton
                  component={Link}
                  to="/profile"
                  startIcon={<Work sx={{ color: '#10B981' }} />}
                >
                  My Profile
                </QuickActionButton>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Recent Reports */}
      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} color="#1E293B">
              Recent Reports
            </Typography>
            <Button
              component={Link}
              to="/reports"
              endIcon={<ArrowForward />}
              sx={{
                textTransform: 'none',
                color: '#3B82F6',
                fontWeight: 500,
                '&:hover': { bgcolor: 'transparent' },
              }}
            >
              View All
            </Button>
          </Box>

          {recentReports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="#94A3B8">No reports found. Create your first report!</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {recentReports.map((report) => (
                <Grid item xs={12} key={report._id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#3B82F6',
                        bgcolor: '#F8FAFC',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          bgcolor: `rgba(59, 130, 246, 0.08)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Schedule sx={{ color: '#3B82F6', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="#1E293B">
                          {report.project || 'Uncategorized'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="#94A3B8">
                            Week {report.week_number}, {report.year}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8">
                            • {report.tasks_completed?.length || 0} tasks
                          </Typography>
                          <Typography variant="caption" color="#94A3B8">
                            • {report.worked_hours || 0}h
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <StatusChip
                        label={getStatusLabel(report.status)}
                        status={report.status}
                        size="small"
                      />
                      <IconButton
                        component={Link}
                        to={`/reports/view/${report._id}`}
                        size="small"
                        sx={{ color: '#94A3B8' }}
                      >
                        <ArrowForward fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default TeamMemberDashboard;