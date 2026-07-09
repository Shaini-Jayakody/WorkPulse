import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Typography,
  FormHelperText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Slider,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Save,
  Cancel,
  CheckCircle,
  Error as ErrorIcon,
  Close as CloseIcon,
  Category,
  Description,
  ColorLens,
  Tag,
  Person,
} from '@mui/icons-material';
import api from '../../api/axiosConfig';


// STYLED COMPONENTS
const FormField = styled(TextField)(({ hasError, isValid }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F1F5F9',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.08)',
    },
    '& fieldset': {
      borderColor: hasError ? '#EF4444' : isValid ? '#10B981' : '#E2E8F0',
      borderWidth: hasError || isValid ? '2px' : '1px',
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#EF4444' : isValid ? '#10B981' : '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#EF4444' : isValid ? '#10B981' : '#3B82F6',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748B',
    fontWeight: 500,
    '&.Mui-focused': {
      color: hasError ? '#EF4444' : isValid ? '#10B981' : '#3B82F6',
    },
  },
  '& .MuiFormHelperText-root': {
    color: hasError ? '#EF4444' : '#94A3B8',
    marginLeft: 4,
  },
}));

const ColorPreview = styled(Box)(({ color }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: color || '#6B7280',
  border: '2px solid white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  flexShrink: 0,
  transition: 'all 0.3s ease',
}));

const ColorPickerOption = styled(Box)(({ selected, color }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: color,
  cursor: 'pointer',
  border: selected ? '3px solid #3B82F6' : '2px solid transparent',
  boxShadow: selected ? '0 0 0 2px white, 0 0 0 4px #3B82F6' : '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
}));

const FormHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #E2E8F0',
});

const ValidationBadge = styled(Box)(({ valid }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: valid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
  color: valid ? '#10B981' : '#EF4444',
}));


// VALIDATION SCHEMA
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_&]+$/, 'Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
  
  category_id: Yup.string()
    .max(50, 'Cannot exceed 50 characters')
    .trim()
    .matches(/^[a-zA-Z0-9\-_]+$/, 'Category ID can only contain letters, numbers, hyphens, and underscores')
    .nullable(),
  
  description: Yup.string()
    .max(200, 'Cannot exceed 200 characters')
    .trim(),
  
  color: Yup.string()
    .required('Color is required')
    .matches(/^#[0-9a-fA-F]{6}$/, 'Please provide a valid hex color code'),
  
  icon: Yup.string()
    .max(5, 'Icon should be a single emoji or character')
    .nullable(),
  
  is_active: Yup.boolean(),
});


// COMPONENT
const CategoryForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Predefined colors
  const predefinedColors = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
    '#84CC16', '#D946EF', '#6B7280', '#1F2937', '#DC2626',
  ];

  // Predefined icons
  const predefinedIcons = ['📁', '📊', '💼', '🎯', '🚀', '💡', '📈', '🏗️', '🎨', '⚡', '🌟', '🔧', '📋', '🛠️', '💎'];

  
  // FETCH DATA
  const fetchCategory = async () => {
    if (mode === 'create') return;
    
    try {
      const response = await api.get(`/categories/${id}`);
      if (response.data.success) {
        const category = response.data.data.category;
        formik.setValues({
          name: category.name || '',
          category_id: category.category_id || '',
          description: category.description || '',
          color: category.color || '#6B7280',
          icon: category.icon || '📁',
          is_active: category.is_active !== undefined ? category.is_active : true,
        });
      }
    } catch (err) {
      setError('Failed to load category data.');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit') {
      fetchCategory();
    } else {
      setFetchLoading(false);
    }
  }, []);


  // FORM SETUP
  const formik = useFormik({
    initialValues: {
      name: '',
      category_id: '',
      description: '',
      color: '#3B82F6',
      icon: '📁',
      is_active: true,
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        // Clean up empty category_id
        const submitValues = {
          ...values,
          category_id: values.category_id?.trim() || undefined,
        };

        const url = mode === 'create' ? '/categories' : `/categories/${id}`;
        const method = mode === 'create' ? 'post' : 'put';
        
        const response = await api[method](url, submitValues);
        
        if (response.data.success) {
          setSuccess(`Category ${mode === 'create' ? 'created' : 'updated'} successfully!`);
          setTimeout(() => navigate('/categories'), 1500);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save category.');
      } finally {
        setLoading(false);
      }
    },
  });

  
  // HANDLERS
  const handleClose = () => {
    const hasValues = Object.values(formik.values).some(value => {
      if (typeof value === 'boolean') return false;
      return value && value !== '';
    });

    if (hasValues || mode === 'edit') {
      setOpenConfirmDialog(true);
    } else {
      navigate('/categories');
    }
  };

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
    navigate('/categories');
  };

  const getFieldStatus = (fieldName) => {
    const touched = formik.touched[fieldName];
    const error = formik.errors[fieldName];
    const value = formik.values[fieldName];
    
    if (!touched && !value) return 'idle';
    if (touched && error) return 'error';
    if (touched && value && !error) return 'valid';
    return 'idle';
  };

  const getFieldIcon = (fieldName) => {
    const status = getFieldStatus(fieldName);
    if (status === 'error') return <ErrorIcon sx={{ color: '#EF4444', fontSize: 18 }} />;
    if (status === 'valid') return <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />;
    return null;
  };

  const isFormValid = () => {
    return formik.isValid && formik.dirty && !loading;
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ py: 3, maxWidth: '800px', mx: 'auto' }}>
        {/* Header */}
        <FormHeader>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {mode === 'create' ? 'Create New Category' : 'Edit Category'}
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              {mode === 'create' ? 'Add a new category to organize your projects' : 'Update your category details'}
            </Typography>
          </Box>
          <Tooltip title="Close">
            <IconButton
              onClick={handleClose}
              sx={{
                color: '#94A3B8',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </FormHeader>

        {/* Messages */}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Category Name */}
            <Grid item xs={12}>
              <FormField
                fullWidth
                label="Category Name *"
                name="name"
                placeholder="Enter category name (e.g., Frontend, Backend, Design)"
                size="medium"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('name') === 'error'}
                isValid={getFieldStatus('name') === 'valid'}
                helperText={formik.touched.name && formik.errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('name')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

           

            {/* Description */}
            <Grid item xs={12}>
              <FormField
                fullWidth
                label="Description"
                name="description"
                placeholder="Enter category description"
                size="medium"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('description') === 'error'}
                isValid={getFieldStatus('description') === 'valid'}
                helperText={formik.touched.description && formik.errors.description}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('description')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Color Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ColorLens sx={{ fontSize: 18, color: '#94A3B8' }} />
                Color *
                <ValidationBadge valid>
                  {formik.values.color}
                </ValidationBadge>
              </Typography>
              
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <ColorPreview color={formik.values.color} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="#64748B" display="block" sx={{ mb: 0.5 }}>
                      Selected Color
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#1E293B">
                      {formik.values.color}
                    </Typography>
                  </Box>
                  <FormField
                    size="small"
                    name="color"
                    value={formik.values.color}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="#000000"
                    sx={{ width: '140px' }}
                    hasError={getFieldStatus('color') === 'error'}
                    isValid={getFieldStatus('color') === 'valid'}
                    helperText={formik.touched.color && formik.errors.color}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {predefinedColors.map((color) => (
                    <ColorPickerOption
                      key={color}
                      color={color}
                      selected={formik.values.color === color}
                      onClick={() => formik.setFieldValue('color', color)}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Icon Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Icon
                <ValidationBadge valid>
                  {formik.values.icon || '📁'}
                </ValidationBadge>
              </Typography>
              
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    bgcolor: `${formik.values.color}20`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}>
                    {formik.values.icon || '📁'}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="#64748B" display="block" sx={{ mb: 0.5 }}>
                      Selected Icon
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#1E293B">
                      {formik.values.icon || '📁'}
                    </Typography>
                  </Box>
                  <FormField
                    size="small"
                    name="icon"
                    value={formik.values.icon}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="📁"
                    sx={{ width: '140px' }}
                    hasError={getFieldStatus('icon') === 'error'}
                    isValid={getFieldStatus('icon') === 'valid'}
                    helperText={formik.touched.icon && formik.errors.icon}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {predefinedIcons.map((icon) => (
                    <Chip
                      key={icon}
                      label={icon}
                      onClick={() => formik.setFieldValue('icon', icon)}
                      sx={{
                        fontSize: '16px',
                        minWidth: '40px',
                        borderRadius: '8px',
                        backgroundColor: formik.values.icon === icon ? `${formik.values.color}20` : 'transparent',
                        border: formik.values.icon === icon ? `2px solid ${formik.values.color}` : '1px solid #E2E8F0',
                        '&:hover': {
                          backgroundColor: `${formik.values.color}10`,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Status Toggle */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ color: '#94A3B8', fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="#1E293B">
                      Status
                    </Typography>
                    <Typography variant="caption" color="#94A3B8">
                      {formik.values.is_active ? 'Active categories can be used in projects' : 'Inactive categories are hidden from selection'}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Button
                      variant={formik.values.is_active ? 'contained' : 'outlined'}
                      onClick={() => formik.setFieldValue('is_active', !formik.values.is_active)}
                      size="small"
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        minWidth: '100px',
                        background: formik.values.is_active 
                          ? 'linear-gradient(135deg, #10B981, #059669)'
                          : 'transparent',
                        borderColor: formik.values.is_active ? 'transparent' : '#CBD5E1',
                        color: formik.values.is_active ? 'white' : '#64748B',
                        '&:hover': {
                          background: formik.values.is_active 
                            ? 'linear-gradient(135deg, #059669, #047857)'
                            : '#F1F5F9',
                        },
                      }}
                    >
                      {formik.values.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: '1px solid #E2E8F0',
              }}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={loading}
                  startIcon={<Cancel />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderColor: '#E2E8F0',
                    color: '#64748B',
                    padding: '10px 32px',
                    '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isFormValid()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    padding: '10px 32px',
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                      boxShadow: '0 6px 24px rgba(59, 130, 246, 0.35)',
                    },
                    '&:disabled': {
                      background: '#CBD5E1',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {mode === 'create' ? 'Create Category' : 'Update Category'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Confirm Close Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            Discard Changes?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B">
            You have unsaved changes. Are you sure you want to exit? Your progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#CBD5E1' },
            }}
          >
            Stay
          </Button>
          <Button
            onClick={handleConfirmClose}
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              },
            }}
          >
            Discard & Exit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryForm;