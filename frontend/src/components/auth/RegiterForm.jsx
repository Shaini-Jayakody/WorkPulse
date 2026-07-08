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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Avatar,
  Badge as MuiBadge,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  ArrowBack,
  CheckCircle,
  Error as ErrorIcon,
  Badge,
  Work,
  Business,
  PhotoCamera,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../api/axiosConfig';

// ============================================
// STYLED COMPONENTS
// ============================================

const RegisterContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'relative',
  overflow: 'hidden',
  padding: '60px 0',
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
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 58, 138, 0.4) 50%, rgba(99, 102, 241, 0.3) 100%)',
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

const RegisterCard = styled(Paper)({
  position: 'relative',
  zIndex: 2,
  borderRadius: '20px',
  padding: '48px 44px',
  maxWidth: '560px',
  width: '100%',
  marginRight: '3%',
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  maxHeight: '90vh',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#CBD5E1',
    borderRadius: '4px',
  },
});

const StyledTextField = styled(TextField)(({ hasError, isValid }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.6)',
    transition: 'all 0.2s ease',
    border: `1px solid ${hasError ? '#EF4444' : isValid ? '#10B981' : 'rgba(226, 232, 240, 0.6)'}`,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.8)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: hasError ? '#EF4444' : isValid ? '#10B981' : '#3B82F6',
      boxShadow: hasError 
        ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
        : isValid 
          ? '0 0 0 3px rgba(16, 185, 129, 0.1)'
          : '0 0 0 3px rgba(59, 130, 246, 0.08)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748B',
    fontWeight: 500,
    '&.Mui-focused': {
      color: hasError ? '#EF4444' : isValid ? '#10B981' : '#3B82F6',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 4,
    fontWeight: 400,
    fontSize: '0.75rem',
    color: hasError ? '#EF4444' : '#94A3B8',
  },
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  padding: '16px',
  borderRadius: '12px',
  fontSize: '17px',
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
    background: '#94A3B8',
    boxShadow: 'none',
    transform: 'none',
  },
});

const PasswordRequirement = styled(Box)(({ fulfilled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '12px',
  color: fulfilled ? '#10B981' : '#94A3B8',
  transition: 'all 0.3s ease',
  backgroundColor: fulfilled ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
  border: `1px solid ${fulfilled ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}`,
}));

const ProfilePictureWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '20px',
});

const AvatarUpload = styled('label')({
  cursor: 'pointer',
  position: 'relative',
  display: 'inline-block',
});

const StyledAvatar = styled(Avatar)({
  width: 100,
  height: 100,
  border: '4px solid rgba(59, 130, 246, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '4px solid #3B82F6',
    transform: 'scale(1.02)',
  },
});

const UploadIcon = styled(Box)({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#3B82F6',
  borderRadius: '50%',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid white',
  '&:hover': {
    backgroundColor: '#2563EB',
  },
});

// ============================================
// VALIDATION SCHEMA
// ============================================

const validationSchema = Yup.object({
  first_name: Yup.string()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s-]+$/, 'Only letters, spaces, and hyphens allowed'),
  last_name: Yup.string()
    .required('Last name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s-]+$/, 'Only letters, spaces, and hyphens allowed'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/\d/, 'Must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
  contact_no: Yup.string()
    .required('Contact number is required')
    .matches(/^\+?[\d\s-]{10,15}$/, 'Enter a valid contact number (10-15 digits)'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['team_member', 'manager', 'admin'], 'Invalid role'),
});

// ============================================
// COMPONENT
// ============================================

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      contact_no: '',
      role: 'team_member',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { confirmPassword, ...userData } = values;
        
        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
          formData.append(key, userData[key]);
        });
        
        if (profileFile) {
          formData.append('profile_picture', profileFile);
        }

        console.log('📤 Registering user:', userData.email);
        
        const response = await api.post('/auth/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Registration response:', response.data);

        if (response.data.success) {
          setSuccess('Registration successful! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        console.error('❌ Registration error:', err);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (err.response) {
          errorMessage = err.response.data?.message || errorMessage;
          
          if (err.response.data?.errors) {
            const errors = err.response.data.errors;
            const errorMessages = errors.map(e => e.message).join(', ');
            errorMessage = errorMessages;
          }
          
          if (err.response.status === 409) {
            errorMessage = 'Email or contact number already registered.';
          }
        } else if (err.request) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be smaller than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setProfileFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const getFieldStatus = (fieldName) => {
    const value = formik.values[fieldName];
    const touched = formik.touched[fieldName];
    const error = formik.errors[fieldName];
    
    if (!touched && !value) return 'idle';
    if (touched && error) return 'error';
    if (touched && value && !error) return 'valid';
    return 'idle';
  };

  const getFieldIcon = (fieldName) => {
    const status = getFieldStatus(fieldName);
    if (status === 'error') return <ErrorIcon sx={{ color: '#EF4444', fontSize: 18 }} />;
    if (status === 'valid') return <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />;
    return null;
  };

  const getPasswordChecks = () => {
    const pwd = formik.values.password;
    return [
      { label: '8+ characters', fulfilled: pwd.length >= 8 },
      { label: 'Uppercase letter', fulfilled: /[A-Z]/.test(pwd) },
      { label: 'Lowercase letter', fulfilled: /[a-z]/.test(pwd) },
      { label: 'Number', fulfilled: /\d/.test(pwd) },
      { label: 'Special character', fulfilled: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
    ];
  };

  return (
    <RegisterContainer>
      {/* Left Side - WorkPulse Name */}
      <LeftContent>
        <Typography
          variant="h1"
          fontWeight={700}
          sx={{
            color: 'white',
            fontSize: { xs: '48px', md: '88px' },
            textShadow: '0 4px 40px rgba(0,0,0,0.25)',
            letterSpacing: '-2px',
          }}
        >
          WorkPulse
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            mt: 1.5,
            fontWeight: 300,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontSize: { xs: '14px', md: '18px' },
          }}
        >
          The Pulse of Productivity
        </Typography>
      </LeftContent>

      {/* Right Side - Registration Form */}
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', pr: { xs: 2, md: 4 } }}>
        <RegisterCard elevation={0}>
          {/* Back Button */}
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              color: '#94A3B8',
              transition: 'all 0.2s',
              '&:hover': { color: '#3B82F6' },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Header */}
          <Box textAlign="left" mb={2}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#1E293B"
              sx={{ letterSpacing: '-0.5px' }}
            >
              Register
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.5}>
              Create your account to get started
            </Typography>
          </Box>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2.5}>
              {/* ============================================
                  PROFILE PICTURE UPLOAD
                  ============================================ */}
              <Grid item xs={12}>
                <ProfilePictureWrapper>
                  <AvatarUpload>
                    <StyledAvatar
                      src={profilePreview || '/default-avatar.png'}
                      alt="Profile Picture"
                    >
                      {!profilePreview && <Person sx={{ fontSize: 40, color: '#94A3B8' }} />}
                    </StyledAvatar>
                    <UploadIcon>
                      <PhotoCamera sx={{ fontSize: 20, color: 'white' }} />
                    </UploadIcon>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                  </AvatarUpload>
                  <Typography variant="caption" color="#94A3B8">
                    Click to upload profile picture (Max 5MB)
                  </Typography>
                </ProfilePictureWrapper>
              </Grid>

              {/* First Name & Last Name */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  placeholder="John"
                  size="medium"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  hasError={getFieldStatus('first_name') === 'error'}
                  isValid={getFieldStatus('first_name') === 'valid'}
                  helperText={
                    getFieldStatus('first_name') === 'error' 
                      ? formik.errors.first_name 
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('first_name')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  placeholder="Doe"
                  size="medium"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  hasError={getFieldStatus('last_name') === 'error'}
                  isValid={getFieldStatus('last_name') === 'valid'}
                  helperText={
                    getFieldStatus('last_name') === 'error' 
                      ? formik.errors.last_name 
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('last_name')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

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
                  hasError={getFieldStatus('email') === 'error'}
                  isValid={getFieldStatus('email') === 'valid'}
                  helperText={
                    getFieldStatus('email') === 'error' 
                      ? formik.errors.email 
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('email')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="contact_no"
                  placeholder="+1 234 567 8900"
                  size="medium"
                  value={formik.values.contact_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  hasError={getFieldStatus('contact_no') === 'error'}
                  isValid={getFieldStatus('contact_no') === 'valid'}
                  helperText={
                    getFieldStatus('contact_no') === 'error' 
                      ? formik.errors.contact_no 
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('contact_no')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password with Visibility Toggle */}
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
                  hasError={getFieldStatus('password') === 'error'}
                  isValid={getFieldStatus('password') === 'valid'}
                  helperText={
                    getFieldStatus('password') === 'error' 
                      ? formik.errors.password 
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
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
                
                {/* Password Requirements */}
                {formik.values.password && (
                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getPasswordChecks().map((check, idx) => (
                      <PasswordRequirement key={idx} fulfilled={check.fulfilled}>
                        {check.fulfilled ? '✓' : '○'} {check.label}
                      </PasswordRequirement>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Confirm Password with Visibility Toggle */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  size="medium"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  hasError={getFieldStatus('confirmPassword') === 'error'}
                  isValid={getFieldStatus('confirmPassword') === 'valid'}
                  helperText={
                    getFieldStatus('confirmPassword') === 'error' 
                      ? formik.errors.confirmPassword 
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Role"
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.8)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.08)',
                      },
                    }}
                  >
                    <MenuItem value="team_member">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Work sx={{ fontSize: 18, color: '#3B82F6' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Team Member</Typography>
                          <Typography variant="caption" color="#94A3B8">Create and manage reports</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="manager">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Badge sx={{ fontSize: 18, color: '#8B5CF6' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Manager</Typography>
                          <Typography variant="caption" color="#94A3B8">View analytics and team reports</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Business sx={{ fontSize: 18, color: '#EC4899' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Admin</Typography>
                          <Typography variant="caption" color="#94A3B8">Full system access</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <FormHelperText error>{formik.errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Register Button */}
              <Grid item xs={12}>
                <GradientButton
                  type="submit"
                  fullWidth
                  disabled={loading || !formik.isValid || !formik.dirty}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </GradientButton>
              </Grid>

              {/* Login Link */}
              <Grid item xs={12}>
                <Typography textAlign="center" color="#64748B" variant="body2">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#3B82F6',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.color = '#2563EB')}
                    onMouseLeave={(e) => (e.target.style.color = '#3B82F6')}
                  >
                    Log In
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </RegisterCard>
      </Container>
    </RegisterContainer>
  );
};

export default Register;