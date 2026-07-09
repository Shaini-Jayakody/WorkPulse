import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard,
  Assessment,
  Category,
  People,
  Logout,
  EventNote,
  BarChart,
  Group,
  Work,
  Person,
  AdminPanelSettings,
  People as PeopleIcon,
  Description,
} from '@mui/icons-material';

// STYLED COMPONENTS
const SidebarHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 20px',
  minHeight: '72px',
});

const Logo = styled('img')({
  height: 32,
  width: 'auto',
  objectFit: 'contain',
  filter: 'brightness(0) invert(1)',
});

const UserProfile = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 16px',
  textAlign: 'center',
});

const UserAvatar = styled(Avatar)({
  width: 72,
  height: 72,
  border: '3px solid rgba(255,255,255,0.15)',
  marginBottom: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '3px solid rgba(255,255,255,0.3)',
    transform: 'scale(1.02)',
  },
});

const UserName = styled(Typography)({
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '16px',
});

const UserRole = styled(Typography)({
  color: 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const UserTeam = styled(Typography)({
  color: 'rgba(255,255,255,0.4)',
  fontSize: '11px',
  fontWeight: 400,
  marginTop: '4px',
});

const StyledListItem = styled(ListItemButton)(({ active }) => ({
  borderRadius: '10px',
  margin: '4px 12px',
  padding: '10px 16px',
  backgroundColor: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
  color: active ? '#60A5FA' : 'rgba(255,255,255,0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
  },
  '& .MuiListItemIcon-root': {
    color: active ? '#60A5FA' : 'rgba(255,255,255,0.5)',
    minWidth: '36px',
  },
  '&:hover .MuiListItemIcon-root': {
    color: '#FFFFFF',
  },
}));

const StyledListItemText = styled(ListItemText)({
  '& .MuiListItemText-primary': {
    fontSize: '14px',
    fontWeight: 500,
  },
});

const NavSection = styled(Box)({
  padding: '8px 0',
});

const SectionLabel = styled(Typography)({
  color: 'rgba(255,255,255,0.3)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '8px 24px 8px 28px',
});

const LogoutButton = styled(ListItemButton)({
  borderRadius: '10px',
  margin: '4px 12px',
  padding: '10px 16px',
  color: 'rgba(255,255,255,0.6)',
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
  },
  '&:hover .MuiListItemIcon-root': {
    color: '#EF4444',
  },
  '& .MuiListItemIcon-root': {
    color: 'rgba(255,255,255,0.4)',
    minWidth: '36px',
  },
});

const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100%',
});

// COMPONENT
const Sidebar = ({ 
  open, 
  user, 
  loading = false,
  onLogout,
  isMobile = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items
  const mainNavItems = [
    { 
      label: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      roles: ['team_member', 'manager', 'admin', 'super_admin'],
    },
    { 
      label: 'My Reports', 
      icon: <EventNote />, 
      path: '/reports',
      roles: ['team_member', 'manager', 'admin', 'super_admin'],
    },
    { 
      label: 'Team Reports', 
      icon: <Group />, 
      path: '/team-reports',
      roles: ['manager', 'admin'],
    },
    { 
      label: 'Analytics', 
      icon: <BarChart />, 
      path: '/analytics',
      roles: ['manager', 'admin'],
    },
     { 
      label: 'Profile', 
      icon: <Person />, 
      path: '/profile',
      roles: ['team_member', 'manager', 'admin', 'super_admin'],
    },
  ];

  const managementNavItems = [
    { 
      label: 'Projects', 
      icon: <Work />,
      path: '/projects',
      roles: ['manager', 'admin', 'super_admin'], 
    },
    { 
      label: 'Categories', 
      icon: <Category />, 
      path: '/categories',
      roles: ['manager', 'admin'],
    },
    { 
      label: 'Team Management', 
      icon: <People />, 
      path: '/team',
      roles: ['manager', 'admin'],
    },
   
  ];

  // Super Admin specific nav items
  const superAdminNavItems = [
    { 
      label: 'Users', 
      icon: <PeopleIcon />, 
      path: '/users',
      roles: ['admin', 'super_admin'],
    },
  ];

  // Admin Reports
  const adminReportsNavItems = [
    { 
      label: 'All Reports', 
      icon: <Description />, 
      path: '/admin-reports',
      roles: ['admin', 'super_admin'],
    },
  ];

  // Combine all nav items
  const allNavItems = [
    ...mainNavItems, 
    ...superAdminNavItems, 
    ...adminReportsNavItems, 
    ...managementNavItems
  ];

  // Filter items based on user role
  const getVisibleItems = (items) => {
    if (!user) return items;
    return items.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  };

  const visibleNavItems = getVisibleItems(allNavItems);

  // Split into sections
  const mainNav = visibleNavItems.filter(item => 
    ['Dashboard', 'My Reports', 'Team Reports', 'Analytics', 'Users', 'All Reports'].includes(item.label)
  );
  
  const managementNav = visibleNavItems.filter(item => 
    ['Projects', 'Categories', 'Team Management', 'Profile'].includes(item.label)
  );

  // Get user data
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return 'User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  };

  const getRoleDisplay = () => {
    if (!user) return 'Guest';
    const roleMap = {
      team_member: 'Team Member',
      manager: 'Manager',
      admin: 'Administrator',
      super_admin: 'Super Admin',
    };
    return roleMap[user.role] || user.role || 'Guest';
  };

  if (loading) {
    return (
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <SidebarHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Logo 
            src="/assets/images/logo.png" 
            alt="WorkPulse Logo"
          />
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '0.5px',
            }}
          >
            WorkPulse
          </Typography>
        </Box>
      </SidebarHeader>

      {/* User Profile */}
      <UserProfile>
        <Tooltip title="View Profile" arrow>
          <UserAvatar 
            src={user?.profile_picture_url || '/default-avatar.png'}
            onClick={() => handleNavigate('/profile')}
            sx={{ cursor: 'pointer' }}
          >
            {!user?.profile_picture_url && getUserInitials()}
          </UserAvatar>
        </Tooltip>
        <UserName>{getFullName()}</UserName>
        <UserRole>{getRoleDisplay()}</UserRole>
        {user?.team_no && (
          <UserTeam>Team {user.team_no}</UserTeam>
        )}
      </UserProfile>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Main Navigation */}
      <NavSection>
        <SectionLabel>Main</SectionLabel>
        <List disablePadding>
          {mainNav.map((item) => (
            <ListItem key={item.path} disablePadding>
              <StyledListItem
                active={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <StyledListItemText primary={item.label} />
              </StyledListItem>
            </ListItem>
          ))}
        </List>
      </NavSection>

      {/* Management Navigation */}
      {managementNav.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />
          <NavSection>
            <SectionLabel>Management</SectionLabel>
            <List disablePadding>
              {managementNav.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <StyledListItem
                    active={isActive(item.path)}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <StyledListItemText primary={item.label} />
                  </StyledListItem>
                </ListItem>
              ))}
            </List>
          </NavSection>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, mt: 'auto' }} />

      {/* Logout */}
      <Box sx={{ p: 1, pb: 2 }}>
        <LogoutButton onClick={onLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ 
              '& .MuiListItemText-primary': { 
                fontSize: '14px', 
                fontWeight: 500 
              } 
            }} 
          />
        </LogoutButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;