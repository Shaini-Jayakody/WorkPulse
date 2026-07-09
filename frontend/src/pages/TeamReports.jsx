import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Divider,
  Pagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Visibility,
  Clear,
  Work,
  Category,
  People,
  CalendarToday,
  AttachMoney,
  Flag,
  Settings,
  Archive,
  Restore,
  CheckCircle,
  Pending,
  Schedule,
  Block,
  ExpandMore,
  Assessment,
  BarChart,
  PieChart as PieChartIcon,
  TrendingUp,
  Warning,
  Person,
  Email,
  Phone,
  Description,
  Download,
  Print,
  Timeline, // <-- Add this import
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
  Line,
} from 'recharts';
import api from '../api/axiosConfig';
import { format, startOfWeek, endOfWeek, getWeek, getYear, parseISO, isWithinInterval } from 'date-fns';

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

const FilterPaper = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  marginBottom: '24px',
});

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    submitted: '#10B981',
    pending: '#F59E0B',
    late: '#EF4444',
    draft: '#94A3B8',
  };
  const color = colors[status] || '#64748B';
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '11px',
    height: '24px',
    backgroundColor: `${color}15`,
    color: color,
  };
});

const ReportCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
});

const WeekAccordion = styled(Accordion)({
  borderRadius: '12px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  marginBottom: '12px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: '0 0 12px 0',
  },
});

// CHART COLORS
const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];

const TeamReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    project: 'all',
    category: 'all',
    week: 'all',
    member: 'all',
  });
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    late: 0,
    totalHours: 0,
    totalTasks: 0,
    totalBlockers: 0,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('list');
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch team reports
  const fetchTeamReports = async () => {
    setLoading(true);
    setError('');

    try {
      // Get current week
      const currentWeek = getWeek(new Date());
      const currentYear = getYear(new Date());

      const response = await api.get(`/dashboard/reports/week/${currentWeek}/${currentYear}`);
      
      if (response.data.success) {
        const reportsData = response.data.data.reports || {};
        const allReports = [];
        const memberStats = {};

        // Process reports
        Object.keys(reportsData).forEach(userId => {
          const userData = reportsData[userId];
          if (userData.reports && userData.reports.length > 0) {
            userData.reports.forEach(report => {
              allReports.push({
                ...report,
                user: userData.user,
                userId: userId,
              });
            });
          }
        });

        setReports(allReports);
        setFilteredReports(allReports);

        // Calculate stats
        const total = allReports.length;
        const submitted = allReports.filter(r => r.status === 'submitted').length;
        const pending = allReports.filter(r => r.status === 'pending' || r.status === 'draft').length;
        const late = allReports.filter(r => r.status === 'late').length;
        const totalHours = allReports.reduce((sum, r) => sum + (r.worked_hours || 0), 0);
        const totalTasks = allReports.reduce((sum, r) => sum + (r.tasks_completed ? r.tasks_completed.length : 0), 0);
        const totalBlockers = allReports.reduce((sum, r) => sum + (r.blockers ? r.blockers.length : 0), 0);

        setStats({
          total,
          submitted,
          pending,
          late,
          totalHours,
          totalTasks,
          totalBlockers,
        });

        // Generate analytics data
        generateAnalytics(allReports);
      }
    } catch (err) {
      setError('Failed to load team reports. Please try again.');
      console.error('Error fetching team reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamReports();
  }, []);

  // Generate analytics data
  const generateAnalytics = (reportsData) => {
    // Submission status distribution
    const statusData = [
      { name: 'Submitted', value: reportsData.filter(r => r.status === 'submitted').length },
      { name: 'Pending', value: reportsData.filter(r => r.status === 'pending' || r.status === 'draft').length },
      { name: 'Late', value: reportsData.filter(r => r.status === 'late').length },
    ].filter(d => d.value > 0);

    // Project distribution
    const projectMap = {};
    reportsData.forEach(r => {
      const project = r.project || 'Uncategorized';
      projectMap[project] = (projectMap[project] || 0) + 1;
    });
    const projectData = Object.entries(projectMap).map(([name, value]) => ({ name, value }));

    // Category distribution
    const categoryMap = {};
    reportsData.forEach(r => {
      const category = r.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Member performance
    const memberMap = {};
    reportsData.forEach(r => {
      const name = r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Unknown';
      if (!memberMap[name]) {
        memberMap[name] = { tasks: 0, hours: 0, reports: 0 };
      }
      memberMap[name].tasks += r.tasks_completed ? r.tasks_completed.length : 0;
      memberMap[name].hours += r.worked_hours || 0;
      memberMap[name].reports += 1;
    });
    const memberData = Object.entries(memberMap).map(([name, data]) => ({
      name,
      tasks: data.tasks,
      hours: data.hours,
      reports: data.reports,
    }));

    // Weekly trend
    const weekMap = {};
    reportsData.forEach(r => {
      const key = `Week ${r.week_number || 'N/A'}`;
      if (!weekMap[key]) {
        weekMap[key] = { submitted: 0, total: 0 };
      }
      weekMap[key].total++;
      if (r.status === 'submitted') weekMap[key].submitted++;
    });
    const trendData = Object.entries(weekMap).map(([name, data]) => ({
      name,
      submitted: data.submitted,
      total: data.total,
    }));

    setAnalyticsData({
      statusData,
      projectData,
      categoryData,
      memberData,
      trendData,
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...reports];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(report => {
        const project = (report.project || '').toLowerCase();
        const category = (report.category || '').toLowerCase();
        const userName = report.user ? `${report.user.first_name} ${report.user.last_name}`.toLowerCase() : '';
        return project.includes(query) || category.includes(query) || userName.includes(query);
      });
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    if (filters.project !== 'all') {
      filtered = filtered.filter(report => report.project === filters.project);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(report => report.category === filters.category);
    }

    if (filters.member !== 'all') {
      filtered = filtered.filter(report => 
        report.user && `${report.user.first_name} ${report.user.last_name}` === filters.member
      );
    }

    setFilteredReports(filtered);
    setPage(1);
  }, [reports, search, filters]);

  // Get unique filter options
  const uniqueProjects = useMemo(() => {
    const projects = new Set();
    reports.forEach(r => {
      if (r.project) projects.add(r.project);
    });
    return ['all', ...Array.from(projects)];
  }, [reports]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    reports.forEach(r => {
      if (r.category) categories.add(r.category);
    });
    return ['all', ...Array.from(categories)];
  }, [reports]);

  const uniqueMembers = useMemo(() => {
    const members = new Set();
    reports.forEach(r => {
      if (r.user) {
        members.add(`${r.user.first_name} ${r.user.last_name}`);
      }
    });
    return ['all', ...Array.from(members)];
  }, [reports]);

  const uniqueWeeks = useMemo(() => {
    const weeks = new Set();
    reports.forEach(r => {
      if (r.week_number) {
        weeks.add(`Week ${r.week_number}, ${r.year}`);
      }
    });
    return ['all', ...Array.from(weeks)];
  }, [reports]);

  // Group reports by week
  const groupedReports = useMemo(() => {
    const groups = {};
    filteredReports.forEach(report => {
      const key = report.week_number ? `Week ${report.week_number}, ${report.year}` : 'Uncategorized';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(report);
    });
    return Object.entries(groups).sort((a, b) => {
      const aNum = parseInt(a[0].split(' ')[1]) || 0;
      const bNum = parseInt(b[0].split(' ')[1]) || 0;
      return bNum - aNum;
    });
  }, [filteredReports]);

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredReports.slice(start, end);
  }, [filteredReports, page, rowsPerPage]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      project: 'all',
      category: 'all',
      week: 'all',
      member: 'all',
    });
    setSearch('');
    setPage(1);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      pending: 'Pending',
      late: 'Late',
      draft: 'Draft',
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Member', 'Project', 'Category', 'Status', 'Tasks Completed', 'Hours', 'Blockers', 'Week'];
    const rows = filteredReports.map(r => [
      r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Unknown',
      r.project || 'N/A',
      r.category || 'N/A',
      getStatusLabel(r.status),
      r.tasks_completed ? r.tasks_completed.length : 0,
      r.worked_hours || 0,
      r.blockers ? r.blockers.length : 0,
      r.week_number ? `Week ${r.week_number}, ${r.year}` : 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            Team Reports
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            View and manage all reports from your team members
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={filteredReports.length === 0}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
            }}
          >
            Export CSV
          </Button>
          <IconButton 
            onClick={fetchTeamReports} 
            sx={{ 
              border: '1px solid #E2E8F0', 
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': { borderColor: '#3B82F6' },
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
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Reports</Typography>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
              {stats.total}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Submitted</Typography>
            <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
              {stats.submitted}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Pending</Typography>
            <Typography variant="h4" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
              {stats.pending}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Blockers</Typography>
            <Typography variant="h4" fontWeight={700} color="#EF4444" sx={{ mt: 0.5 }}>
              {stats.totalBlockers}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Analytics Section */}
      {analyticsData && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
            Analytics Overview
          </Typography>
          <Grid container spacing={3}>
            {/* Status Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 2 }}>
                  Submission Status
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analyticsData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Project Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 2 }}>
                  Reports by Project
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsBarChart data={analyticsData.projectData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Member Performance */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 2 }}>
                  Member Performance
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsBarChart data={analyticsData.memberData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3B82F6" name="Tasks" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hours" fill="#10B981" name="Hours" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Filters */}
      <FilterPaper>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by project, category, or member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
                endAdornment: search && (
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'white',
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
                label="Project"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {uniqueProjects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project === 'all' ? 'All Projects' : project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Member</InputLabel>
              <Select
                value={filters.member}
                onChange={(e) => handleFilterChange('member', e.target.value)}
                label="Member"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {uniqueMembers.map((member) => (
                  <MenuItem key={member} value={member}>
                    {member === 'all' ? 'All Members' : member}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={clearFilters}
              fullWidth
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                borderColor: '#E2E8F0',
                color: '#64748B',
                '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </FilterPaper>

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="#64748B">
          Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="#334155" gutterBottom>No reports found</Typography>
            <Typography variant="body2" color="#94A3B8">
              {reports.length === 0 ? 'No team reports available yet.' : 'Try adjusting your filters.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grouped by Week */}
          {groupedReports.map(([week, weekReports]) => (
            <WeekAccordion key={week} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#1E293B">
                    {week}
                  </Typography>
                  <Chip 
                    label={`${weekReports.length} reports`} 
                    size="small"
                    sx={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}
                  />
                  <Chip 
                    label={`${weekReports.filter(r => r.status === 'submitted').length} submitted`}
                    size="small"
                    sx={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}
                  />
                  {weekReports.filter(r => r.blockers && r.blockers.length > 0).length > 0 && (
                    <Chip 
                      label={`${weekReports.filter(r => r.blockers && r.blockers.length > 0).length} with blockers`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {weekReports.map((report) => (
                    <Grid item xs={12} key={report._id}>
                      <ReportCard>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                                  color: '#3B82F6',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(report.user ? `${report.user.first_name} ${report.user.last_name}` : '')}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600} color="#1E293B">
                                  {report.user ? `${report.user.first_name} ${report.user.last_name}` : 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="#94A3B8">
                                  {report.user?.email || ''}
                                </Typography>
                              </Box>
                            </Box>
                            <StatusChip
                              label={getStatusLabel(report.status)}
                              status={report.status}
                              size="small"
                            />
                          </Box>

                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Work sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="body2" color="#1E293B">
                                  {report.project || 'Uncategorized'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Category sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="body2" color="#1E293B">
                                  {report.category || 'Uncategorized'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="body2" color="#1E293B">
                                  {report.tasks_completed ? report.tasks_completed.length : 0} tasks
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Timeline sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="body2" color="#1E293B">
                                  {report.worked_hours || 0}h
                                </Typography>
                              </Box>
                            </Grid>
                            {report.blockers && report.blockers.length > 0 && (
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Warning sx={{ fontSize: 14, color: '#EF4444' }} />
                                  <Typography variant="caption" color="#EF4444">
                                    {report.blockers.length} blocker{report.blockers.length > 1 ? 's' : ''}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewReport(report)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                color: '#3B82F6',
                                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </ReportCard>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </WeekAccordion>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredReports.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        </>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', padding: '8px' } }}
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#1E293B">
                    Report Details
                  </Typography>
                  <Typography variant="body2" color="#94A3B8">
                    {selectedReport.user ? `${selectedReport.user.first_name} ${selectedReport.user.last_name}` : 'Unknown User'}
                  </Typography>
                </Box>
                <StatusChip
                  label={getStatusLabel(selectedReport.status)}
                  status={selectedReport.status}
                  size="medium"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#94A3B8">Project</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {selectedReport.project || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#94A3B8">Category</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {selectedReport.category || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#94A3B8">Week</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    Week {selectedReport.week_number}, {selectedReport.year}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#94A3B8">Hours Worked</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {selectedReport.worked_hours || 0}h
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="#94A3B8">Tasks Completed</Typography>
                  {selectedReport.tasks_completed && selectedReport.tasks_completed.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      {selectedReport.tasks_completed.map((task, idx) => (
                        <Chip
                          key={idx}
                          label={task}
                          sx={{ mr: 0.5, mb: 0.5, borderRadius: '6px' }}
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                      No tasks completed
                    </Typography>
                  )}
                </Grid>
                {selectedReport.blockers && selectedReport.blockers.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="#EF4444">Blockers</Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedReport.blockers.map((blocker, idx) => (
                        <Chip
                          key={idx}
                          label={blocker}
                          sx={{ mr: 0.5, mb: 0.5, borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                {selectedReport.notes && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="#94A3B8">Notes</Typography>
                    <Typography variant="body2" color="#1E293B" sx={{ mt: 0.5 }}>
                      {selectedReport.notes}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="#94A3B8">Submitted</Typography>
                  <Typography variant="body2" color="#64748B">
                    {selectedReport.submitted_at ? formatDate(selectedReport.submitted_at) : 'Not submitted yet'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button
                onClick={() => setViewDialogOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default TeamReports;