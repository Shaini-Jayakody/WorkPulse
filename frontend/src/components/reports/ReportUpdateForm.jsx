import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  FormHelperText,
  Tooltip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Add,
  Close,
  Save,
  Cancel,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  CalendarToday,
  Work,
  Category,
  Assessment,
  NavigateNext,
  NavigateBefore,
  Close as CloseIcon,
  Link as LinkIcon,
  Edit,
  ArrowBack,
  Delete,
  Send,
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

const TaskChip = styled(Chip)(({ taskType }) => ({
  borderRadius: '6px',
  margin: '4px',
  backgroundColor: 
    taskType === 'completed' ? 'rgba(16, 185, 129, 0.08)' :
    taskType === 'planned' ? 'rgba(139, 92, 246, 0.08)' :
    'rgba(239, 68, 68, 0.08)',
  color: 
    taskType === 'completed' ? '#10B981' :
    taskType === 'planned' ? '#8B5CF6' :
    '#EF4444',
  border: `1px solid ${
    taskType === 'completed' ? 'rgba(16, 185, 129, 0.15)' :
    taskType === 'planned' ? 'rgba(139, 92, 246, 0.15)' :
    'rgba(239, 68, 68, 0.15)'
  }`,
  '&:hover': {
    backgroundColor: 
      taskType === 'completed' ? 'rgba(16, 185, 129, 0.15)' :
      taskType === 'planned' ? 'rgba(139, 92, 246, 0.15)' :
      'rgba(239, 68, 68, 0.15)',
  },
  '& .MuiChip-deleteIcon': {
    color: 
      taskType === 'completed' ? '#10B981' :
      taskType === 'planned' ? '#8B5CF6' :
      '#EF4444',
    '&:hover': {
      color: 
        taskType === 'completed' ? '#059669' :
        taskType === 'planned' ? '#7C3AED' :
        '#DC2626',
    },
  },
}));

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

const StepIconWrapper = styled(Box)(({ active, completed }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed ? '#10B981' : active ? '#3B82F6' : '#E2E8F0',
  color: completed || active ? 'white' : '#94A3B8',
  fontSize: '14px',
  fontWeight: 600,
}));

const LinkChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  backgroundColor: 'rgba(59, 130, 246, 0.06)',
  color: '#3B82F6',
  border: '1px solid rgba(59, 130, 246, 0.15)',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  '& .MuiChip-deleteIcon': {
    color: '#3B82F6',
    '&:hover': {
      color: '#2563EB',
    },
  },
});

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    draft: '#94A3B8',
    submitted: '#10B981',
    late: '#EF4444',
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

// VALIDATION SCHEMA
const validationSchema = Yup.object({
  start_date: Yup.date()
    .required('Start date is required')
    .max(new Date(), 'Start date cannot be in the future')
    .typeError('Please enter a valid date'),
  end_date: Yup.date()
    .required('End date is required')
    .when('start_date', (start_date, schema) => {
      if (start_date) {
        return schema.min(
          start_date,
          'End date must be after or equal to start date'
        );
      }
      return schema;
    })
    .test('max-7-days', 'Date range cannot exceed 7 days', function(value) {
      const { start_date } = this.parent;
      if (!start_date || !value) return true;
      const diff = Math.abs(new Date(value) - new Date(start_date));
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 7;
    })
    .typeError('Please enter a valid date'),
  project: Yup.string()
    .required('Project is required')
    .min(2, 'Must be at least 2 characters')
    .max(100, 'Cannot exceed 100 characters')
    .trim(),
  category: Yup.string()
    .required('Category is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .trim(),
  tasks_completed: Yup.array()
    .min(1, 'At least one completed task is required')
    .max(20, 'Cannot add more than 20 tasks')
    .of(Yup.string().min(1, 'Task cannot be empty').max(500, 'Task too long').trim()),
  tasks_planned: Yup.array()
    .max(20, 'Cannot add more than 20 planned tasks')
    .of(Yup.string().min(1, 'Task cannot be empty').max(500, 'Task too long').trim()),
  blockers: Yup.array()
    .max(10, 'Cannot add more than 10 blockers')
    .of(Yup.string().min(1, 'Blocker cannot be empty').max(500, 'Blocker too long').trim()),
  worked_hours: Yup.number()
    .required('Work hours are required')
    .min(0.5, 'Please enter at least 0.5 hours')
    .max(168, 'Cannot exceed 168 hours (24 hours × 7 days)')
    .typeError('Please enter a valid number'),
  notes: Yup.string()
    .max(2000, 'Cannot exceed 2000 characters')
    .trim(),
  links: Yup.array()
    .max(5, 'Cannot add more than 5 links')
    .of(Yup.string().url('Please enter a valid URL').max(2048, 'URL too long')),
});

// COMPONENT
const ReportUpdateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [report, setReport] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newTask, setNewTask] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [newLink, setNewLink] = useState('');
  const [taskError, setTaskError] = useState('');
  const [plannedError, setPlannedError] = useState('');
  const [blockerError, setBlockerError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs
  const taskInputRef = React.useRef(null);
  const plannedInputRef = React.useRef(null);
  const blockerInputRef = React.useRef(null);
  const linkInputRef = React.useRef(null);

  // FETCH DATA
  const fetchReport = async () => {
    try {
      const response = await api.get(`/reports/${id}`);
      if (response.data.success) {
        const reportData = response.data.data.report;
        setReport(reportData);
        
        // Check if report is already submitted
        if (reportData.status === 'submitted') {
          setError('This report has already been submitted and cannot be edited.');
        }
        
        formik.setValues({
          start_date: reportData.start_date?.split('T')[0] || '',
          end_date: reportData.end_date?.split('T')[0] || '',
          project: reportData.project || '',
          category: reportData.category || '',
          tasks_completed: reportData.tasks_completed || [],
          tasks_planned: reportData.tasks_planned || [],
          blockers: reportData.blockers || [],
          worked_hours: reportData.worked_hours || '',
          notes: reportData.notes || '',
          links: reportData.links || [],
        });
      }
    } catch (err) {
      setError('Failed to load report.');
      console.error('Error fetching report:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await api.get('/projects');
      if (response.data.success) {
        const projectList = response.data.data.projects || [];
        setProjects(projectList);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        const categoryList = response.data.data.categories || [];
        setCategories(categoryList);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchProjects();
    fetchCategories();
  }, [id]);

  // FORM SETUP
  const formik = useFormik({
    initialValues: {
      start_date: '',
      end_date: '',
      project: '',
      category: '',
      tasks_completed: [],
      tasks_planned: [],
      blockers: [],
      worked_hours: '',
      notes: '',
      links: [],
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (report?.status === 'submitted') {
        setError('Cannot update a submitted report.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await api.put(`/reports/${id}`, values);
        
        if (response.data.success) {
          setSuccess('Report updated successfully!');
          setTimeout(() => navigate('/reports'), 1500);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to update report.');
      } finally {
        setLoading(false);
      }
    },
  });

  // SUBMIT REPORT
  const handleSubmitReport = async () => {
    if (report?.status === 'submitted') {
      setError('This report is already submitted.');
      return;
    }

    // Validate required fields
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Please fix all validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.put(`/reports/${id}/submit`);
      if (response.data.success) {
        setSuccess('Report submitted successfully!');
        setTimeout(() => navigate('/reports'), 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE REPORT
  const handleDeleteReport = async () => {
    if (report?.status === 'submitted') {
      setError('Cannot delete a submitted report.');
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete report.');
      setLoading(false);
    }
  };

  // STEP MANAGEMENT
  const steps = [
    { label: 'Date Range', icon: <CalendarToday />, field: 'start_date' },
    { label: 'Project & Category', icon: <Work />, field: 'project' },
    { label: 'Tasks & Details', icon: <Assessment />, field: 'tasks_completed' },
  ];

  const isStepValid = (stepIndex) => {
    const fields = [
      ['start_date', 'end_date'],
      ['project', 'category'],
      ['tasks_completed', 'worked_hours']
    ];
    
    const stepFields = fields[stepIndex] || [];
    return stepFields.every(field => {
      const value = formik.values[field];
      const error = formik.errors[field];
      return value && !error;
    });
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      const fields = [
        ['start_date', 'end_date'],
        ['project', 'category'],
        ['tasks_completed', 'worked_hours']
      ];
      const stepFields = fields[activeStep] || [];
      stepFields.forEach(field => {
        formik.setFieldTouched(field, true);
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // TASK MANAGEMENT
  const addTask = (field, value, setter, setError) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Task cannot be empty');
      return;
    }
    if (trimmed.length > 500) {
      setError('Task cannot exceed 500 characters');
      return;
    }
    
    const current = formik.values[field] || [];
    if (current.length >= 20) {
      setError(`Cannot add more than 20 tasks`);
      return;
    }
    
    if (current.includes(trimmed)) {
      setError('Task already exists');
      return;
    }
    
    formik.setFieldValue(field, [...current, trimmed]);
    setter('');
    setError('');
  };

  const removeTask = (field, index) => {
    const current = formik.values[field] || [];
    formik.setFieldValue(field, current.filter((_, i) => i !== index));
  };

  const addLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) {
      setLinkError('Link cannot be empty');
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setLinkError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    const current = formik.values.links || [];
    if (current.length >= 5) {
      setLinkError('Cannot add more than 5 links');
      return;
    }
    
    if (current.includes(trimmed)) {
      setLinkError('Link already exists');
      return;
    }
    
    formik.setFieldValue('links', [...current, trimmed]);
    setNewLink('');
    setLinkError('');
  };

  const removeLink = (index) => {
    const current = formik.values.links || [];
    formik.setFieldValue('links', current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, field, value, setter, setError) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(field, value, setter, setError);
    }
  };

  // CLOSE HANDLER
  const handleClose = () => {
    const hasValues = Object.values(formik.values).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '';
    });

    if (hasValues) {
      setOpenConfirmDialog(true);
    } else {
      navigate('/reports');
    }
  };

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
    navigate('/reports');
  };

  // HELPERS
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

  const projectNames = projects.map(p => p.project_name || p.name || '').filter(Boolean);
  const categoryNames = categories.map(c => c.name || '').filter(Boolean);

  // RENDER STEP CONTENT
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <FormField
                fullWidth
                label="Start Date *"
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
                label="End Date *"
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
            {formik.values.start_date && formik.values.end_date && (
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {Math.ceil(Math.abs(new Date(formik.values.end_date) - new Date(formik.values.start_date)) / (1000 * 60 * 60 * 24))} days • 
                  Week {Math.ceil((new Date(formik.values.start_date) - new Date(new Date(formik.values.start_date).getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 7)) + 1}
                </Typography>
              </Grid>
            )}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={projectNames}
                loading={loadingProjects}
                value={formik.values.project}
                onInputChange={(event, newValue) => {
                  formik.setFieldValue('project', newValue || '');
                }}
                onBlur={() => formik.setFieldTouched('project', true)}
                renderInput={(params) => (
                  <FormField
                    {...params}
                    label="Project *"
                    placeholder="Select or enter project"
                    size="medium"
                    hasError={getFieldStatus('project') === 'error'}
                    isValid={getFieldStatus('project') === 'valid'}
                    helperText={formik.touched.project && formik.errors.project}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {getFieldIcon('project')}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Work sx={{ color: '#94A3B8', fontSize: 16, mr: 1 }} />
                    {option}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={categoryNames}
                loading={loadingCategories}
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
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2.5}>
            {/* Tasks Completed */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Tasks Completed <span style={{ color: '#EF4444' }}>*</span>
                <ValidationBadge valid={formik.values.tasks_completed?.length > 0}>
                  {formik.values.tasks_completed?.length || 0} tasks
                </ValidationBadge>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  placeholder="Enter a completed task"
                  value={newTask}
                  onChange={(e) => {
                    setNewTask(e.target.value);
                    setTaskError('');
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'tasks_completed', newTask, setNewTask, setTaskError)}
                  inputRef={taskInputRef}
                  hasError={!!taskError}
                  isValid={false}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => addTask('tasks_completed', newTask, setNewTask, setTaskError)}
                          disabled={!newTask.trim()}
                          sx={{ color: '#3B82F6' }}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {taskError && <FormHelperText error sx={{ mb: 1 }}>{taskError}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formik.values.tasks_completed.map((task, idx) => (
                  <TaskChip
                    key={idx}
                    label={task}
                    onDelete={() => removeTask('tasks_completed', idx)}
                    taskType="completed"
                    deleteIcon={<Close />}
                  />
                ))}
                {formik.touched.tasks_completed && formik.errors.tasks_completed && (
                  <Typography variant="caption" color="#EF4444" sx={{ display: 'block', width: '100%', mt: 0.5 }}>
                    {formik.errors.tasks_completed}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Tasks Planned */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Tasks Planned
                <ValidationBadge valid>
                  {formik.values.tasks_planned?.length || 0} tasks
                </ValidationBadge>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  placeholder="Enter a planned task"
                  value={newPlanned}
                  onChange={(e) => {
                    setNewPlanned(e.target.value);
                    setPlannedError('');
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'tasks_planned', newPlanned, setNewPlanned, setPlannedError)}
                  inputRef={plannedInputRef}
                  hasError={!!plannedError}
                  isValid={false}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => addTask('tasks_planned', newPlanned, setNewPlanned, setPlannedError)}
                          disabled={!newPlanned.trim()}
                          sx={{ color: '#8B5CF6' }}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {plannedError && <FormHelperText error sx={{ mb: 1 }}>{plannedError}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formik.values.tasks_planned.map((task, idx) => (
                  <TaskChip
                    key={idx}
                    label={task}
                    onDelete={() => removeTask('tasks_planned', idx)}
                    taskType="planned"
                    deleteIcon={<Close />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Blockers */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Blockers / Challenges
                <ValidationBadge valid>
                  {formik.values.blockers?.length || 0} blockers
                </ValidationBadge>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  placeholder="Enter a blocker"
                  value={newBlocker}
                  onChange={(e) => {
                    setNewBlocker(e.target.value);
                    setBlockerError('');
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'blockers', newBlocker, setNewBlocker, setBlockerError)}
                  inputRef={blockerInputRef}
                  hasError={!!blockerError}
                  isValid={false}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => addTask('blockers', newBlocker, setNewBlocker, setBlockerError)}
                          disabled={!newBlocker.trim()}
                          sx={{ color: '#EF4444' }}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {blockerError && <FormHelperText error sx={{ mb: 1 }}>{blockerError}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formik.values.blockers.map((blocker, idx) => (
                  <TaskChip
                    key={idx}
                    label={blocker}
                    onDelete={() => removeTask('blockers', idx)}
                    taskType="blocker"
                    deleteIcon={<Close />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Work Hours */}
            <Grid item xs={12} sm={4}>
              <FormField
                fullWidth
                label="Work Hours *"
                name="worked_hours"
                type="number"
                placeholder="Enter hours"
                size="medium"
                value={formik.values.worked_hours}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-') {
                    formik.setFieldValue('worked_hours', '');
                  } else {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      formik.setFieldValue('worked_hours', num);
                    }
                  }
                }}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('worked_hours') === 'error'}
                isValid={getFieldStatus('worked_hours') === 'valid'}
                helperText={formik.touched.worked_hours && formik.errors.worked_hours}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('worked_hours')}
                      <Typography variant="caption" sx={{ color: '#94A3B8', ml: 0.5 }}>hrs</Typography>
                    </InputAdornment>
                  ),
                  inputProps: { 
                    min: 0, 
                    max: 168, 
                    step: 0.5,
                  },
                }}
              />
              {formik.values.worked_hours && formik.values.worked_hours > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B' }}>
                  {formik.values.worked_hours} hours over {formik.values.tasks_completed?.length || 0} tasks
                </Typography>
              )}
            </Grid>

            {/* Notes */}
            <Grid item xs={12} sm={8}>
              <FormField
                fullWidth
                label="Notes"
                name="notes"
                placeholder="Add any additional notes or comments..."
                size="medium"
                multiline
                rows={2}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                hasError={getFieldStatus('notes') === 'error'}
                isValid={getFieldStatus('notes') === 'valid'}
                helperText={formik.touched.notes && formik.errors.notes}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {getFieldIcon('notes')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Links */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Links
                <ValidationBadge valid>
                  {formik.values.links?.length || 0} links
                </ValidationBadge>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  placeholder="Enter a link (e.g., https://example.com)"
                  value={newLink}
                  onChange={(e) => {
                    setNewLink(e.target.value);
                    setLinkError('');
                  }}
                  inputRef={linkInputRef}
                  hasError={!!linkError}
                  isValid={false}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={addLink}
                          disabled={!newLink.trim()}
                          sx={{ color: '#3B82F6' }}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {linkError && <FormHelperText error sx={{ mb: 1 }}>{linkError}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formik.values.links.map((link, idx) => (
                  <LinkChip
                    key={idx}
                    label={link.length > 50 ? `${link.substring(0, 50)}...` : link}
                    onDelete={() => removeLink(idx)}
                    deleteIcon={<Close />}
                    icon={<LinkIcon sx={{ fontSize: 14 }} />}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          Report not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'none' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate('/reports')}
                sx={{ 
                  bgcolor: '#F8FAFC', 
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#1E293B">
                  Edit Report
                </Typography>
                <Typography variant="body2" color="#94A3B8">
                  {report.project || 'Untitled Report'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <StatusChip 
              label={report.status === 'submitted' ? 'Submitted' : 'Draft'} 
              status={report.status || 'draft'}
            />
            {report.status !== 'submitted' && (
              <>
                <Tooltip title="Submit Report">
                  <Button
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    onClick={handleSubmitReport}
                    disabled={submitting}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669, #047857)',
                      },
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Tooltip>
                <Tooltip title="Delete Report">
                  <IconButton
                    onClick={() => setOpenDeleteDialog(true)}
                    sx={{ color: '#EF4444' }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Messages */}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        {report.status === 'submitted' ? (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            This report has already been submitted and cannot be edited.
          </Alert>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIconWrapper 
                        active={activeStep === index} 
                        completed={index < activeStep}
                      >
                        {index < activeStep ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                      </StepIconWrapper>
                    )}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {step.icon}
                      <Typography variant="body2" fontWeight={activeStep === index ? 600 : 400}>
                        {step.label}
                      </Typography>
                      {index < activeStep && (
                        <CheckCircle sx={{ color: '#10B981', fontSize: 14 }} />
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBefore />}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={index === steps.length - 1 ? null : <NavigateNext />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                          },
                        }}
                      >
                        {index === steps.length - 1 ? 'Review & Update' : 'Next'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Summary & Submit */}
            {activeStep === steps.length - 1 && (
              <Box sx={{ 
                mt: 2, 
                p: 3, 
                bgcolor: '#F8FAFC', 
                borderRadius: 2,
                border: '1px solid #E2E8F0',
              }}>
                <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                  Report Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Project</Typography>
                    <Typography variant="body2" fontWeight={500}>{formik.values.project || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Category</Typography>
                    <Typography variant="body2" fontWeight={500}>{formik.values.category || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Date Range</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formik.values.start_date ? new Date(formik.values.start_date).toLocaleDateString() : '-'} - {formik.values.end_date ? new Date(formik.values.end_date).toLocaleDateString() : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Hours</Typography>
                    <Typography variant="body2" fontWeight={500}>{formik.values.worked_hours || 0}h</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Tasks Completed</Typography>
                    <Typography variant="body2" fontWeight={500}>{formik.values.tasks_completed?.length || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="#94A3B8">Tasks Planned</Typography>
                    <Typography variant="body2" fontWeight={500}>{formik.values.tasks_planned?.length || 0}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
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
                    }}
                  >
                    Update Report
                  </Button>
                </Box>
              </Box>
            )}
          </form>
        )}
      </Paper>

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
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Delete Report?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B">
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#CBD5E1' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReport}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
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

export default ReportUpdateForm;