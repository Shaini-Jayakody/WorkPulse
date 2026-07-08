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
import Navbar from '../common/Navbar';
import api from '../../api/axiosConfig';

const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  padding: '96px 16px 48px',
  backgroundImage: 'linear-gradient(135deg, rgba(5, 11, 22, 0.94) 0%, rgba(8, 18, 38, 0.92) 45%, rgba(15, 23, 42, 0.9) 100%), url(/assets/images/Home.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

const LoginCard = styled(Paper)({
  position: 'relative',
  zIndex: 2,
  borderRadius: '20px',
  padding: '44px 40px',
  maxWidth: '520px',
  width: '100%',
  background: 'rgba(15, 23, 42, 0.78)',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(96, 165, 250, 0.12)',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.35)',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#E2E8F0',
    '& fieldset': {
      borderColor: 'rgba(148, 163, 184, 0.22)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(96, 165, 250, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#60A5FA',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94A3B8',
    '&.Mui-focused': {
      color: '#93C5FD',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#FCA5A5',
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
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.28)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
});

const validationSchema = Yup.object({
  email: Yup.string().required('Email is required').email('Enter a valid email'),
  password: Yup.string().required('Password is required'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await api.post('/auth/login', values);
        if (response.data.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box>
      <Navbar />
      <LoginContainer>
        <Container maxWidth="sm">
          <LoginCard elevation={0}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                color: '#94A3B8',
                '&:hover': { color: '#3B82F6' },
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box textAlign="left" mb={3}>
              <Typography variant="h4" fontWeight={700} color="#E2E8F0">
                Login
              </Typography>
              <Typography variant="body2" color="#94A3B8" mt={0.5}>
                Sign in to continue
              </Typography>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((value) => !value)}
                            edge="end"
                            size="small"
                            sx={{ color: '#94A3B8' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <GradientButton type="submit" fullWidth disabled={loading || !formik.isValid}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                  </GradientButton>
                </Grid>
                <Grid item xs={12}>
                  <Typography textAlign="center" color="#94A3B8" variant="body2">
                    Need an account?{' '}
                    <Link to="/register" style={{ color: '#93C5FD', textDecoration: 'none', fontWeight: 600 }}>
                      Register
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </LoginCard>
        </Container>
      </LoginContainer>
    </Box>
  );
};

export default LoginForm;