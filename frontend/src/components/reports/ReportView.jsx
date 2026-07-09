import React, { useState, useEffect, useRef } from 'react';
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
  LinearProgress,
  useTheme,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Assessment,
  Person,
  Work,
  Category,
  CalendarToday,
  Schedule,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Description,
  Download,
  Edit,
  Send,
  Delete,
  Visibility,
  Flag,
  Star,
  TrendingUp,
  AccessTime,
  Link as LinkIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '12px',
  height: '28px',
  padding: '0 8px',
  backgroundColor: 
    status === 'submitted' ? 'rgba(16, 185, 129, 0.12)' :
    status === 'pending' ? 'rgba(245, 158, 11, 0.12)' :
    status === 'draft' ? 'rgba(148, 163, 184, 0.12)' :
    'rgba(239, 68, 68, 0.12)',
  color: 
    status === 'submitted' ? '#10B981' :
    status === 'pending' ? '#F59E0B' :
    status === 'draft' ? '#94A3B8' :
    '#EF4444',
  border: `1px solid ${
    status === 'submitted' ? 'rgba(16, 185, 129, 0.2)' :
    status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
    status === 'draft' ? 'rgba(148, 163, 184, 0.2)' :
    'rgba(239, 68, 68, 0.2)'
  }`,
  '& .MuiChip-icon': {
    color: 
      status === 'submitted' ? '#10B981' :
      status === 'pending' ? '#F59E0B' :
      status === 'draft' ? '#94A3B8' :
      '#EF4444',
  },
}));

const TaskChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  padding: '2px 4px',
  height: 'auto',
  minHeight: '28px',
  backgroundColor: 'rgba(16, 185, 129, 0.06)',
  color: '#10B981',
  border: '1px solid rgba(16, 185, 129, 0.1)',
  '& .MuiChip-label': {
    fontSize: '13px',
    fontWeight: 500,
    padding: '4px 10px',
  },
});

const PlannedChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  padding: '2px 4px',
  height: 'auto',
  minHeight: '28px',
  backgroundColor: 'rgba(139, 92, 246, 0.06)',
  color: '#8B5CF6',
  border: '1px solid rgba(139, 92, 246, 0.1)',
  '& .MuiChip-label': {
    fontSize: '13px',
    fontWeight: 500,
    padding: '4px 10px',
  },
});

const BlockerChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  padding: '2px 4px',
  height: 'auto',
  minHeight: '28px',
  backgroundColor: 'rgba(239, 68, 68, 0.06)',
  color: '#EF4444',
  border: '1px solid rgba(239, 68, 68, 0.1)',
  '& .MuiChip-label': {
    fontSize: '13px',
    fontWeight: 500,
    padding: '4px 10px',
  },
});

const LinkChip = styled(Chip)({
  borderRadius: '6px',
  margin: '4px',
  padding: '2px 4px',
  height: 'auto',
  minHeight: '28px',
  backgroundColor: 'rgba(59, 130, 246, 0.06)',
  color: '#3B82F6',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  '& .MuiChip-label': {
    fontSize: '13px',
    fontWeight: 500,
    padding: '4px 10px',
  },
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
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
  minWidth: '100px',
});

const InfoValue = styled(Typography)({
  color: '#1E293B',
  fontSize: '14px',
  fontWeight: 500,
});


// COMPONENT
const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/reports/${id}`);
        if (response.data.success) {
          setReport(response.data.data.report);
        }
      } catch (err) {
        setError('Failed to load report');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();

    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, [id]);

  
  // SUBMIT REPORT
  const handleSubmit = async () => {
    if (!window.confirm('Submit this report? You won\'t be able to edit it after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.put(`/reports/${id}/submit`);
      if (response.data.success) {
        setReport(response.data.data.report);
        setError('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

 
  // DELETE REPORT
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete report.');
    }
  };

  
  // PDF EXPORT FUNCTION
  const exportToPDF = async () => {
    setDownloading(true);
    
    try {
      const element = reportRef.current;
      if (!element) {
        setDownloading(false);
        return;
      }

      element.classList.add('pdf-export');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      element.classList.remove('pdf-export');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Header
      pdf.setFontSize(16);
      pdf.setTextColor('#1E293B');
      pdf.text('WorkPulse Report', 15, 20);

      pdf.setFontSize(10);
      pdf.setTextColor('#94A3B8');
      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated: ${dateStr}`, 15, 27);

      pdf.setDrawColor('#E2E8F0');
      pdf.line(15, 33, pdfWidth - 15, 33);

      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      const availableHeight = pageHeight - 45;
      
      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, 'PNG', margin, 38, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let yPosition = 38;
        let pageNum = 1;
        const totalPages = Math.ceil(imgHeight / availableHeight);
        
        while (remainingHeight > 0) {
          const heightForPage = Math.min(remainingHeight, availableHeight);
          const sourceY = (imgHeight - remainingHeight) * (canvas.width / imgWidth);
          const sourceHeight = heightForPage * (canvas.width / imgWidth);
          
          if (pageNum > 1) {
            pdf.addPage();
            yPosition = 15;
            pdf.setFontSize(12);
            pdf.setTextColor('#1E293B');
            pdf.text('Report Details (continued)', 15, 20);
            pdf.setDrawColor('#E2E8F0');
            pdf.line(15, 25, pdfWidth - 15, 25);
          }
          
          pdf.addImage(
            imgData, 
            'PNG', 
            margin, 
            yPosition, 
            imgWidth, 
            heightForPage,
            undefined,
            'FAST',
            0,
            sourceY,
            canvas.width,
            sourceHeight
          );

          pdf.setFontSize(8);
          pdf.setTextColor('#94A3B8');
          pdf.text(
            `Confidential Report | Page ${pageNum} of ${totalPages}`, 
            pdfWidth / 2, 
            pdf.internal.pageSize.getHeight() - 10, 
            { align: 'center' }
          );

          remainingHeight -= availableHeight;
          pageNum++;
        }
      }

      if (imgHeight <= availableHeight) {
        pdf.setFontSize(8);
        pdf.setTextColor('#94A3B8');
        pdf.text(
          'Confidential Report | Page 1 of 1', 
          pdfWidth / 2, 
          pdf.internal.pageSize.getHeight() - 10, 
          { align: 'center' }
        );
      }

      const fileName = `Report_${report.project || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

 
  // HELPERS
  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      draft: 'Draft',
      pending: 'Pending',
      late: 'Late',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: <CheckCircle sx={{ fontSize: 16 }} />,
      pending: <Pending sx={{ fontSize: 16 }} />,
      draft: <Description sx={{ fontSize: 16 }} />,
      late: <ErrorIcon sx={{ fontSize: 16 }} />,
    };
    return icons[status] || null;
  };

  const canEdit = report?.status === 'draft' || report?.status === 'pending';
  const canSubmit = report?.status === 'draft' || report?.status === 'pending';
  const canDelete = report?.status === 'draft' || report?.status === 'pending';


  // RENDER
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6', mb: 3 }} />
        <Typography color="#94A3B8">Loading report...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/reports')}>
              Go Back
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/reports')}>
              Go Back
            </Button>
          }
        >
          Report not found
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
            onClick={() => navigate('/reports')}
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
              {report.project || 'Unnamed Project'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<Category sx={{ fontSize: 14 }} />}
                label={report.category || 'Uncategorized'}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '6px' }}
              />
              <Chip
                icon={<CalendarToday sx={{ fontSize: 14 }} />}
                label={`Week ${report.week_number || 'N/A'}, ${report.year || 'N/A'}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '6px' }}
              />
              <Chip
                label={`Report ID: ${report.report_id || 'N/A'}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '6px', fontSize: '10px' }}
              />
              <StatusChip
                icon={getStatusIcon(report.status)}
                label={getStatusLabel(report.status)}
                status={report.status}
                size="small"
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Edit Button - Navigates to edit page */}
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/reports/edit/${report._id}`)}
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
          )}
          {/* Submit Button */}
          {canSubmit && (
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
              onClick={handleSubmit}
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
          )}
          {/* Delete Button */}
          {canDelete && (
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleDelete}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: '#EF4444',
                color: '#EF4444',
                '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
              }}
            >
              Delete
            </Button>
          )}
          {/* Download PDF Button */}
          <Tooltip title="Download PDF">
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              onClick={exportToPDF}
              disabled={downloading}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  boxShadow: '0 6px 24px rgba(239, 68, 68, 0.35)',
                },
                '&:disabled': {
                  background: '#CBD5E1',
                  boxShadow: 'none',
                },
              }}
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Report Content - for PDF export */}
      <Box ref={reportRef}>
        <Grid container spacing={3}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 4 }}>
                {/* Report Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    Report Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <InfoRow>
                          <InfoLabel>Project</InfoLabel>
                          <InfoValue>{report.project || 'N/A'}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Category</InfoLabel>
                          <InfoValue>{report.category || 'N/A'}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Week</InfoLabel>
                          <InfoValue>{report.week_number || 'N/A'}, {report.year || 'N/A'}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Report ID</InfoLabel>
                          <InfoValue>{report.report_id || 'N/A'}</InfoValue>
                        </InfoRow>
                      </DetailCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailCard>
                        <InfoRow>
                          <InfoLabel>Date Range</InfoLabel>
                          <InfoValue>
                            {report.start_date ? new Date(report.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} - 
                            {report.end_date ? new Date(report.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Hours Worked</InfoLabel>
                          <InfoValue sx={{ color: '#3B82F6', fontWeight: 700 }}>
                            {report.worked_hours || 0}h
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Status</InfoLabel>
                          <StatusChip
                            icon={getStatusIcon(report.status)}
                            label={getStatusLabel(report.status)}
                            status={report.status}
                            size="small"
                          />
                        </InfoRow>
                        {report.submitted_at && (
                          <InfoRow>
                            <InfoLabel>Submitted</InfoLabel>
                            <InfoValue>
                              {new Date(report.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </InfoValue>
                          </InfoRow>
                        )}
                      </DetailCard>
                    </Grid>
                  </Grid>
                </Box>

                {/* Tasks Completed */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#10B981' }} />
                    Tasks Completed
                    <Chip 
                      label={report.tasks_completed?.length || 0} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: 'rgba(16,185,129,0.08)', color: '#10B981', fontWeight: 600 }} 
                    />
                  </Typography>
                  {report.tasks_completed && report.tasks_completed.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {report.tasks_completed.map((task, idx) => (
                        <TaskChip key={idx} label={task} />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="#94A3B8" sx={{ fontStyle: 'italic' }}>
                      No tasks completed
                    </Typography>
                  )}
                </Box>

                {/* Tasks Planned */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: '#8B5CF6' }} />
                    Tasks Planned
                    <Chip 
                      label={report.tasks_planned?.length || 0} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 600 }} 
                    />
                  </Typography>
                  {report.tasks_planned && report.tasks_planned.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {report.tasks_planned.map((task, idx) => (
                        <PlannedChip key={idx} label={task} />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="#94A3B8" sx={{ fontStyle: 'italic' }}>
                      No tasks planned
                    </Typography>
                  )}
                </Box>

                {/* Blockers */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon sx={{ color: '#EF4444' }} />
                    Blockers / Challenges
                    <Chip 
                      label={report.blockers?.length || 0} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 600 }} 
                    />
                  </Typography>
                  {report.blockers && report.blockers.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {report.blockers.map((blocker, idx) => (
                        <BlockerChip key={idx} label={blocker} />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="#94A3B8" sx={{ fontStyle: 'italic' }}>
                      No blockers reported
                    </Typography>
                  )}
                </Box>

                {/* Links */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinkIcon sx={{ color: '#3B82F6' }} />
                    Related Links
                    <Chip 
                      label={report.links?.length || 0} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 600 }} 
                    />
                  </Typography>
                  {report.links && report.links.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {report.links.map((link, idx) => (
                        <LinkChip
                          key={idx}
                          label={link.length > 50 ? `${link.substring(0, 50)}...` : link}
                          icon={<LinkIcon sx={{ fontSize: 14 }} />}
                          component="a"
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="#94A3B8" sx={{ fontStyle: 'italic' }}>
                      No links provided
                    </Typography>
                  )}
                </Box>

                {/* Notes */}
                {report.notes && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description sx={{ color: '#64748B' }} />
                      Notes
                    </Typography>
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Typography variant="body1" color="#1E293B" sx={{ whiteSpace: 'pre-wrap' }}>
                        {report.notes}
                      </Typography>
                    </Paper>
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
                  Report Summary
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="#94A3B8">Total Tasks</Typography>
                    <Typography variant="h6" fontWeight={700} color="#1E293B">
                      {(report.tasks_completed?.length || 0) + (report.tasks_planned?.length || 0)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#94A3B8">Completion Rate</Typography>
                    <Typography variant="h6" fontWeight={700} color="#10B981">
                      {report.tasks_completed?.length > 0 ? 
                        `${Math.round((report.tasks_completed.length / ((report.tasks_completed.length || 0) + (report.tasks_planned?.length || 0))) * 100)}%` : 
                        '0%'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#94A3B8">Avg Hours per Task</Typography>
                    <Typography variant="h6" fontWeight={700} color="#3B82F6">
                      {report.tasks_completed?.length > 0 ? 
                        `${(report.worked_hours / report.tasks_completed.length).toFixed(1)}h` : 
                        '0h'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#94A3B8">Blockers Count</Typography>
                    <Typography variant="h6" fontWeight={700} color="#EF4444">
                      {report.blockers?.length || 0}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="#94A3B8">Links Count</Typography>
                    <Typography variant="h6" fontWeight={700} color="#3B82F6">
                      {report.links?.length || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1.5}>
                  {canEdit && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/reports/edit/${report._id}`)}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        borderColor: '#3B82F6',
                        color: '#3B82F6',
                        '&:hover': {
                          bgcolor: 'rgba(59,130,246,0.04)',
                        },
                      }}
                    >
                      Edit Report
                    </Button>
                  )}
                  {canSubmit && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      onClick={handleSubmit}
                      disabled={submitting}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669, #047857)',
                        },
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={handleDelete}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        borderColor: '#EF4444',
                        color: '#EF4444',
                        '&:hover': {
                          bgcolor: 'rgba(239,68,68,0.04)',
                        },
                      }}
                    >
                      Delete Report
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                    onClick={exportToPDF}
                    disabled={downloading}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                      },
                    }}
                  >
                    {downloading ? 'Generating...' : 'Download PDF'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/reports')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      borderColor: '#E2E8F0',
                      color: '#64748B',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                      },
                    }}
                  >
                    Back to Reports
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.5px" sx={{ mb: 2 }}>
                  Status Timeline
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      bgcolor: '#CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Description sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="#1E293B">Draft Created</Typography>
                      <Typography variant="caption" color="#94A3B8">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {report.status === 'submitted' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        bgcolor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500} color="#1E293B">Submitted</Typography>
                        <Typography variant="caption" color="#94A3B8">
                          {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {report.status === 'pending' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        bgcolor: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Pending sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500} color="#1E293B">Pending Review</Typography>
                        <Typography variant="caption" color="#94A3B8">Awaiting approval</Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Hidden CSS for PDF export */}
      <style>
        {`
          .pdf-export {
            background: white !important;
            padding: 20px !important;
          }
          .pdf-export .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #E2E8F0 !important;
          }
          .pdf-export .MuiPaper-root {
            box-shadow: none !important;
          }
        `}
      </style>
    </Container>
  );
};

export default ReportView;