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
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  CheckCircle,
  People,
  Assessment,
  TrendingUp,
  Timeline,
  PictureAsPdf,
  BarChart,
  PieChart as PieChartIcon,
  CalendarToday,
  ViewWeek,
  CalendarMonth,
  CalendarViewWeek,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../api/axiosConfig';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getWeek, getYear, getMonth, eachWeekOfInterval, getWeeksInMonth } from 'date-fns';

// ============================================
// STYLED COMPONENTS
// ============================================

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

// ============================================
// CHART COLORS
// ============================================

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];

// ============================================
// COMPONENT
// ============================================

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);

  // Time range states
  const [viewType, setViewType] = useState('week');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekInMonth, setSelectedWeekInMonth] = useState(1);

  // ============================================
  // HELPERS
  // ============================================

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
    
    // Get first week's Monday
    while (current.getDay() !== 1) {
      current.setDate(current.getDate() - 1);
    }
    
    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Check if this week overlaps with the month
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
    
    // Get weeks in the selected month
    const weeksInMonth = getWeeksInMonth(month, year);
    
    if (viewType === 'week') {
      // Return the specific week
      const weekIndex = Math.min(selectedWeekInMonth - 1, weeksInMonth.length - 1);
      const week = weeksInMonth[weekIndex] || weeksInMonth[0];
      return { start: week.start, end: week.end };
    } else {
      // Return the entire month
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    }
  };

  // ============================================
  // GENERATE SELECTOR OPTIONS
  // ============================================

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const weekInMonthOptions = [1, 2, 3, 4, 5];

  // Get weeks in selected month for display
  const weeksInSelectedMonth = useMemo(() => {
    return getWeeksInMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);


  // FETCH DATA FROM BACKEND
  const loadAllData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch all users
      const usersRes = await api.get('/auth/users');
      setUsers(usersRes?.data?.data?.users || []);

      // 2. Get date range
      const range = getDateRange();
      
      // 3. Fetch reports for all weeks in the range
      let allReports = [];
      
      if (viewType === 'week') {
        // Fetch single week
        const weekNum = getWeekNumber(range.start);
        const year = range.start.getFullYear();
        
        try {
          const reportsRes = await api.get(`/dashboard/reports/week/${weekNum}/${year}`);
          if (reportsRes.data.success) {
            const grouped = reportsRes.data.data.reports || {};
            Object.keys(grouped).forEach(userId => {
              const userData = grouped[userId];
              if (userData.reports && userData.reports.length > 0) {
                userData.reports.forEach(report => {
                  allReports.push({
                    ...report,
                    user: userData.user,
                  });
                });
              }
            });
          }
        } catch (e) {
          console.warn('Could not fetch week data:', e);
        }
      } else {
        // Fetch all weeks in the month
        const weeksInMonth = getWeeksInMonth(selectedMonth, selectedYear);
        
        for (const week of weeksInMonth) {
          const weekNum = getWeekNumber(week.start);
          const year = week.start.getFullYear();
          
          try {
            const reportsRes = await api.get(`/dashboard/reports/week/${weekNum}/${year}`);
            if (reportsRes.data.success) {
              const grouped = reportsRes.data.data.reports || {};
              Object.keys(grouped).forEach(userId => {
                const userData = grouped[userId];
                if (userData.reports && userData.reports.length > 0) {
                  userData.reports.forEach(report => {
                    allReports.push({
                      ...report,
                      user: userData.user,
                    });
                  });
                }
              });
            }
          } catch (e) {
            console.warn(`Could not fetch week ${weekNum}/${year}:`, e);
          }
        }
      }

      setReports(allReports);
      
      const displayText = viewType === 'week' 
        ? `Week ${selectedWeekInMonth} of ${months[selectedMonth]} ${selectedYear}`
        : `${months[selectedMonth]} ${selectedYear}`;
      setSuccess(`Loaded ${allReports.length} reports for ${displayText}`);

    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [viewType, selectedMonth, selectedYear, selectedWeekInMonth]);

  
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
      pdf.text(`Dashboard Report - ${displayText}`, 15, 20);
      
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

      pdf.save(`Dashboard_Report_${viewType}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  
  // DATA PROCESSING
  const userStats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const pending = users.filter(u => 
      u.approval_status === 'pending' || 
      u.approval_status === 'pending_manager' || 
      u.approval_status === 'pending_admin'
    ).length;
    const inactive = users.filter(u => !u.isActive).length;
    
    const roleCounts = {};
    users.forEach(u => {
      const role = u.role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    return { total, active, pending, inactive, roleCounts };
  }, [users]);

  const reportStats = useMemo(() => {
    const total = reports.length;
    const submitted = reports.filter(r => r.status === 'submitted').length;
    const pending = reports.filter(r => r.status === 'pending' || r.status === 'draft').length;
    const late = reports.filter(r => r.status === 'late').length;
    const totalHours = reports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
    const avgHours = total > 0 ? (totalHours / total).toFixed(1) : 0;

    const projectDist = {};
    reports.forEach(r => {
      const project = r.project || 'Uncategorized';
      projectDist[project] = (projectDist[project] || 0) + 1;
    });

    const categoryDist = {};
    reports.forEach(r => {
      const category = r.category || 'Uncategorized';
      categoryDist[category] = (categoryDist[category] || 0) + 1;
    });

    const weeklyTrend = {};
    reports.forEach(r => {
      const key = `Week ${r.week_number || 'N/A'}`;
      if (!weeklyTrend[key]) weeklyTrend[key] = { submitted: 0, total: 0 };
      weeklyTrend[key].total++;
      if (r.status === 'submitted') weeklyTrend[key].submitted++;
    });

    return { total, submitted, pending, late, totalHours, avgHours, projectDist, categoryDist, weeklyTrend };
  }, [reports]);

  const projectChartData = Object.entries(reportStats.projectDist || {}).map(([name, value]) => ({
    name: name.length > 12 ? name.substring(0, 12) + '...' : name,
    fullName: name,
    value,
  })).sort((a, b) => b.value - a.value);

  const categoryChartData = Object.entries(reportStats.categoryDist || {}).map(([name, value]) => ({
    name: name.length > 12 ? name.substring(0, 12) + '...' : name,
    fullName: name,
    value,
  })).sort((a, b) => b.value - a.value);

  const weeklyTrendData = Object.entries(reportStats.weeklyTrend || {}).map(([name, data]) => ({
    name,
    submitted: data.submitted,
    total: data.total,
  })).sort((a, b) => {
    const aNum = parseInt(a.name.split(' ')[1]) || 0;
    const bNum = parseInt(b.name.split(' ')[1]) || 0;
    return aNum - bNum;
  });

  const roleChartData = Object.entries(userStats.roleCounts || {}).map(([name, value]) => ({
    name: name === 'super_admin' ? 'Super Admin' : 
          name === 'team_member' ? 'Team Member' : 
          name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const handleViewChange = (event, newValue) => {
    setViewType(newValue);
  };

  // Get week range display
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

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Box ref={dashboardRef}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
              Super Admin Dashboard
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              {viewType === 'week' 
                ? `Week ${selectedWeekInMonth} of ${months[selectedMonth]} ${selectedYear} (${getWeekDisplay()})`
                : `${months[selectedMonth]} ${selectedYear}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Toggle */}
            <ViewToggle
              value={viewType}
              onChange={handleViewChange}
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
              <Tab 
                icon={<ViewWeek sx={{ fontSize: 18 }} />} 
                label="Week" 
                value="week"
                sx={{ minHeight: '36px', minWidth: '80px' }}
              />
              <Tab 
                icon={<CalendarMonth sx={{ fontSize: 18 }} />} 
                label="Month" 
                value="month"
                sx={{ minHeight: '36px', minWidth: '80px' }}
              />
            </ViewToggle>

            {/* Month Selector */}
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

            {/* Year Selector */}
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

            {/* Week in Month Selector (only when Week view) */}
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
              onClick={loadAllData} 
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Users</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {userStats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', width: 44, height: 44 }}>
                  <People />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#10B981">Active: {userStats.active}</Typography>
                <Typography variant="caption" color="#F59E0B">Pending: {userStats.pending}</Typography>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Reports</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {reportStats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', width: 44, height: 44 }}>
                  <Assessment />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#10B981">Submitted: {reportStats.submitted}</Typography>
                <Typography variant="caption" color="#F59E0B">Pending: {reportStats.pending}</Typography>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Hours</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {reportStats.totalHours}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', width: 44, height: 44 }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="#64748B">Avg: {reportStats.avgHours}h</Typography>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Active Projects</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {Object.keys(reportStats.projectDist || {}).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6', width: 44, height: 44 }}>
                  <BarChart />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Weekly Report Trends
                </Typography>
                {weeklyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={weeklyTrendData}>
                      <defs>
                        <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                      <Legend />
                      <Area type="monotone" dataKey="submitted" stroke="#3B82F6" fill="url(#colorSubmitted)" name="Submitted" />
                      <Area type="monotone" dataKey="total" stroke="#8B5CF6" fill="url(#colorTotal)" name="Total" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                    <Typography color="#94A3B8">No report data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  User Roles
                </Typography>
                {roleChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={roleChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {roleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                    <Typography color="#94A3B8">No user data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Project Distribution
                </Typography>
                {projectChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={projectChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value, name, props) => [`${value} reports`, props.payload.fullName || name]}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography color="#94A3B8">No project data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Category Distribution
                </Typography>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={categoryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        formatter={(value, name, props) => [`${value} reports`, props.payload.fullName || name]}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography color="#94A3B8">No category data available</Typography>
                  </Box>
                )}
              </CardContent>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SuperAdminDashboard;