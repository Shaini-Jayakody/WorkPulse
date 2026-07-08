import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  FilterList,
  Assessment,
  Person,
  Work,
  Category,
  CalendarToday,
  CheckCircle,
  Pending,
  Error,
  Visibility,
  Download,
  Clear,
  People,
  EventNote,
  Schedule,
  PictureAsPdf,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axiosConfig';

// ============================================
// STYLED COMPONENTS
// ============================================

const ReportCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-2px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
});

const StatsCard = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.06)',
  },
});

const StatusChip = styled(Chip)(({ status }) => {
  const statusColors = {
    submitted: '#10B981',
    pending: '#F59E0B',
    late: '#EF4444',
    draft: '#94A3B8',
  };
  const color = statusColors[status] || '#64748B';
  
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '11px',
    height: '24px',
    backgroundColor: `${color}15`,
    color: color,
  };
});

const FilterPaper = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  marginBottom: '24px',
});

const SubmissionCard = styled(Card)({
  borderRadius: '12px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const getCurrentWeek = () => {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// ============================================
// COMPONENT
// ============================================

const AdminReports = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentWeek = getCurrentWeek();
  const currentYear = currentDate.getFullYear();

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filters, setFilters] = useState({
    status: 'all',
    project: 'all',
    category: 'all',
    user: 'all',
  });
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    late: 0,
  });
  const [submissionStatus, setSubmissionStatus] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [downloading, setDownloading] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  // ============================================
  // FETCH DATA FROM BACKEND
  // ============================================

  const fetchAllData = async () => {
    setLoading(true);
    setError('');

    try {
      const usersRes = await api.get('/auth/users');
      setUsers(usersRes?.data?.data?.users || []);

      const reportsRes = await api.get(`/dashboard/reports/week/${selectedWeek}/${selectedYear}`);
      
      if (reportsRes.data.success) {
        const allReports = [];
        const groupedReports = reportsRes.data.data.reports || {};
        
        Object.keys(groupedReports).forEach(userId => {
          const userData = groupedReports[userId];
          if (userData.reports && userData.reports.length > 0) {
            userData.reports.forEach(report => {
              allReports.push({
                ...report,
                user: userData.user,
              });
            });
          }
        });

        setReports(allReports);
        
        const total = allReports.length;
        const submitted = allReports.filter(r => r.status === 'submitted').length;
        const pending = allReports.filter(r => r.status === 'pending' || r.status === 'draft').length;
        const late = allReports.filter(r => r.status === 'late').length;
        
        setStats({ total, submitted, pending, late });
      }

      await fetchSubmissionStatus();

    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionStatus = async () => {
    try {
      const response = await api.get(`/dashboard/submission/week/${selectedWeek}/${selectedYear}`);
      if (response.data.success) {
        setSubmissionStatus(response.data.data.members || []);
      }
    } catch (err) {
      console.error('Error fetching submission status:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedWeek, selectedYear]);

  // ============================================
  // GET UNIQUE VALUES FOR FILTERS
  // ============================================

  const uniqueProjects = useMemo(() => {
    const projects = new Set();
    reports.forEach(report => {
      if (report.project) projects.add(report.project);
    });
    return ['all', ...Array.from(projects)];
  }, [reports]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    reports.forEach(report => {
      if (report.category) categories.add(report.category);
    });
    return ['all', ...Array.from(categories)];
  }, [reports]);

  const uniqueUsers = useMemo(() => {
    const userSet = new Set();
    reports.forEach(report => {
      if (report.user) {
        const name = `${report.user.first_name} ${report.user.last_name}`;
        userSet.add(name);
      }
    });
    return ['all', ...Array.from(userSet)];
  }, [reports]);

  // ============================================
  // FILTER REPORTS
  // ============================================

  const filteredReports = useMemo(() => {
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

    if (filters.user !== 'all') {
      filtered = filtered.filter(report => {
        if (!report.user) return false;
        const name = `${report.user.first_name} ${report.user.last_name}`;
        return name === filters.user;
      });
    }

    return filtered;
  }, [reports, search, filters]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      project: 'all',
      category: 'all',
      user: 'all',
    });
    setSearch('');
    setPage(1);
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      draft: 'Draft',
      pending: 'Pending',
      late: 'Late',
    };
    return labels[status] || status || 'Unknown';
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getSubmissionStatusColor = (status) => {
    const colors = {
      submitted: '#10B981',
      pending: '#F59E0B',
      late: '#EF4444',
    };
    return colors[status] || '#94A3B8';
  };

  const getSubmissionStatusIcon = (status) => {
    const icons = {
      submitted: <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />,
      pending: <Pending sx={{ fontSize: 16, color: '#F59E0B' }} />,
      late: <Error sx={{ fontSize: 16, color: '#EF4444' }} />,
    };
    return icons[status] || null;
  };

  // ============================================
  // VIEW REPORT HANDLER
  // ============================================

  const handleViewReport = (report) => {
    setViewReport(report);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewReport(null);
  };

  // ============================================
  // DOWNLOAD REPORT AS PDF
  // ============================================

  const downloadReportPDF = async (report) => {
    setDownloading(true);
    
    try {
      // Create a temporary element for PDF generation
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '0';
      tempElement.style.width = '800px';
      tempElement.style.padding = '40px';
      tempElement.style.backgroundColor = '#FFFFFF';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      
      // Build the report content
      tempElement.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #E2E8F0;">
          <img src="/assets/images/logo.png" style="height:40px; width:auto;" alt="WorkPulse" />
          <div>
            <h1 style="font-size:20px; color:#1E293B; margin:0;">${report.project || 'Unnamed Project'}</h1>
            <p style="font-size:12px; color:#94A3B8; margin:4px 0 0 0;">Report Details • Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
          <div style="padding:12px 16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">Project</p>
            <p style="font-size:14px; font-weight:600; color:#1E293B; margin:0;">${report.project || 'N/A'}</p>
          </div>
          <div style="padding:12px 16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">Category</p>
            <p style="font-size:14px; font-weight:600; color:#1E293B; margin:0;">${report.category || 'N/A'}</p>
          </div>
          <div style="padding:12px 16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">Week</p>
            <p style="font-size:14px; font-weight:600; color:#1E293B; margin:0;">${report.week_number || 'N/A'}, ${report.year || 'N/A'}</p>
          </div>
          <div style="padding:12px 16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">Hours Worked</p>
            <p style="font-size:14px; font-weight:600; color:#3B82F6; margin:0;">${report.worked_hours || 0}h</p>
          </div>
          <div style="padding:12px 16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0; grid-column: span 2;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">Date Range</p>
            <p style="font-size:14px; font-weight:600; color:#1E293B; margin:0;">
              ${report.start_date ? new Date(report.start_date).toLocaleDateString() : 'N/A'} - ${report.end_date ? new Date(report.end_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        
        <div style="margin-bottom:16px;">
          <h3 style="font-size:14px; color:#1E293B; margin:0 0 8px 0;">✅ Tasks Completed (${report.tasks_completed?.length || 0})</h3>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${(report.tasks_completed || []).map(task => `<span style="padding:4px 12px; background:#ECFDF5; color:#10B981; border-radius:6px; font-size:12px; border:1px solid #D1FAE5;">${task}</span>`).join('') || '<span style="color:#94A3B8; font-size:12px;">No tasks completed</span>'}
          </div>
        </div>
        
        <div style="margin-bottom:16px;">
          <h3 style="font-size:14px; color:#1E293B; margin:0 0 8px 0;">📋 Tasks Planned (${report.tasks_planned?.length || 0})</h3>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${(report.tasks_planned || []).map(task => `<span style="padding:4px 12px; background:#F5F3FF; color:#8B5CF6; border-radius:6px; font-size:12px; border:1px solid #EDE9FE;">${task}</span>`).join('') || '<span style="color:#94A3B8; font-size:12px;">No tasks planned</span>'}
          </div>
        </div>
        
        <div style="margin-bottom:16px;">
          <h3 style="font-size:14px; color:#1E293B; margin:0 0 8px 0;">⚠️ Blockers (${report.blockers?.length || 0})</h3>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${(report.blockers || []).map(blocker => `<span style="padding:4px 12px; background:#FEF2F2; color:#EF4444; border-radius:6px; font-size:12px; border:1px solid #FEE2E2;">${blocker}</span>`).join('') || '<span style="color:#94A3B8; font-size:12px;">No blockers</span>'}
          </div>
        </div>
        
        ${report.notes ? `
          <div style="margin-top:16px; padding:16px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
            <p style="font-size:11px; color:#94A3B8; margin:0 0 4px 0;">📝 Notes</p>
            <p style="font-size:13px; color:#1E293B; margin:0;">${report.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid #E2E8F0; text-align:center;">
          <p style="font-size:10px; color:#94A3B8; margin:0;">WorkPulse - Confidential Report • Generated: ${new Date().toLocaleString()}</p>
        </div>
      `;
      
      document.body.appendChild(tempElement);
      
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
        width: tempElement.scrollWidth,
        height: tempElement.scrollHeight,
      });
      
      document.body.removeChild(tempElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      let yPosition = 15;
      let remainingHeight = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxContentHeight = pageHeight - 30;
      let pageNum = 1;
      const totalPages = Math.ceil(pdfHeight / maxContentHeight);
      
      while (remainingHeight > 0) {
        const heightForPage = Math.min(remainingHeight, maxContentHeight);
        const widthForPage = imgWidth;
        
        const sourceY = (pdfHeight - remainingHeight) * (canvas.width / imgWidth);
        const sourceHeight = heightForPage * (canvas.width / imgWidth);
        
        if (pageNum > 1) {
          pdf.addPage();
          yPosition = 15;
        }
        
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          yPosition,
          widthForPage,
          heightForPage,
          undefined,
          'FAST',
          0,
          sourceY,
          canvas.width,
          sourceHeight
        );
        
        pdf.setFontSize(8);
        pdf.setTextColor('#94A3B8');
        pdf.text(
          `WorkPulse - Confidential Report | Page ${pageNum} of ${totalPages}`,
          pdfWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        
        remainingHeight -= maxContentHeight;
        pageNum++;
      }
      
      const fileName = `Report_${report.project || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ============================================
  // PAGINATION
  // ============================================

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredReports.slice(start, end);
  }, [filteredReports, page, rowsPerPage]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            Team Reports
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            View all team members' reports with advanced filtering
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            type="number"
            label="Week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value) || getCurrentWeek())}
            sx={{ width: 100 }}
            inputProps={{ min: 1, max: 53 }}
          />
          <TextField
            size="small"
            type="number"
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            sx={{ width: 100 }}
            inputProps={{ min: 2000, max: 2100 }}
          />
          <IconButton 
            onClick={fetchAllData} 
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

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Late</Typography>
            <Typography variant="h4" fontWeight={700} color="#EF4444" sx={{ mt: 0.5 }}>
              {stats.late}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterPaper>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search reports..."
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
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.8}>
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.8}>
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
          <Grid item xs={6} sm={3} md={1.8}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.8}>
            <FormControl fullWidth size="small">
              <InputLabel>User</InputLabel>
              <Select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                label="User"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                {uniqueUsers.map((user) => (
                  <MenuItem key={user} value={user}>
                    {user === 'all' ? 'All Users' : user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={0.8}>
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

      {/* Submission Status Section */}
      {submissionStatus.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
            Submission Status by Team Member
          </Typography>
          <Grid container spacing={2}>
            {submissionStatus.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <SubmissionCard>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6', width: 40, height: 40 }}>
                        {getInitials(member.user)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">
                          {member.user?.first_name} {member.user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          {member.user?.email}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getSubmissionStatusIcon(member.status)}
                        label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: `${getSubmissionStatusColor(member.status)}15`,
                          color: getSubmissionStatusColor(member.status),
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      />
                    </Box>
                  </CardContent>
                </SubmissionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="#334155" gutterBottom>No reports found</Typography>
            <Typography variant="body2" color="#94A3B8">Try adjusting your search or filter criteria.</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedReports.map((report) => (
              <Grid item xs={12} key={report._id}>
                <ReportCard>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3B82F6',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(report.user)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="#1E293B">
                              {report.user ? `${report.user.first_name} ${report.user.last_name}` : 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="#94A3B8">
                              {report.user?.email || ''}
                            </Typography>
                          </Box>
                          <StatusChip
                            label={getStatusLabel(report.status)}
                            status={report.status}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ ml: 7 }}>
                          <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 0.5 }}>
                            {report.project || 'Unnamed Project'}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip
                              icon={<Category sx={{ fontSize: 14 }} />}
                              label={report.category || 'Uncategorized'}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '6px' }}
                            />
                            <Chip
                              icon={<CalendarToday sx={{ fontSize: 14 }} />}
                              label={`Week ${report.week_number || 'N/A'}, ${report.year || ''}`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '6px' }}
                            />
                            {report.worked_hours > 0 && (
                              <Chip
                                label={`${report.worked_hours}h`}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: '6px' }}
                              />
                            )}
                          </Stack>
                          
                          {report.tasks_completed && report.tasks_completed.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              <Typography variant="caption" color="#94A3B8" sx={{ mr: 1 }}>
                                Completed:
                              </Typography>
                              {report.tasks_completed.slice(0, 3).map((task, idx) => (
                                <Chip
                                  key={idx}
                                  label={task.length > 30 ? `${task.substring(0, 30)}...` : task}
                                  size="small"
                                  sx={{
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                                    color: '#10B981',
                                    fontSize: '11px',
                                  }}
                                />
                              ))}
                              {report.tasks_completed.length > 3 && (
                                <Chip
                                  label={`+${report.tasks_completed.length - 3} more`}
                                  size="small"
                                  sx={{ borderRadius: '6px', fontSize: '11px' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
                          {/* ✅ View Button */}
                          <Tooltip title="View Report">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewReport(report)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#E2E8F0',
                                color: '#64748B',
                                '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
                              }}
                            >
                              View
                            </Button>
                          </Tooltip>
                          
                          {/* ✅ Download Button */}
                          <Tooltip title="Download PDF">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
                              onClick={() => downloadReportPDF(report)}
                              disabled={downloading}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#E2E8F0',
                                color: '#64748B',
                                '&:hover': { borderColor: '#EF4444', color: '#EF4444' },
                              }}
                            >
                              {downloading ? '...' : 'PDF'}
                            </Button>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </ReportCard>
              </Grid>
            ))}
          </Grid>

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

      {/* ✅ View Report Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxHeight: '80vh',
          },
        }}
      >
        {viewReport && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#1E293B">
                    {viewReport.project || 'Unnamed Project'}
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    {viewReport.category || 'Uncategorized'} • Week {viewReport.week_number || 'N/A'}, {viewReport.year || 'N/A'}
                  </Typography>
                </Box>
                <StatusChip
                  label={getStatusLabel(viewReport.status)}
                  status={viewReport.status}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="caption" color="#94A3B8">Date Range</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {viewReport.start_date ? new Date(viewReport.start_date).toLocaleDateString() : 'N/A'} - {viewReport.end_date ? new Date(viewReport.end_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="caption" color="#94A3B8">Hours Worked</Typography>
                    <Typography variant="body2" fontWeight={500} color="#3B82F6">
                      {viewReport.worked_hours || 0}h
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Tasks Completed ({viewReport.tasks_completed?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(viewReport.tasks_completed || []).map((task, idx) => (
                      <Chip
                        key={idx}
                        label={task}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: 'rgba(16,185,129,0.06)',
                          color: '#10B981',
                        }}
                      />
                    ))}
                    {(!viewReport.tasks_completed || viewReport.tasks_completed.length === 0) && (
                      <Typography color="#94A3B8" variant="body2">No tasks completed</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Tasks Planned ({viewReport.tasks_planned?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(viewReport.tasks_planned || []).map((task, idx) => (
                      <Chip
                        key={idx}
                        label={task}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: 'rgba(139,92,246,0.06)',
                          color: '#8B5CF6',
                        }}
                      />
                    ))}
                    {(!viewReport.tasks_planned || viewReport.tasks_planned.length === 0) && (
                      <Typography color="#94A3B8" variant="body2">No tasks planned</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Blockers ({viewReport.blockers?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(viewReport.blockers || []).map((blocker, idx) => (
                      <Chip
                        key={idx}
                        label={blocker}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239,68,68,0.06)',
                          color: '#EF4444',
                        }}
                      />
                    ))}
                    {(!viewReport.blockers || viewReport.blockers.length === 0) && (
                      <Typography color="#94A3B8" variant="body2">No blockers</Typography>
                    )}
                  </Box>
                </Grid>
                {viewReport.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                      Notes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                      <Typography variant="body2" color="#1E293B">
                        {viewReport.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseViewDialog}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => {
                  downloadReportPDF(viewReport);
                  handleCloseViewDialog();
                }}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  },
                }}
              >
                Download PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminReports;