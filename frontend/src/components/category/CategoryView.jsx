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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Category,
  Description,
  ColorLens,
  Person,
  CalendarToday,
  Edit,
  Delete,
  CheckCircle,
  Block,
  Folder,
  Label,
  Work,
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

const StatusChip = styled(Chip)(({ isActive }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '12px',
  height: '28px',
  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
  color: isActive ? '#10B981' : '#94A3B8',
}));

const ColorPreview = styled(Box)(({ color }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: color || '#6B7280',
  border: '2px solid white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  flexShrink: 0,
}));

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
const CategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // FETCH CATEGORY
  const fetchCategory = async () => {
    try {
      const response = await api.get(`/categories/${id}`);
      if (response.data.success) {
        setCategory(response.data.data.category);
      }
    } catch (err) {
      setError('Failed to load category details');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // HANDLERS
  const handleEdit = () => {
    navigate(`/categories/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setDeleting(true);
    try {
      await api.delete(`/categories/${id}`);
      navigate('/categories');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category. Please ensure no projects are using this category.');
      setDeleting(false);
    }
  };

  const handleNavigateToProjects = () => {
    navigate('/projects', { state: { categoryFilter: category.name } });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
          Category not found
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
            onClick={() => navigate('/categories')}
            sx={{ 
              bgcolor: 'white', 
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: `${category.color || '#6B7280'}20`,
                  color: category.color || '#6B7280',
                  fontSize: '24px',
                }}
              >
                {category.icon || <Category />}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
                  {category.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                  <StatusChip
                    label={category.is_active !== false ? 'Active' : 'Inactive'}
                    isActive={category.is_active !== false}
                    size="small"
                  />
                  {category.category_id && (
                    <Chip
                      icon={<Label sx={{ fontSize: 14 }} />}
                      label={`ID: ${category.category_id}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: '6px' }}
                    />
                  )}
                  <Chip
                    icon={<Folder sx={{ fontSize: 14 }} />}
                    label={`${category.project_count || 0} projects`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: '6px' }}
                  />
                </Box>
              </Box>
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
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deleting || category.project_count > 0}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#EF4444',
              color: '#EF4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {deleting ? 'Deleting...' : category.project_count > 0 ? 'Cannot Delete' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {/* Category Content */}
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
                    {category.description || 'No description provided'}
                  </Typography>
                </Paper>
              </Box>

              {/* Details Grid */}
              <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                Category Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DetailCard>
                    <InfoRow>
                      <InfoLabel>Name</InfoLabel>
                      <InfoValue>{category.name}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Category ID</InfoLabel>
                      <InfoValue>{category.category_id || 'Auto-generated'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Color</InfoLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ColorPreview color={category.color} sx={{ width: 24, height: 24 }} />
                        <InfoValue>{category.color || '#6B7280'}</InfoValue>
                      </Box>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Icon</InfoLabel>
                      <InfoValue sx={{ fontSize: '24px' }}>{category.icon || '📁'}</InfoValue>
                    </InfoRow>
                  </DetailCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailCard>
                    <InfoRow>
                      <InfoLabel>Status</InfoLabel>
                      <StatusChip
                        label={category.is_active !== false ? 'Active' : 'Inactive'}
                        isActive={category.is_active !== false}
                        size="small"
                      />
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Projects</InfoLabel>
                      <InfoValue>{category.project_count || 0}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Created By</InfoLabel>
                      <InfoValue>
                        {category.created_by?.first_name || 'Unknown'} {category.created_by?.last_name || ''}
                      </InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Created</InfoLabel>
                      <InfoValue>{formatDate(category.createdAt)}</InfoValue>
                    </InfoRow>
                  </DetailCard>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Summary Card */}
          <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                Category Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="#94A3B8">Total Projects</Typography>
                  <Typography variant="h6" fontWeight={700} color="#1E293B">
                    {category.project_count || 0}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Status</Typography>
                  <Typography variant="h6" fontWeight={700} color={category.is_active !== false ? '#10B981' : '#94A3B8'}>
                    {category.is_active !== false ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Color</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <ColorPreview color={category.color} sx={{ width: 32, height: 32 }} />
                    <Typography variant="body2" color="#1E293B">
                      {category.color || '#6B7280'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="#94A3B8">Icon</Typography>
                  <Typography variant="h5" sx={{ mt: 0.5 }}>
                    {category.icon || '📁'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Projects in this Category */}
          {category.project_count > 0 && (
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                  Projects in this Category
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', py: 2 }}>
                  <Folder sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                  <Typography variant="h3" fontWeight={700} color="#1E293B">
                    {category.project_count}
                  </Typography>
                  <Typography variant="body2" color="#94A3B8" sx={{ mb: 2 }}>
                    {category.project_count === 1 ? 'project' : 'projects'} using this category
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Work />}
                    onClick={handleNavigateToProjects}
                    size="small"
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      borderColor: '#3B82F6',
                      color: '#3B82F6',
                      '&:hover': { bgcolor: 'rgba(59,130,246,0.04)' },
                    }}
                  >
                    View All Projects
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CategoryView;