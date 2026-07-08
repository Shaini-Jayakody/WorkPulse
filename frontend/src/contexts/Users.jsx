import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Typography,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Refresh,
  CheckCircle,
  Search,
  AdminPanelSettings,
  Badge as BadgeIcon,
  Work,
  Block,
  Check,
  Close,
  FilterList,
  Edit,
  Delete,
  Restore,
  Warning as WarningIcon,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Home,
  Group,
  Event,
  PersonAdd,
} from '@mui/icons-material';
import api from '../api/axiosConfig';

// ============================================
// STYLED COMPONENTS - Matching WorkPulse Theme
// ============================================

const UserCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-2px)',
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

const GradientButton = styled(Button)({
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '13px',
  padding: '6px 16px',
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  boxShadow: '0 2px 12px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
  '&:disabled': {
    background: '#CBD5E1',
    boxShadow: 'none',
    transform: 'none',
  },
});

const AddUserButton = styled(Button)({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  padding: '10px 24px',
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(59, 130, 246, 0.35)',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
});

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '11px',
  height: '24px',
  backgroundColor: 
    status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
    status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(239, 68, 68, 0.1)',
  color: 
    status === 'active' ? '#10B981' :
    status === 'pending' ? '#F59E0B' :
    '#EF4444',
}));

const RoleChip = styled(Chip)(({ rolecolor }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '11px',
  height: '24px',
  backgroundColor: `${rolecolor}15`,
  color: rolecolor,
  border: `1px solid ${rolecolor}25`,
}));

// ============================================
// COMPONENT
// ============================================

const Users = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [isEditingRole, setIsEditingRole] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/auth/users');
      const allUsers = response?.data?.data?.users || [];
      setUsers(allUsers);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await api.get('/auth/profile');
        setCurrentUser(response?.data?.data?.user || null);
      } catch (err) {
        setCurrentUser(null);
      }
    };

    loadCurrentUser();
  }, []);

  // ============================================
  // USER MANAGEMENT FUNCTIONS
  // ============================================

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.post(`/auth/users/${userId}/approve`, {});
      setSuccess('User approved successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.post(`/auth/users/${userId}/reject`, {});
      setSuccess('User rejected successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reject user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/auth/users/${userId}/activate`);
      setSuccess('User activated successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to activate user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/auth/users/${userId}/deactivate`);
      setSuccess('User deactivated successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/auth/users/${userId}`);
      setSuccess('User deleted successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  const handleEditRole = async (userId, newRole) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setSuccess(`User role updated to ${newRole} successfully.`);
      setIsEditingRole(false);
      setEditRole('');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user role.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRestore = async (userId) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/auth/users/${userId}/activate`);
      setSuccess('User restored successfully.');
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to restore user.');
    } finally {
      setActionLoading('');
      setOpenDialog(false);
    }
  };

  // ============================================
  // DIALOG HANDLERS
  // ============================================

  const openActionDialog = (action, user) => {
    setSelectedUser(user);
    setDialogAction(action);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setDialogAction('');
  };

  const confirmAction = () => {
    if (!selectedUser) return;

    switch (dialogAction) {
      case 'approve': handleApprove(selectedUser._id); break;
      case 'reject': handleReject(selectedUser._id); break;
      case 'activate': handleActivate(selectedUser._id); break;
      case 'deactivate': handleDeactivate(selectedUser._id); break;
      case 'delete': handleDelete(selectedUser._id); break;
      case 'restore': handleRestore(selectedUser._id); break;
      default: closeDialog();
    }
  };

  const startRoleEdit = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsEditingRole(true);
  };

  const cancelRoleEdit = () => {
    setIsEditingRole(false);
    setEditRole('');
    setSelectedUser(null);
  };

  // ============================================
  // FILTERS & HELPERS
  // ============================================

  const getStatus = (user) => {
    if (!user.isActive) return 'inactive';
    if (user.approval_status === 'pending' || 
        user.approval_status === 'pending_manager' || 
        user.approval_status === 'pending_admin') return 'pending';
    return 'active';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return '#EC4899';
      case 'admin': return '#8B5CF6';
      case 'manager': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      default: return 'Team Member';
    }
  };

  const getInitials = (user) => {
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const canEditRole = (user) => {
    if (!currentUser) return false;
    if (!['admin', 'super_admin'].includes(currentUser.role)) return false;
    return user.role !== 'super_admin' && user._id !== currentUser._id;
  };

  const canDelete = (user) => {
    if (!currentUser) return false;
    if (!['admin', 'super_admin'].includes(currentUser.role)) return false;
    return user.role !== 'super_admin' && user._id !== currentUser._id;
  };

  const canDeactivate = (user) => {
    if (!currentUser) return false;
    if (!['admin', 'super_admin'].includes(currentUser.role)) return false;
    return user.role !== 'super_admin' && user._id !== currentUser._id;
  };

  const getDialogTitle = () => {
    const actions = {
      approve: 'Approve User',
      reject: 'Reject User',
      activate: 'Activate User',
      deactivate: 'Deactivate User',
      delete: 'Delete User',
      restore: 'Restore User',
    };
    return actions[dialogAction] || 'Confirm Action';
  };

  const getDialogMessage = () => {
    if (!selectedUser) return '';
    const name = `${selectedUser.first_name} ${selectedUser.last_name}`;
    const messages = {
      approve: `Approve ${name}? This will activate their account.`,
      reject: `Reject ${name}? This will permanently deny their access.`,
      activate: `Activate ${name}? Their account will be restored.`,
      deactivate: `Deactivate ${name}? They will lose access immediately.`,
      delete: `Delete ${name}? This action cannot be undone.`,
      restore: `Restore ${name}? Their account will be reactivated.`,
    };
    return messages[dialogAction] || 'Are you sure?';
  };

  const getDialogColor = () => {
    const colors = {
      approve: '#10B981',
      reject: '#EF4444',
      activate: '#10B981',
      deactivate: '#F59E0B',
      delete: '#EF4444',
      restore: '#10B981',
    };
    return colors[dialogAction] || '#3B82F6';
  };

  // ============================================
  // FILTERS
  // ============================================

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((item) => {
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        const email = (item.email || '').toLowerCase();
        const teamNo = (item.team_no || '').toLowerCase();
        return fullName.includes(q) || email.includes(q) || teamNo.includes(q);
      });
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((item) => item.role === roleFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((item) => item.isActive === true && item.approval_status === 'approved');
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((item) => item.isActive === false);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((item) => 
        item.approval_status === 'pending' || 
        item.approval_status === 'pending_manager' || 
        item.approval_status === 'pending_admin'
      );
    }

    return filtered;
  }, [users, search, roleFilter, statusFilter]);

  // ============================================
  // STATS
  // ============================================

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive && u.approval_status === 'approved').length,
    pending: users.filter(u => u.approval_status === 'pending' || u.approval_status === 'pending_manager' || u.approval_status === 'pending_admin').length,
    inactive: users.filter(u => !u.isActive).length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" sx={{ letterSpacing: '-0.5px' }}>
            User Management
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            Manage all users, roles, and permissions across the platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <AddUserButton
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/users/create')}
          >
            Add User
          </AddUserButton>
          <IconButton 
            onClick={loadUsers} 
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
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Total Users</Typography>
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
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Pending</Typography>
            <Typography variant="h4" fontWeight={700} color="#F59E0B" sx={{ mt: 0.5 }}>
              {stats.pending}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard>
            <Typography color="#94A3B8" fontSize="13px" fontWeight={500}>Inactive</Typography>
            <Typography variant="h4" fontWeight={700} color="#EF4444" sx={{ mt: 0.5 }}>
              {stats.inactive}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
            }}
            sx={{
              flex: 1,
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'white',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#64748B' }}>Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Role"
              sx={{
                borderRadius: '12px',
                background: 'white',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
              }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="team_member">Team Member</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#64748B' }}>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{
                borderRadius: '12px',
                background: 'white',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* User List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3B82F6' }} />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #E2E8F0', py: 6 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="#334155" gutterBottom>No users found</Typography>
            <Typography variant="body2" color="#94A3B8">Try adjusting your search or filter criteria.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredUsers.map((user) => {
            const status = getStatus(user);
            const roleColor = getRoleColor(user.role);
            const isPending = status === 'pending';
            const isInactive = status === 'inactive';
            const isActive = status === 'active';

            return (
              <Grid item xs={12} key={user._id}>
                <UserCard>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      {/* User Info */}
                      <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: `${roleColor}20`,
                              color: roleColor,
                              fontWeight: 600,
                              fontSize: '18px',
                            }}
                          >
                            {getInitials(user)}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="h6" fontWeight={600} color="#1E293B">
                                {user.first_name} {user.last_name}
                              </Typography>
                              <RoleChip
                                label={getRoleLabel(user.role)}
                                rolecolor={roleColor}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Email sx={{ fontSize: 14, color: '#94A3B8' }} />
                              <Typography variant="body2" color="#64748B">
                                {user.email}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                              {user.team_no && (
                                <Chip 
                                  label={`Team: ${user.team_no}`} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ borderRadius: '6px', fontSize: '11px' }} 
                                />
                              )}
                              <Chip 
                                label={`ID: ${user.user_id}`} 
                                size="small" 
                                variant="outlined" 
                                sx={{ borderRadius: '6px', fontSize: '11px' }} 
                              />
                              <StatusChip
                                label={isActive ? 'Active' : isPending ? 'Pending' : 'Inactive'}
                                status={status}
                                size="small"
                              />
                            </Stack>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Actions */}
                      <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* Edit Role */}
                          {canEditRole(user) && (
                            isEditingRole && selectedUser?._id === user._id ? (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                  <Select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    size="small"
                                    sx={{ borderRadius: '8px' }}
                                  >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="team_member">Team Member</MenuItem>
                                  </Select>
                                </FormControl>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditRole(user._id, editRole)}
                                  disabled={actionLoading === user._id}
                                  sx={{ color: '#10B981' }}
                                >
                                  <Save />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={cancelRoleEdit}
                                  sx={{ color: '#EF4444' }}
                                >
                                  <Cancel />
                                </IconButton>
                              </Box>
                            ) : (
                              <Tooltip title="Edit Role">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => startRoleEdit(user)}
                                  sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    borderColor: '#8B5CF6',
                                    color: '#8B5CF6',
                                    '&:hover': { bgcolor: 'rgba(139,92,246,0.04)' },
                                  }}
                                >
                                  Edit Role
                                </Button>
                              </Tooltip>
                            )
                          )}

                          {/* Approve - For pending users */}
                          {isPending && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => openActionDialog('approve', user)}
                              disabled={actionLoading === user._id}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                                },
                              }}
                            >
                              {actionLoading === user._id ? 'Processing...' : 'Approve'}
                            </Button>
                          )}

                          {/* Reject - For pending users */}
                          {isPending && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Close />}
                              onClick={() => openActionDialog('reject', user)}
                              disabled={actionLoading === user._id}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                color: '#EF4444',
                                borderColor: '#EF4444',
                                '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
                              }}
                            >
                              {actionLoading === user._id ? 'Processing...' : 'Reject'}
                            </Button>
                          )}

                          {/* ✅ Activate - Only for inactive users */}
                          {isInactive && user.approval_status === 'approved' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Restore />}
                              onClick={() => openActionDialog('activate', user)}
                              disabled={actionLoading === user._id}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: '#10B981',
                                '&:hover': { background: '#059669' },
                              }}
                            >
                              {actionLoading === user._id ? 'Processing...' : 'Activate'}
                            </Button>
                          )}

                          {/* ✅ Deactivate - Only for active users */}
                          {canDeactivate(user) && isActive && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Block />}
                              onClick={() => openActionDialog('deactivate', user)}
                              disabled={actionLoading === user._id}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                color: '#F59E0B',
                                borderColor: '#F59E0B',
                                '&:hover': { bgcolor: 'rgba(245,158,11,0.04)' },
                              }}
                            >
                              {actionLoading === user._id ? 'Processing...' : 'Deactivate'}
                            </Button>
                          )}

                          {/* Delete */}
                          {canDelete(user) && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => openActionDialog('delete', user)}
                              disabled={actionLoading === user._id}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                color: '#EF4444',
                                borderColor: '#EF4444',
                                '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
                              }}
                            >
                              Delete
                            </Button>
                          )}

                          {/* Super Admin Badge */}
                          {user.role === 'super_admin' && (
                            <Chip
                              icon={<AdminPanelSettings />}
                              label="Super Admin"
                              size="small"
                              sx={{
                                borderRadius: '8px',
                                backgroundColor: '#EC489920',
                                color: '#EC4899',
                                fontWeight: 600,
                                border: '1px solid #EC489930',
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </UserCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirm Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: getDialogColor() }} />
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{getDialogMessage()}</DialogContentText>
          {selectedUser && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Typography variant="body2" color="#64748B">
                <strong>User:</strong> {selectedUser.first_name} {selectedUser.last_name}
              </Typography>
              <Typography variant="body2" color="#64748B">
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body2" color="#64748B">
                <strong>Role:</strong> {getRoleLabel(selectedUser.role)}
              </Typography>
              <Typography variant="body2" color="#64748B">
                <strong>Status:</strong> {getStatus(selectedUser) === 'active' ? 'Active' : getStatus(selectedUser) === 'pending' ? 'Pending' : 'Inactive'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={closeDialog} 
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
            onClick={confirmAction} 
            variant="contained"
            disabled={actionLoading === selectedUser?._id}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              backgroundColor: getDialogColor(),
              '&:hover': { backgroundColor: getDialogColor(), opacity: 0.85 },
            }}
          >
            {actionLoading === selectedUser?._id ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;