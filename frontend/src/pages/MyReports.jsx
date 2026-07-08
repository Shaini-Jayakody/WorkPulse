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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  FilterList,
  Assessment,
  Add,
  Edit,
  Visibility,
  Delete,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Schedule,
  EventNote,
  ArrowForward,
  Clear,
  Download,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import ReportForm from '../components/reports/ReportForm';
import ReportCard from '../components/reports/ReportCard';

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
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.06)',
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

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    project: 'all',
    category: 'all',
  });
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    draft: 0,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'history'
  const [openForm, setOpenForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'

  // ============================================
  // FETCH REPORTS
  // ============================================

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/reports');
      
      if (response.data.success) {
        const allReports = response.data.data.reports || [];
        setReports(allReports);
        
        // Calculate stats
        const total = allReports.length;
        const submitted = allReports.filter(r => r.status === 'submitted').length;
        const pending = allReports.filter(r => r.status === 'pending').length;
        const draft = allReports.filter(r => r.status === 'draft').length;
        
        setStats({ total, submitted, pending, draft });
      }
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ============================================
  // FILTERS
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

  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(report => {
        const project = (report.project || '').toLowerCase();
        const category = (report.category || '').toLowerCase();
        return project.includes(query) || category.includes(query);
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

    return filtered;
  }, [reports, search, filters]);

  // Organize by week for history view
  const reportsByWeek = useMemo(() => {
    const organized = {};
    filteredReports.forEach(report => {
      const key = `Week ${report.week_number || 'N/A'}, ${report.year || 'N/A'}`;
      if (!organized[key]) {
        organized[key] = [];
      }
      organized[key].push(report);
    });
    return organized;
  }, [filteredReports]);

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredReports.slice(start, end);
  }, [filteredReports, page, rowsPerPage]);

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
    });
    setSearch('');
    setPage(1);
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setFormMode('create');
    setOpenForm(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/view/${reportId}`);
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.delete(`/reports/${reportId}`);
      setSuccess('Report deleted successfully!');
      fetchReports();
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const handleSubmitReport = async (reportId) => {
    if (!window.confirm('Submit this report? You won\'t be able to edit it after submission.')) return;

    try {
      await api.put(`/reports/${reportId}/submit`);
      setSuccess('Report submitted successfully!');
      fetchReports();
    } catch (err) {
      setError('Failed to submit report.');
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedReport(null);
    setFormMode('create');
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setSelectedReport(null);
    setFormMode('create');
    fetchReports();
    setSuccess(`Report ${formMode === 'create' ? 'created' : 'updated'} successfully!`);
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      draft: 'Draft',
      pending: 'Pending',
      late: 'Late',
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            My Reports
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Create, manage, and track your weekly reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tabs
            value={viewMode}
            onChange={(e, val) => setViewMode(val)}
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              minHeight: '36px',
              '& .MuiTab-root': {
                minHeight: '36px',
                fontSize: '13px',
                textTransform: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                '&.Mui-selected': {
                  color: '#3B82F6',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab label="All Reports" value="list" />
            <Tab label="By Week" value="history" />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateReport}
            sx={{
              borderRadius: '12px',
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
          <IconButton 
            onClick={fetchReports} 
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
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Drafts</Typography>
            <Typography variant="h4" fontWeight={700} color="#94A3B8" sx={{ mt: 0.5 }}>
              {stats.draft}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterPaper>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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
          <Grid item xs={4} sm={3} md={2}>
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
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
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
          <Grid item xs={4} sm={3} md={2}>
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
          <Grid item xs={12} md={2}>
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

      {/* Reports List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="#334155" gutterBottom>No reports found</Typography>
            <Typography variant="body2" color="#94A3B8">Create your first report to get started.</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateReport}
              sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}
            >
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <>
          <Grid container spacing={3}>
            {paginatedReports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report._id}>
                <ReportCard
                  report={report}
                  onEdit={handleEditReport}
                  onView={handleViewReport}
                  onDelete={handleDeleteReport}
                  onSubmit={handleSubmitReport}
                />
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
      ) : (
        // History View - Organized by Week
        <Box>
          {Object.entries(reportsByWeek).map(([weekKey, weekReports]) => (
            <Box key={weekKey} sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventNote sx={{ color: '#3B82F6' }} />
                {weekKey}
                <Chip label={`${weekReports.length} reports`} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Grid container spacing={2}>
                {weekReports.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report._id}>
                    <ReportCard
                      report={report}
                      onEdit={handleEditReport}
                      onView={handleViewReport}
                      onDelete={handleDeleteReport}
                      onSubmit={handleSubmitReport}
                      compact
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Report Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h5" fontWeight={700} color="#1E293B">
            {formMode === 'create' ? 'Create New Report' : 'Edit Report'}
          </Typography>
          <Typography variant="body2" color="#64748B">
            {formMode === 'create' ? 'Fill in the details to create your weekly report' : 'Update your report details'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <ReportForm
            report={selectedReport}
            mode={formMode}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MyReports;