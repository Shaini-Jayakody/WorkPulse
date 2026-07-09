import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Assessment,
  TrendingUp,
  Timeline,
  PictureAsPdf,
  BarChart,
  PieChart as PieChartIcon,
  CalendarToday,
  ViewWeek,
  CalendarMonth,
  Block,
  Report,
  Schedule,
  Done,
  People,
  Work,
  Category,
  Flag,
  Download,
  FilterList,
  Clear,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axiosConfig';
import { format, startOfWeek, endOfWeek, getWeek, getYear, eachWeekOfInterval, subWeeks, subMonths } from 'date-fns';


// STYLED COMPONENTs
const StatsCard = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-2px)',
  },
});

const ChartCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.06)',
  },
});

const FilterPaper = styled(Paper)({
  padding: '16px 20px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  marginBottom: '24px',
});

const ViewToggle = styled(Tabs)({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '13px',
    minHeight: '36px',
    padding: '6px 16px',
    borderRadius: '8px',
    '&.Mui-selected': {
      color: '#3B82F6',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#3B82F6',
    height: '3px',
    borderRadius: '3px',
  },
});


// CHART COLORS
const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1', '#14B8A6', '#F97316'];


// COMPONENT
const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exporting, setExporting] = useState(false);
  const [viewType, setViewType] = useState('week');
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('all');
  const dashboardRef = useRef(null);


  // HELPERS
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const getWeekRange = (weekNumber, year) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (weekNumber - 1) * 7;
    const start = new Date(firstDayOfYear);
    start.setDate(start.getDate() + days);
    
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - diff);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return { start, end };
  };

  const getWeeksInYear = (year) => {
    const weeks = [];
    for (let w = 1; w <= 52; w++) {
      weeks.push(w);
    }
    return weeks;
  };

  
  // GENERATE SELECTOR OPTIONS
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const weeks = getWeeksInYear(selectedYear);
  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'submissions', label: 'Submissions' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'hours', label: 'Hours' },
    { value: 'blockers', label: 'Blockers' },
  ];

  // FETCH DATA FROM BACKEND
  const loadAnalyticsData = async () => {
    setLoading(true);
    setError('');

    try {
      let data = {};

      if (showAllWeeks) {
        // Fetch multi-week analytics
        const startWeek = 1;
        const startYear = selectedYear;
        const endWeek = 52;
        const endYear = selectedYear;

        const response = await api.get('/analytics/multi-week', {
          params: { startWeek, startYear, endWeek, endYear }
        });

        data = response.data.data;
      } else {
        // Fetch single week analytics
        const weekNumber = selectedWeek;
        const year = selectedYear;

        // Get all chart data in one request
        const response = await api.get(`/analytics/all-charts/week/${weekNumber}/${year}`);
        data = response.data.data;
      }

      setAnalyticsData(data);
      setSuccess(`Analytics loaded for ${showAllWeeks ? 'all weeks' : `Week ${selectedWeek}, ${selectedYear}`}`);

    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics data.');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedWeek, selectedYear, showAllWeeks]);

 
  // PDF EXPORT
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = dashboardRef.current;
      if (!element) { setExporting(false); return; }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.setTextColor('#1E293B');
      const title = showAllWeeks 
        ? `Annual Analytics Report - ${selectedYear}`
        : `Analytics Report - Week ${selectedWeek}, ${selectedYear}`;
      pdf.text(title, 15, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor('#94A3B8');
      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      pdf.text(`Generated: ${dateStr}`, 15, 27);
      pdf.setDrawColor('#E2E8F0');
      pdf.line(15, 33, pdfWidth - 15, 33);

      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, 38, imgWidth, imgHeight);

      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor('#94A3B8');
        pdf.text(`Confidential Report | Page ${i} of ${pageCount}`, pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      const fileName = showAllWeeks 
        ? `Annual_Analytics_${selectedYear}.pdf`
        : `Analytics_Week${selectedWeek}_${selectedYear}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // DATA PROCESSING FOR CHARTS

  // Process summary metrics
  const summaryMetrics = useMemo(() => {
    if (!analyticsData) return null;
    
    if (showAllWeeks) {
      // Aggregate across all weeks
      const weeks = analyticsData || [];
      if (!weeks.length) return null;
      
      const totalReports = weeks.reduce((sum, w) => sum + (w.data?.summary?.totalReports || 0), 0);
      const totalSubmitted = weeks.reduce((sum, w) => sum + (w.data?.summary?.submittedReports || 0), 0);
      const totalHours = weeks.reduce((sum, w) => sum + (w.data?.summary?.totalHours || 0), 0);
      const totalBlockers = weeks.reduce((sum, w) => sum + (w.data?.summary?.totalBlockers || 0), 0);
      const avgCompliance = weeks.length > 0 
        ? (weeks.reduce((sum, w) => sum + (w.data?.summary?.complianceRate || 0), 0) / weeks.length)
        : 0;
      
      return {
        totalReports,
        totalSubmitted,
        totalHours,
        totalBlockers,
        avgCompliance: avgCompliance.toFixed(1),
        weeksCount: weeks.length,
      };
    } else {
      // Single week data
      const summary = analyticsData?.summary || {};
      return {
        totalReports: summary.totalReports || 0,
        totalSubmitted: summary.submittedReports || 0,
        totalHours: summary.totalHours || 0,
        totalBlockers: summary.totalBlockers || 0,
        avgCompliance: summary.complianceRate || 0,
        weeksCount: 1,
      };
    }
  }, [analyticsData, showAllWeeks]);

  // Process submission status data for pie chart
  const submissionPieData = useMemo(() => {
    if (!analyticsData) return [];
    
    if (showAllWeeks) {
      // Aggregate across all weeks
      const weeks = analyticsData || [];
      if (!weeks.length) return [];
      
      const totals = weeks.reduce((acc, w) => {
        const data = w.data?.submissionStatus?.pieChartData || [];
        data.forEach(item => {
          if (item.name === 'Submitted') acc.submitted += item.value || 0;
          else if (item.name === 'Pending') acc.pending += item.value || 0;
          else if (item.name === 'Late') acc.late += item.value || 0;
        });
        return acc;
      }, { submitted: 0, pending: 0, late: 0 });
      
      return [
        { name: 'Submitted', value: totals.submitted, color: '#10B981' },
        { name: 'Pending', value: totals.pending, color: '#F59E0B' },
        { name: 'Late', value: totals.late, color: '#EF4444' },
      ].filter(d => d.value > 0);
    } else {
      const data = analyticsData?.submissionStatus?.pieChartData || [];
      return data;
    }
  }, [analyticsData, showAllWeeks]);

  // Process tasks trend data
  const tasksTrendData = useMemo(() => {
    if (!analyticsData) return [];
    
    if (showAllWeeks) {
      // Use multi-week trend data
      const weeks = analyticsData || [];
      if (!weeks.length) return [];
      
      return weeks.map(w => ({
        name: `Week ${w.week}`,
        tasks: w.data?.summary?.totalTasks || 0,
        reports: w.data?.summary?.totalReports || 0,
        hours: w.data?.summary?.totalHours || 0,
      }));
    } else {
      // Single week - use tasks trend data
      const trendData = analyticsData?.tasksTrend?.lineChartData || [];
      return trendData;
    }
  }, [analyticsData, showAllWeeks]);

  // Process workload by project
  const projectWorkloadData = useMemo(() => {
    if (!analyticsData) return [];
    
    if (showAllWeeks) {
      // Aggregate across all weeks
      const weeks = analyticsData || [];
      if (!weeks.length) return [];
      
      const projectMap = {};
      weeks.forEach(w => {
        const projects = w.data?.workload?.pieChartData || [];
        projects.forEach(p => {
          if (!projectMap[p.name]) projectMap[p.name] = 0;
          projectMap[p.name] += p.value || 0;
        });
      });
      
      return Object.entries(projectMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } else {
      const data = analyticsData?.workload?.pieChartData || [];
      return data;
    }
  }, [analyticsData, showAllWeeks]);

  // Process blockers data
  const blockersData = useMemo(() => {
    if (!analyticsData) return [];
    
    if (showAllWeeks) {
      // Aggregate across all weeks
      const weeks = analyticsData || [];
      if (!weeks.length) return [];
      
      const blockerMap = {};
      weeks.forEach(w => {
        const blockers = w.data?.blockers?.pieChartData || [];
        blockers.forEach(b => {
          if (!blockerMap[b.category]) blockerMap[b.category] = 0;
          blockerMap[b.category] += b.count || 0;
        });
      });
      
      return Object.entries(blockerMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    } else {
      const data = analyticsData?.blockers?.pieChartData || [];
      return data;
    }
  }, [analyticsData, showAllWeeks]);

  // Process team performance data
  const teamPerformanceData = useMemo(() => {
    if (!analyticsData) return [];
    
    if (showAllWeeks) {
      // Aggregate across all weeks
      const weeks = analyticsData || [];
      if (!weeks.length) return [];
      
      const memberMap = {};
      weeks.forEach(w => {
        const members = w.data?.performance?.barChartData || [];
        members.forEach(m => {
          if (!memberMap[m.name]) {
            memberMap[m.name] = { tasks: 0, hours: 0, reports: 0 };
          }
          memberMap[m.name].tasks += m.tasks || 0;
          memberMap[m.name].hours += m.hours || 0;
          memberMap[m.name].reports += 1;
        });
      });
      
      return Object.entries(memberMap)
        .map(([name, data]) => ({
          name,
          tasks: data.tasks,
          hours: data.hours,
          avgTasksPerWeek: (data.tasks / data.reports).toFixed(1),
        }))
        .sort((a, b) => b.tasks - a.tasks);
    } else {
      const data = analyticsData?.performance?.barChartData || [];
      return data;
    }
  }, [analyticsData, showAllWeeks]);

  // Process radar chart data for team performance
  const radarData = useMemo(() => {
    if (!analyticsData) return [];
    
    const performanceData = analyticsData?.performance?.radarChartData || [];
    if (!performanceData.length) return [];
    
    // Take top 5 members for radar chart
    return performanceData.slice(0, 5);
  }, [analyticsData]);

  // Process weekly comparison data
  const weeklyComparisonData = useMemo(() => {
    if (!analyticsData || !showAllWeeks) return [];
    
    const weeks = analyticsData || [];
    if (!weeks.length) return [];
    
    return weeks.map(w => ({
      week: `W${w.week}`,
      submissions: w.data?.summary?.submittedReports || 0,
      tasks: w.data?.summary?.totalTasks || 0,
      hours: w.data?.summary?.totalHours || 0,
      blockers: w.data?.summary?.totalBlockers || 0,
    }));
  }, [analyticsData, showAllWeeks]);

  
  // RENDER HELPERS
  const getWeekRangeDisplay = () => {
    const { start, end } = getWeekRange(selectedWeek, selectedYear);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  // Filter charts based on selected metric
  const shouldShowMetric = (metric) => {
    if (selectedMetric === 'all') return true;
    return selectedMetric === metric;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
          <Typography variant="body2" color="#94A3B8" sx={{ mt: 2 }}>
            Loading analytics data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Box ref={dashboardRef}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              {showAllWeeks 
                ? `Full Year Analysis - ${selectedYear}`
                : `Week ${selectedWeek}, ${selectedYear} (${getWeekRangeDisplay()})`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Toggle */}
            <ViewToggle
              value={viewType}
              onChange={(e, newValue) => {
                setViewType(newValue);
                setShowAllWeeks(newValue === 'year');
              }}
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px',
                padding: '2px',
                minHeight: 'auto',
                '& .MuiTabs-flexContainer': {
                  gap: '4px',
                },
              }}
            >
              <Tab 
                icon={<ViewWeek sx={{ fontSize: 18 }} />} 
                label="Week" 
                value="week"
                sx={{ minHeight: '36px', minWidth: '80px' }}
              />
              <Tab 
                icon={<CalendarMonth sx={{ fontSize: 18 }} />} 
                label="Year" 
                value="year"
                sx={{ minHeight: '36px', minWidth: '80px' }}
              />
            </ViewToggle>

            {/* Week Selector (only when week view) */}
            {!showAllWeeks && (
              <>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    sx={{ borderRadius: '12px', background: 'white' }}
                  >
                    {weeks.map(w => (
                      <MenuItem key={w} value={w}>Week {w}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    sx={{ borderRadius: '12px', background: 'white' }}
                  >
                    {years.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Year Selector (when year view) */}
            {showAllWeeks && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  sx={{ borderRadius: '12px', background: 'white' }}
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="contained"
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
              onClick={exportToPDF}
              disabled={exporting}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
              }}
            >
              {exporting ? 'Generating...' : 'Export PDF'}
            </Button>

            <IconButton 
              onClick={loadAnalyticsData} 
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: '#3B82F6', bgcolor: 'rgba(59,130,246,0.04)' },
              }}
            >
              <Refresh sx={{ color: '#64748B' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

        {/* Filters */}
        <FilterPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Metric Filter</InputLabel>
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  label="Metric Filter"
                  sx={{ borderRadius: '12px' }}
                >
                  {metricOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="Submissions" 
                  color={selectedMetric === 'all' || selectedMetric === 'submissions' ? 'primary' : 'default'}
                  onClick={() => setSelectedMetric(selectedMetric === 'submissions' ? 'all' : 'submissions')}
                  sx={{ borderRadius: '6px' }}
                />
                <Chip 
                  label="Tasks" 
                  color={selectedMetric === 'all' || selectedMetric === 'tasks' ? 'primary' : 'default'}
                  onClick={() => setSelectedMetric(selectedMetric === 'tasks' ? 'all' : 'tasks')}
                  sx={{ borderRadius: '6px' }}
                />
                <Chip 
                  label="Hours" 
                  color={selectedMetric === 'all' || selectedMetric === 'hours' ? 'primary' : 'default'}
                  onClick={() => setSelectedMetric(selectedMetric === 'hours' ? 'all' : 'hours')}
                  sx={{ borderRadius: '6px' }}
                />
                <Chip 
                  label="Blockers" 
                  color={selectedMetric === 'all' || selectedMetric === 'blockers' ? 'primary' : 'default'}
                  onClick={() => setSelectedMetric(selectedMetric === 'blockers' ? 'all' : 'blockers')}
                  sx={{ borderRadius: '6px' }}
                />
                <Chip 
                  label="Clear Filters" 
                  icon={<Clear />}
                  onClick={() => setSelectedMetric('all')}
                  sx={{ borderRadius: '6px', borderColor: '#E2E8F0' }}
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </FilterPaper>

        {/* Summary Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Reports</Typography>
                  <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
                    {summaryMetrics?.totalReports || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', width: 44, height: 44 }}>
                  <Assessment />
                </Avatar>
              </Box>
              {showAllWeeks && (
                <Typography variant="caption" color="#94A3B8">
                  Across {summaryMetrics?.weeksCount || 0} weeks
                </Typography>
              )}
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Compliance Rate</Typography>
                  <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
                    {summaryMetrics?.avgCompliance || 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', width: 44, height: 44 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
              <Typography variant="caption" color="#94A3B8">
                {summaryMetrics?.totalSubmitted || 0} submitted
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Hours</Typography>
                  <Typography variant="h4" fontWeight={700} color="#8B5CF6" sx={{ mt: 0.5 }}>
                    {summaryMetrics?.totalHours || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6', width: 44, height: 44 }}>
                  <Timeline />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Open Blockers</Typography>
                  <Typography variant="h4" fontWeight={700} color="#EF4444" sx={{ mt: 0.5 }}>
                    {summaryMetrics?.totalBlockers || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', width: 44, height: 44 }}>
                  <Block />
                </Avatar>
              </Box>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Charts - Row 1: Submission Status & Tasks Trend */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {shouldShowMetric('submissions') && (
            <Grid item xs={12} md={showAllWeeks ? 12 : 5}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    Report Submission Status
                  </Typography>
                  {submissionPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={submissionPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {submissionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                          formatter={(value) => [`${value} reports`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="#94A3B8">No submission data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </ChartCard>
            </Grid>
          )}

          {shouldShowMetric('tasks') && (
            <Grid item xs={12} md={showAllWeeks ? 12 : 7}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    {showAllWeeks ? 'Weekly Performance Trends' : 'Tasks Completed Trend'}
                  </Typography>
                  {tasksTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={tasksTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                        <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Tasks" />
                        <Line yAxisId="right" type="monotone" dataKey="reports" stroke="#8B5CF6" name="Reports" strokeWidth={2} />
                        {showAllWeeks && (
                          <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#10B981" name="Hours" strokeWidth={2} />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="#94A3B8">No trend data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </ChartCard>
            </Grid>
          )}
        </Grid>

        {/* Charts - Row 2: Workload & Blockers */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {shouldShowMetric('tasks') && (
            <Grid item xs={12} md={6}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    {showAllWeeks ? 'Top Projects by Workload' : 'Workload by Project'}
                  </Typography>
                  {projectWorkloadData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsBarChart data={projectWorkloadData} layout={showAllWeeks ? 'vertical' : 'vertical'}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                        <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                          formatter={(value) => [`${value} reports`]}
                        />
                        <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="#94A3B8">No workload data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </ChartCard>
            </Grid>
          )}

          {shouldShowMetric('blockers') && (
            <Grid item xs={12} md={6}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    {showAllWeeks ? 'Blockers by Category' : 'Open Blockers by Project'}
                  </Typography>
                  {blockersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={blockersData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {blockersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                          formatter={(value) => [`${value} blockers`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="#94A3B8">No blockers data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </ChartCard>
            </Grid>
          )}
        </Grid>

        {/* Charts - Row 3: Team Performance */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {shouldShowMetric('tasks') && (
            <Grid item xs={12} md={8}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    {showAllWeeks ? 'Team Performance Summary' : 'Team Member Performance'}
                  </Typography>
                  {teamPerformanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsBarChart data={teamPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-30} textAnchor="end" height={60} />
                        <YAxis stroke="#94A3B8" fontSize={11} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                        <Legend />
                        <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                        <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} name="Hours Worked" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="#94A3B8">No performance data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </ChartCard>
            </Grid>
          )}

          {shouldShowMetric('tasks') && radarData.length > 0 && (
            <Grid item xs={12} md={4}>
              <ChartCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                    Performance Radar
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                      <Radar name="Tasks" dataKey="tasks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Hours" dataKey="hours" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </ChartCard>
            </Grid>
          )}
        </Grid>

        {/* Weekly Comparison Chart (Year View Only) */}
        {showAllWeeks && weeklyComparisonData.length > 0 && (
          <ChartCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 2 }}>
                Weekly Comparison - Full Year Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyComparisonData}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Legend />
                  <Area type="monotone" dataKey="submissions" stroke="#3B82F6" fill="url(#colorSubmissions)" name="Submissions" />
                  <Area type="monotone" dataKey="tasks" stroke="#8B5CF6" fill="url(#colorTasks)" name="Tasks" />
                  <Line type="monotone" dataKey="hours" stroke="#10B981" name="Hours" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </ChartCard>
        )}
      </Box>
    </Container>
  );
};

export default Analytics;