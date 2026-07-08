import React, { useState } from 'react';
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
    'rgba(239, 68, 68, 0.1)',
  color: 
    status === 'submitted' ? '#10B981' :
    status === 'pending' ? '#F59E0B' :
    '#EF4444',
}));

// ============================================
// COMPONENT
// ============================================

const TeamMemberDashboard = () => {
  const [stats] = useState({
    totalReports: 24,
    submittedReports: 18,
    pendingReports: 4,
    draftReports: 2,
    completionRate: 75,
    totalHours: 280,
    averageHours: 35,
    streak: 12,
  });

  const [recentReports] = useState([
    {
      id: 1,
      week: 'Week 27, 2026',
      project: 'WorkPulse Application',
      status: 'submitted',
      date: '2026-07-07',
      tasks: 5,
      hours: 35,
    },
    {
      id: 2,
      week: 'Week 26, 2026',
      project: 'WorkPulse Frontend',
      status: 'pending',
      date: '2026-06-30',
      tasks: 3,
      hours: 28,
    },
    {
      id: 3,
      week: 'Week 25, 2026',
      project: 'Database Migration',
      status: 'submitted',
      date: '2026-06-23',
      tasks: 4,
      hours: 32,
    },
    {
      id: 4,
      week: 'Week 24, 2026',
      project: 'AI Integration',
      status: 'draft',
      date: '2026-06-16',
      tasks: 2,
      hours: 20,
    },
  ]);

  const getStatusLabel = (status) => {
    return status === 'submitted' ? 'Submitted' :
           status === 'pending' ? 'Pending' :
           'Draft';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B">
            Dashboard
          </Typography>
          <Typography variant="body2" color="#94A3B8" sx={{ mt: 0.5 }}>
            Welcome back! Here's your weekly report summary
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
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
                  <Chip label="Week 27, 2026" size="small" sx={{ borderRadius: '6px' }} />
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
                    42
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

          <Grid container spacing={2}>
            {recentReports.map((report) => (
              <Grid item xs={12} key={report.id}>
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
                        {report.project}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="#94A3B8">
                          {report.week}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          • {report.tasks} tasks
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          • {report.hours}h
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
                      to={`/reports/${report.id}`}
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
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default TeamMemberDashboard;