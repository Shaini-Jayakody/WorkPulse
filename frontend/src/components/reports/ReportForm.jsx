import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Add,
  Close,
  Delete,
  Save,
  Cancel,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  CalendarToday,
  Work,
  Category,
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

const RequiredStar = styled('span')({
  color: '#EF4444',
  marginLeft: '4px',
});

// ============================================
// VALIDATION SCHEMA
// ============================================

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
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/, 'Project name contains invalid characters'),
  category: Yup.string()
    .required('Category is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/, 'Category contains invalid characters'),
  tasks_completed: Yup.array()
    .min(1, 'At least one completed task is required')
    .max(20, 'Cannot add more than 20 tasks')
    .of(Yup.string().min(1, 'Task cannot be empty').max(500, 'Task too long')),
  tasks_planned: Yup.array()
    .max(20, 'Cannot add more than 20 planned tasks')
    .of(Yup.string().min(1, 'Task cannot be empty').max(500, 'Task too long')),
  blockers: Yup.array()
    .max(10, 'Cannot add more than 10 blockers')
    .of(Yup.string().min(1, 'Blocker cannot be empty').max(500, 'Blocker too long')),
  worked_hours: Yup.number()
    .required('Work hours are required')
    .min(0.5, 'Please enter at least 0.5 hours')
    .max(168, 'Cannot exceed 168 hours (24 hours × 7 days)')
    .typeError('Please enter a valid number'),
  notes: Yup.string()
    .max(2000, 'Cannot exceed 2000 characters'),
});

// ============================================
// COMPONENT
// ============================================

const ReportForm = ({ report, mode = 'create', onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [taskError, setTaskError] = useState('');
  const [plannedError, setPlannedError] = useState('');
  const [blockerError, setBlockerError] = useState('');

  // Refs for input focus
  const taskInputRef = React.useRef(null);
  const plannedInputRef = React.useRef(null);
  const blockerInputRef = React.useRef(null);

  const formik = useFormik({
    initialValues: {
      start_date: report?.start_date?.split('T')[0] || '',
      end_date: report?.end_date?.split('T')[0] || '',
      project: report?.project || '',
      category: report?.category || '',
      tasks_completed: report?.tasks_completed || [],
      tasks_planned: report?.tasks_planned || [],
      blockers: report?.blockers || [],
      worked_hours: report?.worked_hours || '',
      notes: report?.notes || '',
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        const url = mode === 'create' ? '/reports' : `/reports/${report._id}`;
        const method = mode === 'create' ? 'post' : 'put';
        
        const response = await api[method](url, values);
        
        if (response.data.success) {
          onSuccess();
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save report.');
      } finally {
        setLoading(false);
      }
    },
  });

  // ============================================
  // TASK MANAGEMENT
  // ============================================

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
      setError(`Cannot add more than 20 ${field === 'tasks_completed' ? 'completed' : field === 'tasks_planned' ? 'planned' : ''} tasks`);
      return;
    }
    
    if (current.includes(trimmed)) {
      setError('Task already exists');
      return;
    }
    
    formik.setFieldValue(field, [...current, trimmed]);
    setter('');
    setError('');
    // Focus back on input
    if (field === 'tasks_completed') taskInputRef.current?.focus();
    else if (field === 'tasks_planned') plannedInputRef.current?.focus();
    else blockerInputRef.current?.focus();
  };

  const removeTask = (field, index) => {
    const current = formik.values[field] || [];
    formik.setFieldValue(field, current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, field, value, setter, setError) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(field, value, setter, setError);
    }
  };

  // ============================================
  // VALIDATION HELPERS
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

  const getTaskError = (field) => {
    if (field === 'tasks_completed' && formik.touched.tasks_completed && formik.errors.tasks_completed) {
      return formik.errors.tasks_completed;
    }
    return null;
  };

  // ============================================
  // RENDER
  // ============================================

  const isFormValid = () => {
    return formik.isValid && formik.dirty && !loading;
  };

  return (
    <Box sx={{ py: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2.5}>
          {/* ============================================
              DATE RANGE
              ============================================ */}
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
            {formik.values.start_date && formik.values.end_date && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B' }}>
                {Math.ceil(Math.abs(new Date(formik.values.end_date) - new Date(formik.values.start_date)) / (1000 * 60 * 60 * 24))} days
              </Typography>
            )}
          </Grid>

          {/* ============================================
              PROJECT & CATEGORY
              ============================================ */}
          <Grid item xs={12} sm={6}>
            <FormField
              fullWidth
              label="Project *"
              name="project"
              placeholder="Enter project name"
              size="medium"
              value={formik.values.project}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              hasError={getFieldStatus('project') === 'error'}
              isValid={getFieldStatus('project') === 'valid'}
              helperText={formik.touched.project && formik.errors.project}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {getFieldIcon('project')}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              fullWidth
              label="Category *"
              name="category"
              placeholder="Enter category"
              size="medium"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              hasError={getFieldStatus('category') === 'error'}
              isValid={getFieldStatus('category') === 'valid'}
              helperText={formik.touched.category && formik.errors.category}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {getFieldIcon('category')}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* ============================================
              TASKS COMPLETED
              ============================================ */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="#1E293B" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              Tasks Completed <RequiredStar>*</RequiredStar>
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
            {taskError && (
              <FormHelperText error sx={{ mb: 1 }}>
                {taskError}
              </FormHelperText>
            )}
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
              {getTaskError('tasks_completed') && (
                <Typography variant="caption" color="#EF4444" sx={{ display: 'block', width: '100%', mt: 0.5 }}>
                  {getTaskError('tasks_completed')}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* ============================================
              TASKS PLANNED
              ============================================ */}
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
            {plannedError && (
              <FormHelperText error sx={{ mb: 1 }}>
                {plannedError}
              </FormHelperText>
            )}
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

          {/* ============================================
              BLOCKERS
              ============================================ */}
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
            {blockerError && (
              <FormHelperText error sx={{ mb: 1 }}>
                {blockerError}
              </FormHelperText>
            )}
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

          {/* ============================================
              WORK HOURS
              ============================================ */}
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

          {/* ============================================
              NOTES
              ============================================ */}
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

          {/* ============================================
              ACTIONS
              ============================================ */}
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
                onClick={onCancel}
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
                {mode === 'create' ? 'Create Report' : 'Update Report'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ReportForm;