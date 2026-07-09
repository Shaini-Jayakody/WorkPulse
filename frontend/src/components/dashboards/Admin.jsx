import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  CheckCircle,
  Assessment,
  TrendingUp,
  Timeline,
  PictureAsPdf,
  ViewWeek,
  CalendarMonth,
  Warning,
  Done,
  Pending,
  Block,
  Description,
  Person,
  People,
  HowToReg,
  PersonAdd,
  ThumbUp,
  ThumbDown,
  Comment,
  Assignment,
  Email,
  Phone,
  Work,
} from '@mui/icons-material';
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../api/axiosConfig';
import { format } from 'date-fns';


// STYLED COMPONENTS
const StatsCard = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-2px)',
  },
});

const ChartCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.06)',
  },
});

const ViewToggle = styled(Tabs)({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '13px',
    minHeight: '36px',
    padding: '6px 16px',
    borderRadius: '8px',
    '&.Mui-selected': {
      color: '#3B82F6',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#3B82F6',
    height: '3px',
    borderRadius: '3px',
  },
});

const ActivityItem = styled(ListItem)({
  borderRadius: '10px',
  border: '1px solid #F1F5F9',
  marginBottom: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
});

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    submitted: '#10B981',
    pending: '#F59E0B',
    late: '#EF4444',
    draft: '#94A3B8',
    pending_manager_approval: '#F59E0B',
    pending_admin_approval: '#8B5CF6',
    pending_super_admin_approval: '#EC4899',
    approved: '#10B981',
    rejected: '#EF4444',
  };
  const color = colors[status] || '#64748B';
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '10px',
    height: '22px',
    backgroundColor: `${color}15`,
    color: color,
  };
});

const ApprovalCard = styled(Paper)({
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(245, 158, 11, 0.3)',
  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(245, 158, 11, 0.06))',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)',
  },
});

// CHART COLORS
const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];


// COMPONENT
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    submission: { stats: {}, members: [] },
    trends: [],
    workload: { byProject: {}, byMember: {} },
    recentActivity: [],
    blockers: { total: 0, list: [] },
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);

  // Approval dialog states
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    user: null,
    action: null, // 'approve' or 'reject'
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Time range states
  const [viewType, setViewType] = useState('week');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekInMonth, setSelectedWeekInMonth] = useState(1);


  // HELPERS
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const getWeeksInMonth = (month, year) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const weeks = [];
    let current = new Date(start);
    
    while (current.getDay() !== 1) {
      current.setDate(current.getDate() - 1);
    }
    
    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekStart <= end && weekEnd >= start) {
        weeks.push({
          weekNumber: getWeekNumber(current),
          start: new Date(Math.max(weekStart, start)),
          end: new Date(Math.min(weekEnd, end)),
          label: `Week ${weeks.length + 1}`,
        });
      }
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  };

  const getDateRange = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const weeksInMonth = getWeeksInMonth(month, year);
    
    if (viewType === 'week') {
      const weekIndex = Math.min(selectedWeekInMonth - 1, weeksInMonth.length - 1);
      const week = weeksInMonth[weekIndex] || weeksInMonth[0];
      return { start: week.start, end: week.end };
    } else {
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    }
  };


  // GENERATE SELECTOR OPTIONS
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const weeksInSelectedMonth = useMemo(() => {
    return getWeeksInMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);


  // FETCH PENDING APPROVALS
  const fetchPendingApprovals = async () => {
    setLoadingApprovals(true);
    try {
      const response = await api.get('/auth/approvals/pending');
      if (response.data.success) {
        setPendingApprovals(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  // FETCH DASHBOARD DATA
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const range = getDateRange();
      const weekNum = getWeekNumber(range.start);
      const year = range.start.getFullYear();

      // Fetch all required data
      const [summaryRes, submissionRes, trendsRes, reportsRes, activityRes] = await Promise.all([
        api.get(`/dashboard/summary/week/${weekNum}/${year}`),
        api.get(`/dashboard/submission/week/${weekNum}/${year}`),
        api.get(`/dashboard/trends?startWeek=${Math.max(1, weekNum - 8)}&startYear=${year}&endWeek=${weekNum}&endYear=${year}`),
        api.get(`/dashboard/reports/week/${weekNum}/${year}`),
        api.get('/dashboard/recent-activity?limit=10'),
      ]);

      // Extract data from API responses
      const summaryData = summaryRes.data.data || {};
      const submissionData = submissionRes.data.data || {};
      const trendsData = trendsRes.data.data || [];
      const reportsData = reportsRes.data.data || {};
      const activityData = activityRes.data.data?.activities || [];

      // Process reports for workload and blockers
      const reports = reportsData.reports || {};
      const workloadByProject = {};
      const tasksByMember = {};
      const blockersList = [];

      Object.keys(reports).forEach(userId => {
        const userData = reports[userId];
        if (userData.reports) {
          userData.reports.forEach(report => {
            const project = report.project || 'Uncategorized';
            workloadByProject[project] = (workloadByProject[project] || 0) + 1;

            const memberName = userData.user 
              ? `${userData.user.first_name} ${userData.user.last_name}`
              : 'Unknown';
            const taskCount = report.tasks_completed ? report.tasks_completed.length : 0;
            tasksByMember[memberName] = (tasksByMember[memberName] || 0) + taskCount;

            if (report.blockers && report.blockers.length > 0) {
              report.blockers.forEach(blocker => {
                blockersList.push({
                  text: blocker,
                  user: userData.user,
                  project: report.project,
                });
              });
            }
          });
        }
      });

      setDashboardData({
        summary: summaryData,
        submission: submissionData,
        trends: trendsData,
        workload: {
          byProject: workloadByProject,
          byMember: tasksByMember,
        },
        recentActivity: activityData,
        blockers: {
          total: blockersList.length,
          list: blockersList,
        },
      });

      // Fetch pending approvals
      await fetchPendingApprovals();

      const displayText = viewType === 'week' 
        ? `Week ${selectedWeekInMonth} of ${months[selectedMonth]} ${selectedYear}`
        : `${months[selectedMonth]} ${selectedYear}`;
      setSuccess(`Dashboard updated for ${displayText}`);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [viewType, selectedMonth, selectedYear, selectedWeekInMonth]);


  // APPROVAL HANDLERS
  const handleApproveUser = async () => {
    if (!approvalDialog.user) return;
    
    setSubmittingApproval(true);
    try {
      const response = await api.post(`/auth/users/${approvalDialog.user._id}/approve`);
      if (response.data.success) {
        setSuccess(`${approvalDialog.user.first_name} ${approvalDialog.user.last_name} has been approved successfully!`);
        await fetchPendingApprovals();
        setApprovalDialog({ open: false, user: null, action: null });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve user.');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleRejectUser = async () => {
    if (!approvalDialog.user) return;
    
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setSubmittingApproval(true);
    try {
      const response = await api.post(`/auth/users/${approvalDialog.user._id}/reject`, {
        reason: rejectionReason,
      });
      if (response.data.success) {
        setSuccess(`${approvalDialog.user.first_name} ${approvalDialog.user.last_name} has been rejected.`);
        await fetchPendingApprovals();
        setApprovalDialog({ open: false, user: null, action: null });
        setRejectionReason('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reject user.');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const openApprovalDialog = (user, action) => {
    setApprovalDialog({ open: true, user, action });
    setRejectionReason('');
    setError('');
  };

  const closeApprovalDialog = () => {
    setApprovalDialog({ open: false, user: null, action: null });
    setRejectionReason('');
    setError('');
  };


  // PDF EXPORT
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = dashboardRef.current;
      if (!element) { setExporting(false); return; }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.setTextColor('#1E293B');
      const displayText = viewType === 'week' 
        ? `Week ${selectedWeekInMonth} of ${months[selectedMonth]} ${selectedYear}`
        : `${months[selectedMonth]} ${selectedYear}`;
      pdf.text(`Admin Dashboard Report - ${displayText}`, 15, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor('#94A3B8');
      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      pdf.text(`Generated: ${dateStr}`, 15, 27);
      pdf.setDrawColor('#E2E8F0');
      pdf.line(15, 33, pdfWidth - 15, 33);

      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, 38, imgWidth, imgHeight);

      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor('#94A3B8');
        pdf.text(`Confidential Report | Page ${i} of ${pageCount}`, pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      pdf.save(`Admin_Dashboard_${viewType}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };


  // DATA PROCESSING FOR CHARTS
  const submissionStats = dashboardData.submission.stats || {};
  
  const submissionChartData = (dashboardData.submission.members || []).map(member => ({
    name: member.user ? `${member.user.first_name} ${member.user.last_name}` : 'Unknown',
    hasSubmitted: member.hasSubmitted || false,
    hours: member.hours || 0,
  }));

  const workloadProjectData = Object.entries(dashboardData.workload.byProject || {})
    .map(([name, value]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const workloadMemberData = Object.entries(dashboardData.workload.byMember || {})
    .map(([name, value]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      tasks: value,
    }))
    .sort((a, b) => b.tasks - a.tasks);

  const trendsData = (dashboardData.trends || []).map(item => ({
    name: item.weekDisplay || `Week ${item.week}`,
    submitted: item.submittedReports || item.submitted || 0,
    compliance: parseFloat(item.complianceRate) || 0,
  }));

  const recentActivityData = (dashboardData.recentActivity || []).slice(0, 8);
  const blockersList = dashboardData.blockers.list || [];

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      pending: 'Pending',
      late: 'Late',
      draft: 'Draft',
      pending_manager_approval: 'Pending Manager',
      pending_admin_approval: 'Pending Admin',
      pending_super_admin_approval: 'Pending Super Admin',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeekDisplay = () => {
    const weeksInMonth = getWeeksInMonth(selectedMonth, selectedYear);
    const weekIndex = Math.min(selectedWeekInMonth - 1, weeksInMonth.length - 1);
    const week = weeksInMonth[weekIndex];
    if (week) {
      const start = format(week.start, 'MMM d');
      const end = format(week.end, 'MMM d, yyyy');
      return `${start} - ${end}`;
    }
    return '';
  };

  
  // RENDER
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Box ref={dashboardRef}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              {viewType === 'week' 
                ? `Week ${selectedWeekInMonth} of ${months[selectedMonth]} ${selectedYear} (${getWeekDisplay()})`
                : `${months[selectedMonth]} ${selectedYear}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <ViewToggle
              value={viewType}
              onChange={(e, newValue) => setViewType(newValue)}
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px',
                padding: '2px',
                minHeight: 'auto',
                '& .MuiTabs-flexContainer': {
                  gap: '4px',
                },
              }}
            >
              <Tab icon={<ViewWeek sx={{ fontSize: 18 }} />} label="Week" value="week" />
              <Tab icon={<CalendarMonth sx={{ fontSize: 18 }} />} label="Month" value="month" />
            </ViewToggle>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {months.map((m, idx) => (
                  <MenuItem key={idx} value={idx}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {viewType === 'week' && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={selectedWeekInMonth}
                  onChange={(e) => setSelectedWeekInMonth(parseInt(e.target.value))}
                  sx={{ borderRadius: '12px', background: 'white' }}
                >
                  {weeksInSelectedMonth.map((week, index) => (
                    <MenuItem key={index} value={index + 1}>
                      Week {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="contained"
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
              onClick={exportToPDF}
              disabled={exporting}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
              }}
            >
              {exporting ? 'Generating...' : 'Export PDF'}
            </Button>

            <IconButton 
              onClick={loadDashboardData} 
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: '#3B82F6', bgcolor: 'rgba(59,130,246,0.04)' },
              }}
            >
              <Refresh sx={{ color: '#64748B' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

        {/* Pending Approvals Section */}
        {pendingApprovals.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Badge badgeContent={pendingApprovals.length} color="warning">
                <People sx={{ color: '#F59E0B', fontSize: 28 }} />
              </Badge>
              <Typography variant="h6" fontWeight={600} color="#1E293B">
                Pending Approvals
              </Typography>
              <Chip 
                label={`${pendingApprovals.length} member${pendingApprovals.length > 1 ? 's' : ''} waiting`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(245, 158, 11, 0.08)', 
                  color: '#F59E0B',
                  fontWeight: 600,
                }}
              />
            </Box>

            <Grid container spacing={2}>
              {pendingApprovals.map((user) => (
                <Grid item xs={12} md={6} lg={4} key={user._id}>
                  <ApprovalCard>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'rgba(245, 158, 11, 0.08)',
                          color: '#F59E0B',
                          fontSize: '18px',
                          fontWeight: 600,
                        }}
                      >
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" fontWeight={600} color="#1E293B">
                            {user.first_name} {user.last_name}
                          </Typography>
                          <StatusChip 
                            label={getStatusLabel(user.approval_status)}
                            status={user.approval_status}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                          <Email sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {user.email}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="#94A3B8">
                            <Work sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
                            {user.role?.replace('_', ' ').toUpperCase() || 'Team Member'}
                          </Typography>
                          {user.team_no && (
                            <Typography variant="caption" color="#94A3B8">
                              Team: {user.team_no}
                            </Typography>
                          )}
                          {user.contact_no && (
                            <Typography variant="caption" color="#94A3B8">
                              <Phone sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
                              {user.contact_no}
                            </Typography>
                          )}
                        </Stack>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                          <Tooltip title="Approve this member">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ThumbUp />}
                              onClick={() => openApprovalDialog(user, 'approve')}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #059669, #047857)',
                                },
                              }}
                            >
                              Approve
                            </Button>
                          </Tooltip>
                          <Tooltip title="Reject this member">
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<ThumbDown />}
                              onClick={() => openApprovalDialog(user, 'reject')}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#EF4444',
                                color: '#EF4444',
                                '&:hover': {
                                  borderColor: '#DC2626',
                                  bgcolor: 'rgba(239, 68, 68, 0.04)',
                                },
                              }}
                            >
                              Reject
                            </Button>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </ApprovalCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Summary Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Reports</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {dashboardData.summary.totalReports || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', width: 44, height: 44 }}>
                  <Assessment />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#10B981">Submitted: {dashboardData.summary.submittedReports || 0}</Typography>
                <Typography variant="caption" color="#F59E0B">Pending: {dashboardData.summary.pendingReports || 0}</Typography>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Compliance Rate</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {dashboardData.summary.complianceRate || 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', width: 44, height: 44 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={dashboardData.summary.complianceRate || 0} 
                  sx={{ 
                    height: 4, 
                    borderRadius: 2,
                    backgroundColor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: (dashboardData.summary.complianceRate || 0) > 70 ? '#10B981' : '#F59E0B',
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Blockers</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {dashboardData.blockers.total || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', width: 44, height: 44 }}>
                  <Warning />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#64748B">
                  {dashboardData.blockers.total > 0 ? 'Action required' : 'All clear!'}
                </Typography>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Hours</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {dashboardData.summary.totalHours || 0}h
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6', width: 44, height: 44 }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#64748B">Avg: {dashboardData.summary.averageHours || 0}h</Typography>
              </Box>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Charts Row 1 - Submission Status & Trends */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={7}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Tasks Completed Trend
                </Typography>
                {trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={trendsData}>
                      <defs>
                        <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="submitted" 
                        stroke="#3B82F6" 
                        fill="url(#trendColor)" 
                        name="Submitted Reports" 
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="compliance" 
                        fill="#10B981" 
                        name="Compliance Rate (%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                    <Typography color="#94A3B8">No trend data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Submission Status
                </Typography>
                {(submissionStats.submitted > 0 || submissionStats.pending > 0 || submissionStats.late > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Submitted', value: submissionStats.submitted || 0 },
                          { name: 'Pending', value: submissionStats.pending || 0 },
                          { name: 'Late', value: submissionStats.late || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value) => [`${value} members`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                    <Typography color="#94A3B8">No submission data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Charts Row 2 - Workload Distribution */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Workload by Project
                </Typography>
                {workloadProjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={workloadProjectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value, name, props) => [`${value} reports`, props.payload.fullName || name]}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography color="#94A3B8">No workload data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Tasks per Team Member
                </Typography>
                {workloadMemberData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={workloadMemberData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value, name, props) => [`${value} tasks`, props.payload.fullName || name]}
                      />
                      <Bar dataKey="tasks" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography color="#94A3B8">No member data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Charts Row 3 - Submission Status by Member */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Report Submission Status by Team Member
                </Typography>
                {submissionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={submissionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value, name) => {
                          if (name === 'hasSubmitted') return [value ? '✅ Submitted' : '❌ Not Submitted', 'Status'];
                          return [`${value}h`, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="hasSubmitted" fill="#10B981" name="Submitted" />
                      <Bar dataKey="hours" fill="#3B82F6" name="Hours" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography color="#94A3B8">No member status data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Recent Activity & Blockers */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ color: '#3B82F6' }} />
                  Recent Activity Feed
                </Typography>
                {recentActivityData.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {recentActivityData.map((activity, index) => (
                      <ActivityItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={600} color="#1E293B">
                                {activity.user?.first_name} {activity.user?.last_name}
                              </Typography>
                              <Chip 
                                label={activity.project || 'Uncategorized'} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 20, fontSize: '10px' }}
                              />
                              <StatusChip 
                                label={getStatusLabel(activity.status || 'submitted')}
                                status={activity.status || 'submitted'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="caption" color="#64748B">
                                {activity.tasks_completed?.length || 0} tasks completed • 
                                {activity.worked_hours || 0}h worked
                                {activity.blockers?.length > 0 && ` • ⚠️ ${activity.blockers.length} blockers`}
                              </Typography>
                              <Typography variant="caption" color="#94A3B8">
                                {formatDate(activity.submitted_at || activity.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ActivityItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Typography color="#94A3B8">No recent activity</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ color: '#EF4444' }} />
                  Blockers Overview
                  {dashboardData.blockers.total > 0 && (
                    <Chip 
                      label={`${dashboardData.blockers.total} blockers`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                        color: '#EF4444',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Typography>
                {blockersList.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {blockersList.slice(0, 5).map((blocker, index) => (
                      <ActivityItem key={index} sx={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', width: 32, height: 32 }}>
                            <Block sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="#1E293B">
                              {blocker.text || 'Unspecified blocker'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                              <Typography variant="caption" color="#64748B">
                                {blocker.user?.first_name} {blocker.user?.last_name}
                              </Typography>
                              <Typography variant="caption" color="#94A3B8">
                                • {blocker.project || 'Uncategorized'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ActivityItem>
                    ))}
                    {blockersList.length > 5 && (
                      <Typography variant="caption" color="#94A3B8" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        +{blockersList.length - 5} more blockers
                      </Typography>
                    )}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                    <Typography color="#10B981" fontWeight={600}>
                      No blockers reported
                    </Typography>
                    <Typography variant="caption" color="#94A3B8">
                      Team is making good progress!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={closeApprovalDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {approvalDialog.action === 'approve' ? (
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>
                <ThumbUp />
              </Avatar>
            ) : (
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                <ThumbDown />
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1E293B">
                {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'} Member
              </Typography>
              <Typography variant="body2" color="#94A3B8">
                {approvalDialog.user?.first_name} {approvalDialog.user?.last_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="#64748B" sx={{ mb: 2 }}>
            {approvalDialog.action === 'approve' 
              ? 'Are you sure you want to approve this member? They will gain access to the system immediately.'
              : 'Please provide a reason for rejecting this member. This will be sent to the member via email.'}
          </DialogContentText>
          
          {approvalDialog.user && (
            <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Name</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {approvalDialog.user.first_name} {approvalDialog.user.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Role</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {approvalDialog.user.role?.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Email</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B" noWrap>
                    {approvalDialog.user.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Team</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {approvalDialog.user.team_no || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {approvalDialog.action === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              placeholder="Please explain why this member is being rejected..."
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeApprovalDialog}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#CBD5E1' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={approvalDialog.action === 'approve' ? handleApproveUser : handleRejectUser}
            variant="contained"
            disabled={submittingApproval || (approvalDialog.action === 'reject' && !rejectionReason.trim())}
            startIcon={submittingApproval ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              background: approvalDialog.action === 'approve' 
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #EF4444, #DC2626)',
              '&:hover': {
                background: approvalDialog.action === 'approve'
                  ? 'linear-gradient(135deg, #059669, #047857)'
                  : 'linear-gradient(135deg, #DC2626, #B91C1C)',
              },
              '&:disabled': {
                background: '#CBD5E1',
              },
            }}
          >
            {submittingApproval ? 'Processing...' : approvalDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;