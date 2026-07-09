import React, { useState, useEffect, useMemo } from 'react';
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
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  Search,
  Clear,
  Person,
  Email,
  Phone,
  Work,
  Group,
  CheckCircle,
  Block,
  People,
  Visibility,
  Edit,
  Delete,
  Warning,
  Verified,
  Pending,
  Schedule,
  MoreVert,
  FilterList,
  Download,
  Print,
  PersonAdd,
  AdminPanelSettings,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { format } from 'date-fns';

// STYLED COMPONENTS
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

const MemberCard = styled(Card)({
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

const FilterPaper = styled(Paper)({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
  marginBottom: '24px',
});

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    active: '#10B981',
    inactive: '#94A3B8',
    pending: '#F59E0B',
    rejected: '#EF4444',
  };
  const color = colors[status] || '#64748B';
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '11px',
    height: '24px',
    backgroundColor: `${color}15`,
    color: color,
  };
});

const RoleChip = styled(Chip)(({ role }) => {
  const colors = {
    super_admin: '#EC4899',
    admin: '#8B5CF6',
    manager: '#3B82F6',
    team_member: '#10B981',
  };
  const color = colors[role] || '#64748B';
  return {
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '10px',
    height: '20px',
    backgroundColor: `${color}10`,
    color: color,
  };
});

// COMPONENT
const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: null, // 'activate' or 'deactivate'
    member: null,
  });
  const [processing, setProcessing] = useState(false);

  // Fetch team members
  const fetchTeamMembers = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all users (manager sees their team)
      const response = await api.get('/auth/users');
      
      if (response.data.success) {
        const allUsers = response.data.data.users || [];
        
        // Filter to only team members (not managers, admins, or super admins)
        // and only show users with team_no matching manager's team
        const teamMembersList = allUsers.filter(user => 
          user.role === 'team_member' || user.role === 'manager'
        );
        
        setTeamMembers(teamMembersList);
        setFilteredMembers(teamMembersList);

        // Calculate stats
        const total = teamMembersList.length;
        const active = teamMembersList.filter(u => u.isActive !== false).length;
        const inactive = teamMembersList.filter(u => u.isActive === false).length;
        const pending = teamMembersList.filter(u => 
          u.approval_status === 'pending_manager_approval' || 
          u.approval_status === 'pending_admin_approval'
        ).length;

        setStats({ total, active, inactive, pending });
      }
    } catch (err) {
      setError('Failed to load team members. Please try again.');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...teamMembers];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(member => {
        const name = `${member.first_name} ${member.last_name}`.toLowerCase();
        const email = (member.email || '').toLowerCase();
        const userId = (member.user_id || '').toLowerCase();
        return name.includes(query) || email.includes(query) || userId.includes(query);
      });
    }

    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(member => member.isActive !== false);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(member => member.isActive === false);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(member => 
          member.approval_status === 'pending_manager_approval' || 
          member.approval_status === 'pending_admin_approval'
        );
      }
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(member => member.role === filters.role);
    }

    setFilteredMembers(filtered);
    setPage(0);
  }, [teamMembers, search, filters]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      role: 'all',
    });
    setSearch('');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openActionDialog = (member, action) => {
    setActionDialog({
      open: true,
      action,
      member,
    });
  };

  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      action: null,
      member: null,
    });
  };

  const handleToggleStatus = async () => {
    const { member, action } = actionDialog;
    if (!member) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (action === 'activate') {
        response = await api.put(`/auth/users/${member._id}/activate`);
      } else {
        response = await api.put(`/auth/users/${member._id}/deactivate`);
      }

      if (response.data.success) {
        setSuccess(`${member.first_name} ${member.last_name} has been ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`);
        closeActionDialog();
        fetchTeamMembers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} user.`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      pending_manager_approval: 'Pending Manager',
      pending_admin_approval: 'Pending Admin',
      pending_super_admin_approval: 'Pending Super Admin',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      team_member: 'Team Member',
    };
    return labels[role] || role;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: '#EC4899',
      admin: '#8B5CF6',
      manager: '#3B82F6',
      team_member: '#10B981',
    };
    return colors[role] || '#64748B';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'User ID', 'Role', 'Status', 'Team', 'Joined'];
    const rows = filteredMembers.map(m => [
      `${m.first_name} ${m.last_name}`,
      m.email || 'N/A',
      m.user_id || 'N/A',
      getRoleLabel(m.role),
      m.isActive !== false ? 'Active' : 'Inactive',
      m.team_no || 'N/A',
      formatDate(m.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            Team Management
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Manage your team members and their access
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={filteredMembers.length === 0}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
            }}
          >
            Export CSV
          </Button>
          <IconButton 
            onClick={fetchTeamMembers} 
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
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Members</Typography>
            <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ mt: 0.5 }}>
              {stats.total}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Active</Typography>
            <Typography variant="h4" fontWeight={700} color="#10B981" sx={{ mt: 0.5 }}>
              {stats.active}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Inactive</Typography>
            <Typography variant="h4" fontWeight={700} color="#94A3B8" sx={{ mt: 0.5 }}>
              {stats.inactive}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Pending</Typography>
            <Typography variant="h4" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
              {stats.pending}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FilterPaper>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, or ID..."
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
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                label="Role"
                sx={{ borderRadius: '12px', background: 'white' }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="team_member">Team Member</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
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

      {/* Members Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Member</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Team</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748B' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="#94A3B8">No team members found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((member) => (
                  <TableRow key={member._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={member.profile_picture_url}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: `${getRoleColor(member.role)}20`,
                            color: getRoleColor(member.role),
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(member.first_name, member.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="#1E293B">
                            {member.first_name} {member.last_name}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8">
                            ID: {member.user_id || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#64748B">
                        {member.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <RoleChip
                        label={getRoleLabel(member.role)}
                        role={member.role}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#64748B">
                        {member.team_no || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={member.isActive !== false ? 'Active' : 'Inactive'}
                        status={member.isActive !== false ? 'active' : 'inactive'}
                        size="small"
                      />
                      {member.approval_status && member.approval_status !== 'approved' && (
                        <StatusChip
                          label={getStatusLabel(member.approval_status)}
                          status={member.approval_status}
                          size="small"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#64748B">
                        {formatDate(member.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={member.isActive !== false ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => openActionDialog(member, member.isActive !== false ? 'deactivate' : 'activate')}
                          sx={{
                            color: member.isActive !== false ? '#EF4444' : '#10B981',
                            '&:hover': {
                              backgroundColor: member.isActive !== false ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                            },
                          }}
                        >
                          {member.isActive !== false ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={closeActionDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {actionDialog.action === 'activate' ? (
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>
                <CheckCircle />
              </Avatar>
            ) : (
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                <Block />
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1E293B">
                {actionDialog.action === 'activate' ? 'Activate' : 'Deactivate'} Member
              </Typography>
              <Typography variant="body2" color="#94A3B8">
                {actionDialog.member?.first_name} {actionDialog.member?.last_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="#64748B" sx={{ mb: 2 }}>
            {actionDialog.action === 'activate' 
              ? 'Are you sure you want to activate this team member? They will regain access to the system.'
              : 'Are you sure you want to deactivate this team member? They will lose access to the system until reactivated.'}
          </DialogContentText>
          
          {actionDialog.member && (
            <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC' }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Name</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {actionDialog.member.first_name} {actionDialog.member.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="#94A3B8">Role</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {getRoleLabel(actionDialog.member.role)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="#94A3B8">Email</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {actionDialog.member.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="#94A3B8">Status</Typography>
                  <Typography variant="body2" fontWeight={500} color="#1E293B">
                    {actionDialog.member.isActive !== false ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeActionDialog}
            variant="outlined"
            disabled={processing}
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
            onClick={handleToggleStatus}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              background: actionDialog.action === 'activate'
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #EF4444, #DC2626)',
              '&:hover': {
                background: actionDialog.action === 'activate'
                  ? 'linear-gradient(135deg, #059669, #047857)'
                  : 'linear-gradient(135deg, #DC2626, #B91C1C)',
              },
              '&:disabled': {
                background: '#CBD5E1',
              },
            }}
          >
            {processing ? 'Processing...' : actionDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagement;