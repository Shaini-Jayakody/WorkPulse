import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack } from '@mui/icons-material';
import api from '../../api/axiosConfig';


// STYLED COMPONENTS 
const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'relative',
  overflow: 'hidden',
  padding: '40px 0',
  backgroundImage: 'url(/assets/images/Home.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.6) 50%, rgba(99, 102, 241, 0.5) 100%)',
    zIndex: 1,
  },
});

const LeftContent = styled(Box)({
  position: 'absolute',
  zIndex: 2,
  left: '6%',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'white',
});

const LoginCard = styled(Paper)({
  position: 'relative',
  zIndex: 2,
  borderRadius: '24px',
  padding: '44px 44px',
  maxWidth: '520px',
  width: '100%',
  marginRight: '4%',
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
  border: '1px solid rgba(255,255,255,0.12)',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.15)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.12)',
    },
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.15)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.25)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3B82F6',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#3B82F6',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.3)',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 4,
    fontWeight: 400,
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  padding: '14px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.15)',
    boxShadow: 'none',
    transform: 'none',
    color: 'rgba(255,255,255,0.3)',
  },
});

// VALIDATION SCHEMA

const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});


// COMPONENT
const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getDashboardPath = (role) => {
    if (role === 'super_admin') {
      return '/dashboard/super-admin';
    }
    return '/dashboard/team-member';
  };

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await api.post('/auth/login', values);
        
        if (response.data.success) {
          const token = response?.data?.data?.token;
          const role = response?.data?.data?.user?.role;

          if (token) {
            localStorage.setItem('token', token);
          }

          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            window.location.assign(getDashboardPath(role));
          }, 1000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <LoginContainer>
      {/* Left Side - WorkPulse */}
      <LeftContent>
        <Typography
          variant="h1"
          fontWeight={700}
          sx={{
            color: 'white',
            fontSize: { xs: '40px', md: '80px' },
            textShadow: '0 4px 40px rgba(0,0,0,0.3)',
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          WorkPulse
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            mt: 1.5,
            fontWeight: 300,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            fontSize: { xs: '13px', md: '16px' },
          }}
        >
          The Pulse of Productivity
        </Typography>
      </LeftContent>

      {/* Login Form - Right Aligned */}
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', pr: { xs: 2, md: 4 } }}>
        <LoginCard elevation={0}>
          {/* Back Button */}
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              '&:hover': { color: '#3B82F6' },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="white"
              sx={{ letterSpacing: '-0.5px' }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={0.5}>
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          {/* Messages */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                fontSize: '13px', 
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'rgba(255,255,255,0.95)',
                borderColor: 'rgba(16, 185, 129, 0.2)',
              }}
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                fontSize: '13px', 
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'rgba(255,255,255,0.95)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Email */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  size="medium"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  size="medium"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Forgot Password */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    component={Link}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#60A5FA' },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
              </Grid>

              {/* Login Button */}
              <Grid item xs={12}>
                <GradientButton
                  type="submit"
                  fullWidth
                  disabled={loading || !formik.isValid || !formik.dirty}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </GradientButton>
              </Grid>

              {/* Register Link */}
              <Grid item xs={12}>
                <Typography textAlign="center" sx={{ color: 'rgba(255,255,255,0.4)' }} variant="body2" fontSize="13px">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#60A5FA',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.color = '#93C5FD')}
                    onMouseLeave={(e) => (e.target.style.color = '#60A5FA')}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </LoginCard>
      </Container>
    </LoginContainer>
  );
};

export default LoginForm;