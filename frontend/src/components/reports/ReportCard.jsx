import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Send,
  Schedule,
  Category,
  Work,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ compact }) => ({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-2px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '10px',
  height: '22px',
  backgroundColor: 
    status === 'submitted' ? 'rgba(16, 185, 129, 0.1)' :
    status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(239, 68, 68, 0.1)',
  color: 
    status === 'submitted' ? '#10B981' :
    status === 'pending' ? '#F59E0B' :
    '#EF4444',
}));

const ReportCard = ({ report, onEdit, onView, onDelete, onSubmit, compact = false }) => {
  const navigate = useNavigate();

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      draft: 'Draft',
      pending: 'Pending',
      late: 'Late',
    };
    return labels[status] || status;
  };

  const canEdit = report.status === 'draft' || report.status === 'pending';
  const canSubmit = report.status === 'draft' || report.status === 'pending';

  // Handle Edit - Navigate to edit page
  const handleEdit = () => {
    navigate(`/reports/edit/${report._id}`);
  };

  // Handle View - Navigate to view page
  const handleView = () => {
    navigate(`/reports/view/${report._id}`);
  };

  return (
    <StyledCard compact={compact}>
      <CardContent sx={{ p: 2.5, flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600} color="#1E293B" noWrap sx={{ maxWidth: '70%' }}>
            {report.project || 'Unnamed Project'}
          </Typography>
          <StatusChip
            label={getStatusLabel(report.status)}
            status={report.status}
            size="small"
          />
        </Box>

        {/* Details */}
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Category sx={{ fontSize: 14, color: '#94A3B8' }} />
            <Typography variant="caption" color="#64748B">
              {report.category || 'Uncategorized'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: 14, color: '#94A3B8' }} />
            <Typography variant="caption" color="#64748B">
              Week {report.week_number || 'N/A'}, {report.year || 'N/A'}
            </Typography>
          </Box>
          {report.worked_hours > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 14, color: '#94A3B8' }} />
              <Typography variant="caption" color="#64748B">
                {report.worked_hours}h worked
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Tasks Summary */}
        {report.tasks_completed && report.tasks_completed.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="#94A3B8" display="block" sx={{ mb: 0.5 }}>
              {report.tasks_completed.length} tasks completed
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {report.tasks_completed.slice(0, compact ? 2 : 3).map((task, idx) => (
                <Chip
                  key={idx}
                  label={task.length > 25 ? `${task.substring(0, 25)}...` : task}
                  size="small"
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    color: '#10B981',
                    fontSize: '10px',
                    height: '20px',
                  }}
                />
              ))}
              {report.tasks_completed.length > (compact ? 2 : 3) && (
                <Chip
                  label={`+${report.tasks_completed.length - (compact ? 2 : 3)} more`}
                  size="small"
                  sx={{ borderRadius: '4px', fontSize: '10px', height: '20px' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Submission Date */}
        {report.submitted_at && (
          <Typography variant="caption" color="#94A3B8" sx={{ display: 'block', mt: 'auto' }}>
            Submitted: {new Date(report.submitted_at).toLocaleDateString()}
          </Typography>
        )}

        {/* Actions */}
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View">
              <IconButton 
                size="small" 
                onClick={handleView} 
                sx={{ color: '#64748B' }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={handleEdit} 
                  sx={{ color: '#3B82F6' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(report._id)} 
                  sx={{ color: '#EF4444' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {canSubmit && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Send />}
              onClick={() => onSubmit(report._id)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                fontSize: '11px',
                padding: '4px 12px',
                minHeight: '28px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                },
              }}
            >
              Submit
            </Button>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ReportCard;