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
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
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
  Badge as BadgeIcon,
  Work,
  PhotoCamera,
  Event,
  Home,
  Group,
  Info,
  Warning,
  Check,
  PersonAdd,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../api/axiosConfig';

// STYLED COMPONENTS
const RegisterContainer = styled(Box)({
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
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.5) 50%, rgba(99, 102, 241, 0.4) 100%)',
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
  padding: '32px 36px',
  maxWidth: '520px',
  width: '100%',
  marginRight: '3%',
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
  border: '1px solid rgba(255,255,255,0.3)',
  maxHeight: '92vh',
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

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F1F5F9',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.08)',
    },
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3B82F6',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748B',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#3B82F6',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 4,
    fontWeight: 400,
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  padding: '12px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 24px rgba(59, 130, 246, 0.35)',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
  '&:disabled': {
    background: '#CBD5E1',
    boxShadow: 'none',
    transform: 'none',
  },
});

const PasswordRequirement = styled(Box)(({ fulfilled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  color: fulfilled ? '#10B981' : '#94A3B8',
  transition: 'all 0.3s ease',
  backgroundColor: fulfilled ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
}));

const ProfilePictureWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '12px',
});

const AvatarUpload = styled('label')({
  cursor: 'pointer',
  position: 'relative',
  display: 'inline-block',
});

const StyledAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  border: '3px solid #E2E8F0',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '3px solid #3B82F6',
    transform: 'scale(1.03)',
  },
});

const UploadIcon = styled(Box)({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#3B82F6',
  borderRadius: '50%',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid white',
  '&:hover': {
    backgroundColor: '#2563EB',
  },
});

const ApprovalAlert = styled(Alert)({
  borderRadius: '10px',
  border: '1px solid',
  padding: '8px 12px',
  '&.MuiAlert-standardInfo': {
    borderColor: 'rgba(59, 130, 246, 0.15)',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  '&.MuiAlert-standardWarning': {
    borderColor: 'rgba(245, 158, 11, 0.15)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  '& .MuiAlert-icon': {
    fontSize: '18px',
  },
});

// VALIDATION SCHEMA
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
  birthday: Yup.date()
    .required('Birthday is required')
    .max(new Date(), 'Birthday cannot be in the future')
    .test('minimum-age', 'You must be at least 18 years old', (value) => {
      if (!value) return false;
      const today = new Date();
      let age = today.getFullYear() - value.getFullYear();
      const monthDiff = today.getMonth() - value.getMonth();
      const dayDiff = today.getDate() - value.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
      }

      return age >= 18;
    }),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Invalid gender'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(250, 'Address cannot exceed 250 characters'),
  team_no: Yup.string()
    .required('Team number is required')
    .min(1, 'Team number is required')
    .max(50, 'Team number cannot exceed 50 characters'),
});


// COMPONENT

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      contact_no: '',
      role: 'team_member',
      birthday: '',
      gender: '',
      address: '',
      team_no: '',
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
        
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
          formData.append(key, userData[key]);
        });
        
        if (profileFile) {
          formData.append('profile_picture', profileFile);
        }

        const response = await api.post('/auth/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const roleMessage = values.role === 'team_member' 
            ? 'Your account requires manager approval before you can log in.'
            : values.role === 'manager'
              ? 'Your account requires admin approval before you can log in.'
              : 'Account created successfully!';
          
          setSuccess(`Registration successful! ${roleMessage} Redirecting to login...`);
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
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
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be smaller than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setProfileFile(file);
      
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
    if (status === 'error') return <ErrorIcon sx={{ color: '#EF4444', fontSize: 16 }} />;
    if (status === 'valid') return <CheckCircle sx={{ color: '#10B981', fontSize: 16 }} />;
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

  const getApprovalMessage = () => {
    const role = formik.values.role;
    if (role === 'team_member') {
      return {
        severity: 'info',
        icon: <Info />,
        title: 'Manager Approval Required',
        message: 'Team members must be approved by the manager before log in. You will receive an email notification once approved.',
        color: '#3B82F6',
      };
    } else if (role === 'manager') {
      return {
        severity: 'warning',
        icon: <Warning />,
        title: 'Admin Approval Required',
        message: 'Managers need admin approval before accessing the system. Please wait for the verification.',
        color: '#F59E0B',
      };
    } else {
      return {
        severity: 'info',
        icon: <Info />,
        title: 'Admin Account',
        message: 'Admin accounts are created by existing admins only. Please contact your system administrator.',
        color: '#8B5CF6',
      };
    }
  };

  const approvalInfo = getApprovalMessage();

  // Check if basic info is complete
  const isBasicInfoComplete = () => {
    const { first_name, last_name, email, contact_no, birthday, gender, address, team_no } = formik.values;
    return first_name && last_name && email && contact_no && birthday && gender && address && team_no;
  };

  // Check if password section is complete
  const isPasswordComplete = () => {
    const { password, confirmPassword } = formik.values;
    return password && confirmPassword && !formik.errors.password && !formik.errors.confirmPassword;
  };

  return (
    <RegisterContainer>
      {/* Left Side - WorkPulse */}
      <LeftContent>
        <Typography
          variant="h1"
          fontWeight={700}
          sx={{
            color: 'white',
            fontSize: { xs: '40px', md: '72px' },
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
            mt: 1,
            fontWeight: 300,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontSize: { xs: '13px', md: '16px' },
          }}
        >
          The Pulse of Productivity
        </Typography>
      </LeftContent>

      {/* Registration Form */}
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', pr: { xs: 2, md: 4 } }}>
        <RegisterCard elevation={0}>
          {/* Back Button */}
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: '#94A3B8',
              transition: 'all 0.2s',
              '&:hover': { color: '#3B82F6' },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Header */}
          <Box textAlign="center" mb={2}>
            <Typography
              variant="h5"
              fontWeight={700}
              color="#1E293B"
              sx={{ letterSpacing: '-0.5px' }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="#94A3B8" mt={0.5}>
              Join WorkPulse and start tracking your team's pulse
            </Typography>
          </Box>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: '13px' }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '13px' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Profile Picture */}
              <Grid item xs={12}>
                <ProfilePictureWrapper>
                  <AvatarUpload>
                    <StyledAvatar
                      src={profilePreview || '/default-avatar.png'}
                      alt="Profile Picture"
                    >
                      {!profilePreview && <Person sx={{ fontSize: 36, color: '#94A3B8' }} />}
                    </StyledAvatar>
                    <UploadIcon>
                      <PhotoCamera sx={{ fontSize: 16, color: 'white' }} />
                    </UploadIcon>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                  </AvatarUpload>
                  <Typography variant="caption" color="#94A3B8" sx={{ fontSize: '11px' }}>
                    Upload profile picture (Optional, Max 5MB)
                  </Typography>
                </ProfilePictureWrapper>
              </Grid>

              {/* Name Fields */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  placeholder="John"
                  size="small"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('first_name') === 'error' ? formik.errors.first_name : ''}
                  error={getFieldStatus('first_name') === 'error'}
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
                  size="small"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('last_name') === 'error' ? formik.errors.last_name : ''}
                  error={getFieldStatus('last_name') === 'error'}
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
                  size="small"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('email') === 'error' ? formik.errors.email : ''}
                  error={getFieldStatus('email') === 'error'}
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

              {/* Phone */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="contact_no"
                  placeholder="+1 234 567 8900"
                  size="small"
                  value={formik.values.contact_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('contact_no') === 'error' ? formik.errors.contact_no : ''}
                  error={getFieldStatus('contact_no') === 'error'}
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

              {/* Birthday & Gender */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Birthday"
                  name="birthday"
                  type="date"
                  size="small"
                  value={formik.values.birthday}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('birthday') === 'error' ? formik.errors.birthday : ''}
                  error={getFieldStatus('birthday') === 'error'}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Event sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('birthday')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={formik.touched.gender && Boolean(formik.errors.gender)}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Gender"
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#F8FAFC',
                      '&:hover': { backgroundColor: '#F1F5F9' },
                      '&.Mui-focused': {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.08)',
                      },
                    }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  placeholder="House no, street, city"
                  size="small"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('address') === 'error' ? formik.errors.address : ''}
                  error={getFieldStatus('address') === 'error'}
                  multiline
                  minRows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('address')}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Team Number */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Team Number"
                  name="team_no"
                  placeholder="Enter your team number (e.g., TEAM-01)"
                  size="small"
                  value={formik.values.team_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('team_no') === 'error' ? formik.errors.team_no : 'Used to route approvals to the right manager'}
                  error={getFieldStatus('team_no') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Group sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {getFieldIcon('team_no')}
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
                  placeholder="Create a strong password"
                  size="small"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('password') === 'error' ? formik.errors.password : ''}
                  error={getFieldStatus('password') === 'error'}
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
                
                {formik.values.password && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getPasswordChecks().map((check, idx) => (
                      <PasswordRequirement key={idx} fulfilled={check.fulfilled}>
                        {check.fulfilled ? '✓' : '○'} {check.label}
                      </PasswordRequirement>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  size="small"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('confirmPassword') === 'error' ? formik.errors.confirmPassword : ''}
                  error={getFieldStatus('confirmPassword') === 'error'}
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
                <FormControl fullWidth size="small" error={formik.touched.role && Boolean(formik.errors.role)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Role"
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#F8FAFC',
                      '&:hover': { backgroundColor: '#F1F5F9' },
                      '&.Mui-focused': {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.08)',
                      },
                    }}
                  >
                    <MenuItem value="team_member">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work sx={{ fontSize: 18, color: '#3B82F6' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Team Member</Typography>
                          <Typography variant="caption" color="#94A3B8">Requires manager approval</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="manager">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BadgeIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Manager</Typography>
                          <Typography variant="caption" color="#94A3B8">Requires admin approval</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <FormHelperText>{formik.errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Dynamic Approval Message */}
              <Grid item xs={12}>
                <ApprovalAlert 
                  severity={approvalInfo.severity}
                  icon={approvalInfo.icon}
                >
                  <Typography variant="subtitle2" fontWeight={600} color={approvalInfo.color} fontSize="13px">
                    {approvalInfo.title}
                  </Typography>
                  <Typography variant="body2" color="#64748B" fontSize="12px">
                    {approvalInfo.message}
                  </Typography>
                </ApprovalAlert>
              </Grid>

              {/* Register Button */}
              <Grid item xs={12}>
                <GradientButton
                  type="submit"
                  fullWidth
                  disabled={loading || !formik.isValid || !formik.dirty}
                  startIcon={!loading && <PersonAdd />}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </GradientButton>
              </Grid>

              {/* Login Link */}
              <Grid item xs={12}>
                <Typography textAlign="center" color="#94A3B8" variant="body2" fontSize="13px">
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
                    Sign In
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