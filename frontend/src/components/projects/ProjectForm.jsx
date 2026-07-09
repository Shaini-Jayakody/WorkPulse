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
  Chip,
  Typography,
  Paper,
  FormHelperText,
  Tooltip,
  Autocomplete,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Work,
  Category,
  People,
  CalendarToday,
  AttachMoney,
  Flag,
  Settings,
  Add,
  Close,
  Archive,
} from '@mui/icons-material';
import api from '../../api/axiosConfig';

// ============================================
// STYLED COMPONENTS
// ============================================

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

const TagChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  color: '#6366F1',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  '&:hover': {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  '& .MuiChip-deleteIcon': {
    color: '#6366F1',
    '&:hover': {
      color: '#4F46E5',
    },
  },
});

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

// ============================================
// FIXED VALIDATION SCHEMA
// ============================================

const validationSchema = Yup.object({
  project_name: Yup.string()
    .required('Project name is required')
    .min(2, 'Must be at least 2 characters')
    .max(100, 'Cannot exceed 100 characters')
    .trim(),
  description: Yup.string()
    .max(500, 'Cannot exceed 500 characters')
    .trim(),
  category: Yup.string()
    .required('Category is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .trim(),
  assigned_users: Yup.array()
    .of(Yup.string()),
  start_date: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty string or undefined
      if (!originalValue || originalValue === '') {
        return null;
      }
      return new Date(originalValue);
    })
    .typeError('Please enter a valid date'),
  end_date: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty string or undefined
      if (!originalValue || originalValue === '') {
        return null;
      }
      return new Date(originalValue);
    })
    .typeError('Please enter a valid date')
    .test('is-after-start', 'End date must be after or equal to start date', function(value) {
      const { start_date } = this.parent;
      // If either date is empty, skip validation
      if (!start_date || !value) return true;
      return value >= start_date;
    }),
  budget: Yup.number()
    .min(0, 'Budget must be positive')
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return Number(originalValue);
    })
    .typeError('Please enter a valid number'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'critical']),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['planning', 'active', 'on_hold', 'completed', 'archived']),
  tags: Yup.array()
    .max(10, 'Cannot add more than 10 tags')
    .of(Yup.string().min(1, 'Tag cannot be empty').max(30, 'Tag too long').trim()),
});

// ============================================
// COMPONENT
// ============================================

const ProjectForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        const categoryList = response.data.data.categories || [];
        setCategories(categoryList.map(c => c.name).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProject = async () => {
    if (mode === 'create') return;
    
    try {
      const response = await api.get(`/projects/${id}`);
      if (response.data.success) {
        const project = response.data.data.project;
        formik.setValues({
          project_name: project.project_name || '',
          description: project.description || '',
          category: project.category || '',
          assigned_users: project.assigned_users?.map(u => u._id || u) || [],
          start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
          end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
          budget: project.budget || '',
          priority: project.priority || 'medium',
          status: project.status || 'planning',
          tags: project.tags || [],
        });
      }
    } catch (err) {
      setError('Failed to load project data.');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    if (mode === 'edit') {
      fetchProject();
    } else {
      setFetchLoading(false);
    }
  }, []);

  // ============================================
  // FORM SETUP
  // ============================================

  const formik = useFormik({
    initialValues: {
      project_name: '',
      description: '',
      category: '',
      assigned_users: [],
      start_date: '',
      end_date: '',
      budget: '',
      priority: 'medium',
      status: 'planning',
      tags: [],
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
        const url = mode === 'create' ? '/projects' : `/projects/${id}`;
        const method = mode === 'create' ? 'post' : 'put';
        
        const response = await api[method](url, values);
        
        if (response.data.success) {
          setSuccess(`Project ${mode === 'create' ? 'created' : 'updated'} successfully!`);
          setTimeout(() => navigate('/projects'), 1500);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save project.');
      } finally {
        setLoading(false);
      }
    },
  });

  // ============================================
  // TAG MANAGEMENT
  // ============================================

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) {
      setTagError('Tag cannot be empty');
      return;
    }
    if (trimmed.length > 30) {
      setTagError('Tag cannot exceed 30 characters');
      return;
    }
    
    const current = formik.values.tags || [];
    if (current.length >= 10) {
      setTagError('Cannot add more than 10 tags');
      return;
    }
    
    if (current.includes(trimmed)) {
      setTagError('Tag already exists');
      return;
    }
    
    formik.setFieldValue('tags', [...current, trimmed]);
    setNewTag('');
    setTagError('');
  };

  const removeTag = (index) => {
    const current = formik.values.tags || [];
    formik.setFieldValue('tags', current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // ============================================
  // CLOSE HANDLER
  // ============================================

  const handleClose = () => {
    const hasValues = Object.values(formik.values).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '';
    });

    if (hasValues || mode === 'edit') {
      setOpenConfirmDialog(true);
    } else {
      navigate('/projects');
    }
  };

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
    navigate('/projects');
  };

  // ============================================
  // HELPERS
  // ============================================

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

  const userOptions = users.map(user => ({
    id: user._id,
    label: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
  }));

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ py: 3, maxWidth: '900px', mx: 'auto' }}>
        {/* Header */}
        <FormHeader>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            </Typography>
            <Typography variant="body2" color="#94A3B8">
              {mode === 'create' ? 'Add a new project to your portfolio' : 'Update your project details'}
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
            {/* Project Name */}
            <Grid item xs={12}>
              <FormField
                fullWidth
                label="Project Name *"
                name="project_name"
                placeholder="Enter project name"
                size="medium"
                value={formik.values.project_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('project_name') === 'error'}
                isValid={getFieldStatus('project_name') === 'valid'}
                helperText={formik.touched.project_name && formik.errors.project_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('project_name')}
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
                placeholder="Enter project description"
                size="medium"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('description') === 'error'}
                isValid={getFieldStatus('description') === 'valid'}
                helperText={formik.touched.description && formik.errors.description}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('description')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={categories}
                value={formik.values.category}
                onInputChange={(event, newValue) => {
                  formik.setFieldValue('category', newValue || '');
                }}
                onBlur={() => formik.setFieldTouched('category', true)}
                renderInput={(params) => (
                  <FormField
                    {...params}
                    label="Category *"
                    placeholder="Select or enter category"
                    size="medium"
                    hasError={getFieldStatus('category') === 'error'}
                    isValid={getFieldStatus('category') === 'valid'}
                    helperText={formik.touched.category && formik.errors.category}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {getFieldIcon('category')}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Category sx={{ color: '#94A3B8', fontSize: 16, mr: 1 }} />
                    {option}
                  </li>
                )}
              />
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <InputLabel>Priority *</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Priority *"
                  sx={{ borderRadius: '12px', backgroundColor: '#F8FAFC' }}
                >
                  <MenuItem value="low">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag sx={{ color: '#10B981', fontSize: 18 }} />
                      Low
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag sx={{ color: '#3B82F6', fontSize: 18 }} />
                      Medium
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag sx={{ color: '#F59E0B', fontSize: 18 }} />
                      High
                    </Box>
                  </MenuItem>
                  <MenuItem value="critical">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag sx={{ color: '#EF4444', fontSize: 18 }} />
                      Critical
                    </Box>
                  </MenuItem>
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <FormHelperText>{formik.errors.priority}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="medium" error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel>Status *</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status *"
                  sx={{ borderRadius: '12px', backgroundColor: '#F8FAFC' }}
                >
                  <MenuItem value="planning">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Settings sx={{ color: '#3B82F6', fontSize: 18 }} />
                      Planning
                    </Box>
                  </MenuItem>
                  <MenuItem value="active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="on_hold">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                      On Hold
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#8B5CF6', fontSize: 18 }} />
                      Completed
                    </Box>
                  </MenuItem>
                  <MenuItem value="archived">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Archive sx={{ color: '#94A3B8', fontSize: 18 }} />
                      Archived
                    </Box>
                  </MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Budget */}
            <Grid item xs={12} sm={6}>
              <FormField
                fullWidth
                label="Budget"
                name="budget"
                type="number"
                placeholder="Enter budget"
                size="medium"
                value={formik.values.budget}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('budget') === 'error'}
                isValid={getFieldStatus('budget') === 'valid'}
                helperText={formik.touched.budget && formik.errors.budget}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('budget')}
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, step: 1000 },
                }}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <FormField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                size="medium"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('start_date') === 'error'}
                isValid={getFieldStatus('start_date') === 'valid'}
                helperText={formik.touched.start_date && formik.errors.start_date}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('start_date')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                size="medium"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('end_date') === 'error'}
                isValid={getFieldStatus('end_date') === 'valid'}
                helperText={formik.touched.end_date && formik.errors.end_date}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('end_date')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Assigned Users */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={userOptions}
                value={userOptions.filter(opt => formik.values.assigned_users.includes(opt.id))}
                onChange={(event, newValue) => {
                  formik.setFieldValue('assigned_users', newValue.map(v => v.id));
                }}
                onBlur={() => formik.setFieldTouched('assigned_users', true)}
                renderInput={(params) => (
                  <FormField
                    {...params}
                    label="Assigned Users"
                    placeholder="Select team members"
                    size="medium"
                    hasError={getFieldStatus('assigned_users') === 'error'}
                    isValid={getFieldStatus('assigned_users') === 'valid'}
                    helperText={formik.touched.assigned_users && formik.errors.assigned_users}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <People sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <People sx={{ color: '#94A3B8', fontSize: 16, mr: 1 }} />
                    {option.label}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.label}
                      {...getTagProps({ index })}
                      sx={{ borderRadius: '6px' }}
                    />
                  ))
                }
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Tags
                <ValidationBadge valid>
                  {formik.values.tags?.length || 0} tags
                </ValidationBadge>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  placeholder="Enter a tag (e.g., frontend, backend)"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setTagError('');
                  }}
                  onKeyDown={handleKeyDown}
                  hasError={!!tagError}
                  isValid={false}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={addTag}
                          disabled={!newTag.trim()}
                          sx={{ color: '#6366F1' }}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {tagError && <FormHelperText error sx={{ mb: 1 }}>{tagError}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formik.values.tags.map((tag, idx) => (
                  <TagChip
                    key={idx}
                    label={tag}
                    onDelete={() => removeTag(idx)}
                    deleteIcon={<Close />}
                  />
                ))}
              </Box>
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
                  {mode === 'create' ? 'Create Project' : 'Update Project'}
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

export default ProjectForm;