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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
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
} from '@mui/icons-material';
import api from '../api/axiosConfig';


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


// COMPONENT
const Projects = () => {
  const navigate = useNavigate();
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
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null });
  const [archiveDialog, setArchiveDialog] = useState({ open: false, project: null });


  // FETCH PROJECTS
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
        
        setStats({ total, active, planning, completed });
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

 
  // FILTERS
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

  // HANDLERS
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

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleEditProject = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/view/${projectId}`);
  };

  const handleDeleteProject = async () => {
    const project = deleteDialog.project;
    if (!project) return;

    try {
      await api.delete(`/projects/${project._id}`);
      setSuccess('Project deleted successfully!');
      setDeleteDialog({ open: false, project: null });
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  const handleArchiveProject = async () => {
    const project = archiveDialog.project;
    if (!project) return;

    try {
      await api.put(`/projects/${project._id}/archive`);
      setSuccess('Project archived successfully!');
      setArchiveDialog({ open: false, project: null });
      fetchProjects();
    } catch (err) {
      setError('Failed to archive project.');
    }
  };

  const handleRestoreProject = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}/restore`);
      setSuccess('Project restored successfully!');
      fetchProjects();
    } catch (err) {
      setError('Failed to restore project.');
    }
  };

  const openDeleteDialog = (project) => {
    setDeleteDialog({ open: true, project });
  };

  const openArchiveDialog = (project) => {
    setArchiveDialog({ open: true, project });
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

 
  // RENDER
  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            Projects
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Manage all your projects and track their progress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateProject}
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
            New Project
          </Button>
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
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Projects</Typography>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
              {stats.total}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Active</Typography>
            <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
              {stats.active}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Planning</Typography>
            <Typography variant="h4" fontWeight={700} color="#3B82F6" sx={{ mt: 0.5 }}>
              {stats.planning}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Completed</Typography>
            <Typography variant="h4" fontWeight={700} color="#8B5CF6" sx={{ mt: 0.5 }}>
              {stats.completed}
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
            <Typography variant="body2" color="#94A3B8">Create your first project to get started.</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateProject}
              sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}
            >
              Create Project
            </Button>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewProject(project._id)}
                            sx={{ color: '#64748B' }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditProject(project._id)}
                            sx={{ color: '#3B82F6' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {project.status !== 'archived' ? (
                          <Tooltip title="Archive">
                            <IconButton
                              size="small"
                              onClick={() => openArchiveDialog(project)}
                              sx={{ color: '#F59E0B' }}
                            >
                              <Archive fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Restore">
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreProject(project._id)}
                              sx={{ color: '#10B981' }}
                            >
                              <Restore fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(project)}
                            sx={{ color: '#EF4444' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, project: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', padding: '8px' } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            Delete Project?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="#64748B">
            Are you sure you want to delete "{deleteDialog.project?.project_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, project: null })}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{ borderRadius: '10px', textTransform: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, project: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', padding: '8px' } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            Archive Project?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="#64748B">
            Are you sure you want to archive "{archiveDialog.project?.project_name}"? It will be moved to archived status.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setArchiveDialog({ open: false, project: null })}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleArchiveProject}
            variant="contained"
            startIcon={<Archive />}
            sx={{ borderRadius: '10px', textTransform: 'none', background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;