import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';


// COMPONENT IMPORTS
// Common Components
import AppLoader from './components/common/Feedback/AppLoader';
import Sidebar from './components/common/Sidebar/SideBar';

// Auth Components
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import CreateUserForm from './components/auth/CreateUserForm';

// Dashboard Components
import TeamMemberDashboard from './components/dashboards/TeamMember';
import SuperAdminDashboard from './components/dashboards/SuperAdmin';
import AdminDashboard from './components/dashboards/Admin';
import ManagerDashboard from './components/dashboards/Manager';

// Page Components
import Home from './pages/Home';
import Profile from './pages/Profile';
import Users from './contexts/Users';
import AdminReports from './pages/AdminReports';
import MyReports from './pages/MyReports';
import Projects from './pages/Projects';
import Categories from './pages/Category';
import Analytics from './pages/Analytics';
import TeamReports from './pages/TeamReports';
import TeamManagement from './pages/TeamManagement';

// Component Views
import ReportView from './components/reports/ReportView';
import ProjectView from './components/projects/ProjectView';
import ProjectForm from './components/projects/ProjectForm';
import CategoryForm from './components/category/CategoryForm';
import CategoryView from './components/category/CategoryView';

// API
import api from './api/axiosConfig';


// APP COMPONENT
function App() {
  // State Management
  const [showHome, setShowHome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // LOADER HANDLER
  const handleLoaderComplete = () => {
    setShowHome(true);
  };

  
  // AUTHENTICATION CHECK
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);


  // LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };


  // DASHBOARD ROUTE HELPER
  const getDashboardPath = (role) => {
    const dashboardMap = {
      super_admin: '/dashboard/super-admin',
      admin: '/dashboard/admin',
      manager: '/dashboard/manager',
      team_member: '/dashboard/team-member',
    };
    return dashboardMap[role] || '/dashboard/team-member';
  };

 
  // ROLE-BASED ACCESS HELPER
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  
  // RENDER

  // Show loader while app is loading
  if (!showHome) {
    return <AppLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar - Only show when authenticated */}
        {isAuthenticated && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            loading={loading}
            onLogout={handleLogout}
            isMobile={false}
          />
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: isAuthenticated ? 3 : 0,
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <Routes>
            {/* PUBLIC ROUTES - No Sidebar Required */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={getDashboardPath(user?.role)} replace />
                ) : (
                  <LoginForm />
                )
              }
            />

  
            {/* PROTECTED ROUTES - Authentication Required */}
            {/* Dashboard Redirect */}
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <Navigate to={getDashboardPath(user?.role)} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

         
            {/* DASHBOARD ROUTES - Role-Based Access */}
            {/* Super Admin Dashboard */}
            <Route
              path="/dashboard/super-admin"
              element={
                isAuthenticated && user?.role === 'super_admin' ? (
                  <SuperAdminDashboard />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/dashboard/admin"
              element={
                isAuthenticated && user?.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Manager Dashboard */}
            <Route
              path="/dashboard/manager"
              element={
                isAuthenticated && user?.role === 'manager' ? (
                  <ManagerDashboard />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Team Member Dashboard */}
            <Route
              path="/dashboard/team-member"
              element={
                isAuthenticated && user?.role === 'team_member' ? (
                  <TeamMemberDashboard />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

           
            {/* USER MANAGEMENT ROUTES */}
            {/* Profile - All Authenticated Users */}
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Users Management - Admin & Super Admin Only */}
            <Route
              path="/users"
              element={
                isAuthenticated && hasRole(['admin', 'super_admin']) ? (
                  <Users />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Create User - Admin & Super Admin Only */}
            <Route
              path="/users/create"
              element={
                isAuthenticated && hasRole(['admin', 'super_admin']) ? (
                  <CreateUserForm />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            
            {/* REPORT ROUTES */}
            {/* My Reports - All Authenticated Users */}
            <Route
              path="/reports"
              element={
                isAuthenticated ? (
                  <MyReports />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Report View - All Authenticated Users */}
            <Route
              path="/reports/view/:id"
              element={
                isAuthenticated ? (
                  <ReportView />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Admin Reports - Admin & Super Admin Only */}
            <Route
              path="/admin-reports"
              element={
                isAuthenticated && hasRole(['admin', 'super_admin']) ? (
                  <AdminReports />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Team Reports - Manager Only */}
            <Route
              path="/team-reports"
              element={
                isAuthenticated && user?.role === 'manager' ? (
                  <TeamReports />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

           
            {/* PROJECT ROUTES - All Authenticated Users */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/create" element={<ProjectForm mode="create" />} />
            <Route path="/projects/edit/:id" element={<ProjectForm mode="edit" />} />
            <Route path="/projects/view/:id" element={<ProjectView />} />

          
            {/* CATEGORY ROUTES - All Authenticated Users */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/create" element={<CategoryForm mode="create" />} />
            <Route path="/categories/edit/:id" element={<CategoryForm mode="edit" />} />
            <Route path="/categories/view/:id" element={<CategoryView />} />

            
            {/* ANALYTICS ROUTES - Manager, Admin, Super Admin */}
            <Route
              path="/analytics"
              element={
                isAuthenticated && hasRole(['manager', 'admin', 'super_admin']) ? (
                  <Analytics />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

         
            {/* TEAM MANAGEMENT - Manager Only */}

            <Route
              
              element={
                isAuthenticated && user?.role === 'manager' ? (
                  <Users />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            <Route
                       path="/team"
  element={
    isAuthenticated && user?.role === 'manager' ? (
      <TeamManagement />
    ) : (
      <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
    )
  }
/>
            

           
            {/* CATCH ALL ROUTE */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;