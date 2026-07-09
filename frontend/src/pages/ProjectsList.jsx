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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  Visibility,
  Clear,
  Work,
  Category,
  People,
  CalendarToday,
  AttachMoney,
  Flag,
  CheckCircle,
  Schedule,
  Close,
  Description,
  Label,
  EventNote,
  Timeline,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { format } from 'date-fns';

// STYLED COMPONENTS
const ProjectCard = styled(Card)({
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

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    active: '#10B981',
    planning: '#3B82F6',
    on_hold: '#F59E0B',
    completed: '#8B5CF6',
    archived: '#94A3B8',
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

const PriorityChip = styled(Chip)(({ priority }) => {
  const colors = {
    low: '#10B981',
    medium: '#3B82F6',
    high: '#F59E0B',
    critical: '#EF4444',
  };
  const color = colors[priority] || '#64748B';
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '10px',
    height: '20px',
    backgroundColor: `${color}10`,
    color: color,
  };
});

const DetailRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  borderBottom: '1px solid #F1F5F9',
});

const DetailLabel = styled(Typography)({
  color: '#94A3B8',
  fontSize: '13px',
  fontWeight: 500,
  minWidth: '120px',
});

const DetailValue = styled(Typography)({
  color: '#1E293B',
  fontSize: '14px',
  fontWeight: 500,
});

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    planning: 0,
    completed: 0,
    archived: 0,
    on_hold: 0,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/projects');
      
      if (response.data.success) {
        const allProjects = response.data.data.projects || [];
        setProjects(allProjects);
        
        // Calculate stats
        const total = allProjects.length;
        const active = allProjects.filter(p => p.status === 'active').length;
        const planning = allProjects.filter(p => p.status === 'planning').length;
        const completed = allProjects.filter(p => p.status === 'completed').length;
        const archived = allProjects.filter(p => p.status === 'archived').length;
        const on_hold = allProjects.filter(p => p.status === 'on_hold').length;
        
        setStats({ total, active, planning, completed, archived, on_hold });
      }
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filters
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    projects.forEach(project => {
      if (project.category) categories.add(project.category);
    });
    return ['all', ...Array.from(categories)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(project => {
        const name = (project.project_name || '').toLowerCase();
        const description = (project.description || '').toLowerCase();
        const category = (project.category || '').toLowerCase();
        return name.includes(query) || description.includes(query) || category.includes(query);
      });
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(project => project.category === filters.category);
    }

    return filtered;
  }, [projects, search, filters]);

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, page, rowsPerPage]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
    });
    setSearch('');
    setPage(1);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Planning',
      active: 'Active',
      on_hold: 'On Hold',
      completed: 'Completed',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    };
    return labels[priority] || priority;
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            Projects
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Browse and view all projects
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton 
            onClick={fetchProjects} 
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
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total</Typography>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
              {stats.total}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Active</Typography>
            <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
              {stats.active}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Planning</Typography>
            <Typography variant="h4" fontWeight={700} color="#3B82F6" sx={{ mt: 0.5 }}>
              {stats.planning}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>On Hold</Typography>
            <Typography variant="h4" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
              {stats.on_hold}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Completed</Typography>
            <Typography variant="h4" fontWeight={700} color="#8B5CF6" sx={{ mt: 0.5 }}>
              {stats.completed}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4} sm={2}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Archived</Typography>
            <Typography variant="h4" fontWeight={700} color="#94A3B8" sx={{ mt: 0.5 }}>
              {stats.archived}
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
              placeholder="Search projects..."
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
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
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

      {/* Projects List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Work sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="#334155" gutterBottom>No projects found</Typography>
            <Typography variant="body2" color="#94A3B8">There are no projects available at the moment.</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <ProjectCard>
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'rgba(59,130,246,0.08)',
                            color: '#3B82F6',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(project.project_name)}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600} color="#1E293B" noWrap sx={{ flex: 1 }}>
                          {project.project_name}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={getStatusLabel(project.status)}
                        status={project.status}
                        size="small"
                      />
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="#64748B"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {project.description || 'No description provided'}
                    </Typography>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            sx={{ borderRadius: '4px', fontSize: '10px', height: '20px' }}
                          />
                        ))}
                        {project.tags.length > 3 && (
                          <Chip
                            label={`+${project.tags.length - 3}`}
                            size="small"
                            sx={{ borderRadius: '4px', fontSize: '10px', height: '20px' }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Details */}
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Category sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B" noWrap>
                            {project.category || 'Uncategorized'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PriorityChip
                            label={getPriorityLabel(project.priority)}
                            priority={project.priority}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B">
                            {project.assigned_users?.length || 0} members
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B">
                            {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      {project.start_date && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, color: '#94A3B8' }} />
                            <Typography variant="caption" color="#64748B">
                              {formatDate(project.start_date)} {project.end_date && `- ${formatDate(project.end_date)}`}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    {/* Actions */}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Tooltip title="View Details">
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewProject(project)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            color: '#3B82F6',
                            '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                          }}
                        >
                          View Project
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </ProjectCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredProjects.length / rowsPerPage)}
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

      {/* View Project Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '8px',
          },
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#1E293B">
                    {selectedProject.project_name}
                  </Typography>
                  <Typography variant="body2" color="#94A3B8">
                    Project Details
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDialog} sx={{ color: '#94A3B8' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Status and Priority */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <StatusChip
                      label={getStatusLabel(selectedProject.status)}
                      status={selectedProject.status}
                      size="medium"
                    />
                    <PriorityChip
                      label={getPriorityLabel(selectedProject.priority)}
                      priority={selectedProject.priority}
                      size="medium"
                    />
                    {selectedProject.project_id && (
                      <Chip
                        label={`ID: ${selectedProject.project_id}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    )}
                  </Box>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography variant="body2" color="#1E293B">
                      {selectedProject.description || 'No description provided'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Details Grid */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 1 }}>
                    Project Information
                  </Typography>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>Category</DetailLabel>
                          <DetailValue>{selectedProject.category || 'Uncategorized'}</DetailValue>
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>Budget</DetailLabel>
                          <DetailValue>
                            {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'N/A'}
                          </DetailValue>
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>Members</DetailLabel>
                          <DetailValue>{selectedProject.assigned_users?.length || 0}</DetailValue>
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>Status</DetailLabel>
                          <DetailValue>{getStatusLabel(selectedProject.status)}</DetailValue>
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>Start Date</DetailLabel>
                          <DetailValue>{formatDate(selectedProject.start_date)}</DetailValue>
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <DetailLabel>End Date</DetailLabel>
                          <DetailValue>{formatDate(selectedProject.end_date)}</DetailValue>
                        </DetailRow>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Assigned Users */}
                {selectedProject.assigned_users && selectedProject.assigned_users.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 1 }}>
                      Assigned Team Members
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <List dense>
                        {selectedProject.assigned_users.map((user, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6' }}>
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'}
                              secondary={user.email || ''}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                )}

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#64748B" sx={{ mb: 1 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedProject.tags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{ borderRadius: '4px' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Created Info */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="#94A3B8">
                    Created: {formatDate(selectedProject.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                  },
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

export default ProjectList;