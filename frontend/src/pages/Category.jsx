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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Clear,
  Category,
  ColorLens,
  Description,
  Person,
  CheckCircle,
  Block,
  Folder,
  Label,
} from '@mui/icons-material';
import api from '../api/axiosConfig';

// STYLED COMPONENTS
const CategoryCard = styled(Card)({
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

const ColorPreview = styled(Box)(({ color }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: color || '#6B7280',
  border: '2px solid white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  flexShrink: 0,
}));

const StatusChip = styled(Chip)(({ isActive }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '11px',
  height: '24px',
  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
  color: isActive ? '#10B981' : '#94A3B8',
}));

// COMPONENT
const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/categories');
      
      if (response.data.success) {
        const allCategories = response.data.data.categories || [];
        setCategories(allCategories);
        
        // Calculate stats
        const total = allCategories.length;
        const active = allCategories.filter(c => c.is_active !== false).length;
        const inactive = allCategories.filter(c => c.is_active === false).length;
        
        setStats({ total, active, inactive });
      }
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // FILTERS
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(category => {
        const name = (category.name || '').toLowerCase();
        const description = (category.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(category => category.is_active !== false);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(category => category.is_active === false);
    }

    return filtered;
  }, [categories, search, filterStatus]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, page, rowsPerPage]);

  // HANDLERS
  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setPage(1);
  };

  const handleCreateCategory = () => {
    navigate('/categories/create');
  };

  const handleEditCategory = (categoryId) => {
    navigate(`/categories/edit/${categoryId}`);
  };

  const handleViewCategory = (categoryId) => {
    navigate(`/categories/view/${categoryId}`);
  };

  const handleDeleteCategory = async () => {
    const category = deleteDialog.category;
    if (!category) return;

    try {
      await api.delete(`/categories/${category._id}`);
      setSuccess('Category deleted successfully!');
      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category. Please ensure no projects are using this category.');
    }
  };

  const openDeleteDialog = (category) => {
    setDeleteDialog({ open: true, category });
  };

  const getInitials = (name) => {
    if (!name) return 'C';
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
            Categories
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Manage your project categories and organize your workflow
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCategory}
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
            New Category
          </Button>
          <IconButton 
            onClick={fetchCategories} 
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
        <Grid item xs={6} sm={4}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Categories</Typography>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
              {stats.total}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Active</Typography>
            <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
              {stats.active}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Inactive</Typography>
            <Typography variant="h4" fontWeight={700} color="#94A3B8" sx={{ mt: 0.5 }}>
              {stats.inactive}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterPaper>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search categories..."
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
          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
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

      {/* Categories List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
        </Box>
      ) : filteredCategories.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Category sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" color="#334155" gutterBottom>No categories found</Typography>
            <Typography variant="body2" color="#94A3B8">Create your first category to organize your projects.</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateCategory}
              sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}
            >
              Create Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <CategoryCard>
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor: `${category.color || '#6B7280'}20`,
                            color: category.color || '#6B7280',
                            fontSize: '20px',
                            fontWeight: 600,
                          }}
                        >
                          {category.icon || <Category />}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} color="#1E293B" noWrap>
                            {category.name}
                          </Typography>
                          {category.category_id && (
                            <Typography variant="caption" color="#94A3B8" noWrap>
                              ID: {category.category_id}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <StatusChip
                        label={category.is_active !== false ? 'Active' : 'Inactive'}
                        isActive={category.is_active !== false}
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
                      {category.description || 'No description provided'}
                    </Typography>

                    {/* Color Preview */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ColorPreview color={category.color} />
                      <Typography variant="caption" color="#94A3B8">
                        {category.color || '#6B7280'}
                      </Typography>
                    </Box>

                    {/* Details */}
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Folder sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B">
                            {category.project_count || 0} projects
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Person sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B" noWrap>
                            {category.created_by?.first_name || 'Unknown'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Description sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" color="#64748B">
                            Created: {formatDate(category.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Actions */}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewCategory(category._id)}
                            sx={{ color: '#64748B' }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category._id)}
                            sx={{ color: '#3B82F6' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(category)}
                            sx={{ color: '#EF4444' }}
                            disabled={category.project_count > 0}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </CategoryCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredCategories.length / rowsPerPage)}
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
        onClose={() => setDeleteDialog({ open: false, category: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', padding: '8px' } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            Delete Category?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="#64748B">
            {deleteDialog.category?.project_count > 0 ? (
              <>
                Cannot delete "{deleteDialog.category?.name}" because it has {deleteDialog.category?.project_count} project(s) associated with it. 
                Please reassign or remove these projects first.
              </>
            ) : (
              <>
                Are you sure you want to delete "{deleteDialog.category?.name}"? This action cannot be undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, category: null })}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCategory}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={deleteDialog.category?.project_count > 0}
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              },
              '&:disabled': {
                background: '#CBD5E1',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Categories;