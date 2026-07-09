import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Work,
  Category,
  People,
  CalendarToday,
  AttachMoney,
  Flag,
  Settings,
  Edit,
  Delete,
  Archive,
  Restore,
  CheckCircle,
  Pending,
  Schedule,
  Block,
  Link as LinkIcon,
} from '@mui/icons-material';
import api from '../../api/axiosConfig';

// STYLED COMPONENTS
const DetailCard = styled(Paper)({
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: '#F8FAFC',
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'rgba(59, 130, 246, 0.15)',
    background: '#FFFFFF',
  },
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
    fontSize: '12px',
    height: '28px',
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
    fontSize: '11px',
    height: '24px',
    backgroundColor: `${color}10`,
    color: color,
  };
});

const InfoRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  '&:not(:last-child)': {
    borderBottom: '1px solid #F1F5F9',
  },
});

const InfoLabel = styled(Typography)({
  color: '#94A3B8',
  fontSize: '13px',
  fontWeight: 500,
  minWidth: '120px',
});

const InfoValue = styled(Typography)({
  color: '#1E293B',
  fontSize: '14px',
  fontWeight: 500,
});


// COMPONENT
const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // FETCH PROJECT
  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      if (response.data.success) {
        setProject(response.data.data.project);
      }
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // HANDLERS
  const handleEdit = () => {
    navigate(`/projects/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError('Failed to delete project');
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this project?')) return;
    
    try {
      await api.put(`/projects/${id}/archive`);
      fetchProject();
    } catch (err) {
      setError('Failed to archive project');
    }
  };

  const handleRestore = async () => {
    try {
      await api.put(`/projects/${id}/restore`);
      fetchProject();
    } catch (err) {
      setError('Failed to restore project');
    }
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // RENDER
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/projects')}
            sx={{ 
              bgcolor: 'white', 
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
              {project.project_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<Category sx={{ fontSize: 14 }} />}
                label={project.category || 'Uncategorized'}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '6px' }}
              />
              <StatusChip
                label={getStatusLabel(project.status)}
                status={project.status}
                size="small"
              />
              <PriorityChip
                label={getPriorityLabel(project.priority)}
                priority={project.priority}
                size="small"
              />
              {project.project_id && (
                <Chip
                  label={`ID: ${project.project_id}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: '6px', fontSize: '10px' }}
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#3B82F6',
              color: '#3B82F6',
              '&:hover': { bgcolor: 'rgba(59,130,246,0.04)' },
            }}
          >
            Edit
          </Button>
          {project.status !== 'archived' ? (
            <Button
              variant="outlined"
              startIcon={<Archive />}
              onClick={handleArchive}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: '#F59E0B',
                color: '#F59E0B',
                '&:hover': { bgcolor: 'rgba(245,158,11,0.04)' },
              }}
            >
              Archive
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleRestore}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: '#10B981',
                color: '#10B981',
                '&:hover': { bgcolor: 'rgba(16,185,129,0.04)' },
              }}
            >
              Restore
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#EF4444',
              color: '#EF4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {/* Project Content */}
      <Grid container spacing={3}>
        {/* Left Column - Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Description */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Description
                </Typography>
                <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography variant="body1" color="#1E293B">
                    {project.description || 'No description provided'}
                  </Typography>
                </Paper>
              </Box>

              {/* Details Grid */}
              <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DetailCard>
                    <InfoRow>
                      <InfoLabel>Project Name</InfoLabel>
                      <InfoValue>{project.project_name}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Category</InfoLabel>
                      <InfoValue>{project.category || 'N/A'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Priority</InfoLabel>
                      <PriorityChip
                        label={getPriorityLabel(project.priority)}
                        priority={project.priority}
                        size="small"
                      />
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Status</InfoLabel>
                      <StatusChip
                        label={getStatusLabel(project.status)}
                        status={project.status}
                        size="small"
                      />
                    </InfoRow>
                  </DetailCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailCard>
                    <InfoRow>
                      <InfoLabel>Budget</InfoLabel>
                      <InfoValue>
                        {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}
                      </InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Start Date</InfoLabel>
                      <InfoValue>{formatDate(project.start_date)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>End Date</InfoLabel>
                      <InfoValue>{formatDate(project.end_date)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Project ID</InfoLabel>
                      <InfoValue>{project.project_id || 'N/A'}</InfoValue>
                    </InfoRow>
                  </DetailCard>
                </Grid>
              </Grid>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        sx={{
                          borderRadius: '6px',
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: '#6366F1',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Summary Card */}
          <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                Project Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="#94A3B8">Assigned Users</Typography>
                  <Typography variant="h6" fontWeight={700} color="#1E293B">
                    {project.assigned_users?.length || 0}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Budget</Typography>
                  <Typography variant="h6" fontWeight={700} color="#10B981">
                    {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Tags Count</Typography>
                  <Typography variant="h6" fontWeight={700} color="#6366F1">
                    {project.tags?.length || 0}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Created</Typography>
                  <Typography variant="body2" color="#1E293B">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Assigned Users */}
          {project.assigned_users && project.assigned_users.length > 0 && (
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                  Assigned Team
                </Typography>
                <Stack spacing={1.5}>
                  {project.assigned_users.map((user, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontSize: '12px' }}>
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} color="#1E293B">
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectView;