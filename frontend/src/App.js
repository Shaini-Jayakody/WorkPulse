import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import AppLoader from './components/common/Feedback/AppLoader';
import Home from './pages/Home';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import TeamMemberDashboard from './components/dashboards/TeamMember';
import SuperAdminDashboard from './components/dashboards/SuperAdmin';
import Sidebar from './components/common/Sidebar/SideBar';
import Users from './contexts/Users';
import CreateUserForm from './components/auth/CreateUserForm';
import Profile from './pages/Profile';
import AdminReports from './pages/AdminReports';
import MyReports from './pages/MyReports';
import ReportView from './components/reports/ReportView';
import Projects from './pages/Projects';
import ProjectView from './components/projects/ProjectView';
import ProjectForm from './components/projects/ProjectForm';
import Categories from './pages/Category';
import CategoryForm from './components/category/CategoryForm';
import CategoryView from './components/category/CategoryView';

import api from './api/axiosConfig';

function App() {
  const [showHome, setShowHome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoaderComplete = () => {
    setShowHome(true);
  };

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Fetch user profile from API
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getDashboardPath = (role) => {
    if (role === 'super_admin') {
      return '/dashboard/super-admin';
    }
    return '/dashboard/team-member';
  };

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
            {/* PUBLIC ROUTES - No Sidebar*/}
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
            
            {/* PROTECTED ROUTES - With Sidebar */}
            
            {/* Dashboard */}
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

            <Route
              path="/dashboard/team-member"
              element={
                isAuthenticated ? (
                  <TeamMemberDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

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

            {/* Profile */}
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

            {/* My Reports - Team Member */}
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
            <Route path="/projects" element={<Projects />} />
<Route path="/projects/create" element={<ProjectForm mode="create" />} />
<Route path="/projects/edit/:id" element={<ProjectForm mode="edit" />} />
<Route path="/projects/view/:id" element={<ProjectView />} />

            {/* Report View - Team Member */}
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

            {/* Admin Reports - Admin/Super Admin */}
            <Route
              path="/admin-reports"
              element={
                isAuthenticated && ['admin', 'super_admin'].includes(user?.role) ? (
                  <AdminReports />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />
          <Route path="/categories" element={<Categories />} />
<Route path="/categories/create" element={<CategoryForm mode="create" />} />
<Route path="/categories/edit/:id" element={<CategoryForm mode="edit" />} />
<Route path="/categories/view/:id" element={<CategoryView />} />

            {/* Users Management - Admin/Super Admin */}
            <Route
              path="/users"
              element={
                isAuthenticated && ['admin', 'super_admin'].includes(user?.role) ? (
                  <Users />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />

            {/* Create User - Admin/Super Admin */}
            <Route
              path="/users/create"
              element={
                isAuthenticated && ['admin', 'super_admin'].includes(user?.role) ? (
                  <CreateUserForm />
                ) : (
                  <Navigate to={isAuthenticated ? getDashboardPath(user?.role) : "/login"} replace />
                )
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;