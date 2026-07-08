import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  PersonAdd,
  AdminPanelSettings,
  Send,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../api/axiosConfig';


// STYLED COMPONENTS
const CreateContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 58, 138, 0.65) 50%, rgba(99, 102, 241, 0.55) 100%)',
    zIndex: 1,
  },
});

const CreateCard = styled(Paper)({
  position: 'relative',
  zIndex: 2,
  borderRadius: '24px',
  padding: '36px 40px',
  maxWidth: '720px',
  width: '100%',
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
  border: '1px solid rgba(255,255,255,0.12)',
  maxHeight: '92vh',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '4px',
  },
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
    color: 'rgba(255,255,255,0.4)',
  },
});

const PasswordRequirement = styled(Box)(({ fulfilled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  color: fulfilled ? '#4ADE80' : 'rgba(255,255,255,0.3)',
  transition: 'all 0.3s ease',
  backgroundColor: fulfilled ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
  border: `1px solid ${fulfilled ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.04)'}`,
}));

const RoleCard = styled(Box)(({ selected }) => ({
  padding: '14px 16px',
  borderRadius: '12px',
  border: `2px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
  backgroundColor: selected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    borderColor: selected ? '#3B82F6' : 'rgba(255,255,255,0.15)',
    backgroundColor: selected ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.06)',
  },
}));


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
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
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
const CreateUserForm = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRole, setSelectedRole] = useState('team_member');
  const [generatedPassword, setGeneratedPassword] = useState('');

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
        
        // Create user via protected admin route
        const response = await api.post('/auth/users/create', userData);

        if (response.data.success) {
          const mailtoUrl = response.data?.data?.mailtoUrl;
          const roleMessage = values.role === 'team_member' 
            ? 'Team member account created successfully.'
            : values.role === 'manager'
              ? 'Manager account created successfully.'
              : 'Admin account created successfully by super admin.';
          
          setSuccess(`User created successfully! ${roleMessage} Your mail client will open with a prefilled message.`);

          if (mailtoUrl) {
            window.location.href = mailtoUrl;
          }

          setTimeout(() => navigate('/users'), 3000);
        }
      } catch (err) {
        let errorMessage = 'Failed to create user. Please try again.';
        
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
          errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    formik.setFieldValue('role', role);
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
    if (status === 'valid') return <CheckCircle sx={{ color: '#4ADE80', fontSize: 16 }} />;
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

  const roleOptions = [
    { value: 'team_member', label: 'Team Member', icon: <Work sx={{ fontSize: 20 }} />, desc: 'Create & manage reports' },
    { value: 'manager', label: 'Manager', icon: <BadgeIcon sx={{ fontSize: 20 }} />, desc: 'Manage team & reports' },
    { value: 'admin', label: 'Admin', icon: <AdminPanelSettings sx={{ fontSize: 20 }} />, desc: 'Full system access' },
  ].filter((role) => role.value !== 'admin' || currentUser?.role === 'super_admin');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure it meets requirements
    password = 'P@' + password.slice(2) + '1';
    formik.setFieldValue('password', password);
    formik.setFieldValue('confirmPassword', password);
    setGeneratedPassword(password);
  };

  return (
    <CreateContainer>
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', px: { xs: 2, md: 4 } }}>
        <CreateCard elevation={0}>
          {/* Back Button */}
          <IconButton
            onClick={() => navigate('/users')}
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
              Create New User
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={0.5}>
              Add a new user to the system. Credentials will be sent via email.
            </Typography>
          </Box>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: '13px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '13px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              {error}
            </Alert>
          )}

          {/* Generate Password Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Lock />}
              onClick={generatePassword}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
              }}
            >
              Generate Password
            </Button>
          </Box>

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Role Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 600 }}>
                  Select Role
                </Typography>
                <Grid container spacing={1}>
                  {roleOptions.map((role) => (
                    <Grid item xs={4} key={role.value}>
                      <RoleCard
                        selected={selectedRole === role.value}
                        onClick={() => handleRoleSelect(role.value)}
                      >
                        <Box sx={{ color: selectedRole === role.value ? '#3B82F6' : 'rgba(255,255,255,0.4)' }}>
                          {role.icon}
                        </Box>
                        <Typography variant="body2" sx={{ color: selectedRole === role.value ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: selectedRole === role.value ? 600 : 400, mt: 0.5, fontSize: '12px' }}>
                          {role.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '8px' }}>
                          {role.desc}
                        </Typography>
                      </RoleCard>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Name Fields */}
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
                  helperText={getFieldStatus('first_name') === 'error' ? formik.errors.first_name : ''}
                  error={getFieldStatus('first_name') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                  size="medium"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('email') === 'error' ? formik.errors.email : ''}
                  error={getFieldStatus('email') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                  size="medium"
                  value={formik.values.contact_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('contact_no') === 'error' ? formik.errors.contact_no : ''}
                  error={getFieldStatus('contact_no') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                  size="medium"
                  value={formik.values.birthday}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('birthday') === 'error' ? formik.errors.birthday : ''}
                  error={getFieldStatus('birthday') === 'error'}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Event sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                <FormControl fullWidth size="medium" error={formik.touched.gender && Boolean(formik.errors.gender)}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Gender"
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.12)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.15)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.25)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3B82F6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255,255,255,0.4)',
                      },
                    }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText sx={{ color: '#EF4444' }}>{formik.errors.gender}</FormHelperText>
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
                  size="medium"
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
                        <Home sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                  placeholder="Enter team number (e.g., TEAM-01)"
                  size="medium"
                  value={formik.values.team_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('team_no') === 'error' ? formik.errors.team_no : 'Team number for routing approvals'}
                  error={getFieldStatus('team_no') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Group sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
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
                  placeholder="Enter a strong password"
                  size="medium"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('password') === 'error' ? formik.errors.password : ''}
                  error={getFieldStatus('password') === 'error'}
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
                  placeholder="Confirm the password"
                  size="medium"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  helperText={getFieldStatus('confirmPassword') === 'error' ? formik.errors.confirmPassword : ''}
                  error={getFieldStatus('confirmPassword') === 'error'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Create Button */}
              <Grid item xs={12}>
                <GradientButton
                  type="submit"
                  fullWidth
                  disabled={loading || !formik.isValid || !formik.dirty}
                  startIcon={!loading && <PersonAdd />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create User'}
                </GradientButton>
              </Grid>

              {/* Info Message */}
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2, 
                    fontSize: '12px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(59, 130, 246, 0.15)',
                  }}
                  icon={<Info />}
                >
                  The user will receive an email with their login credentials and account details.
                </Alert>
              </Grid>
            </Grid>
          </form>
        </CreateCard>
      </Container>
    </CreateContainer>
  );
};

export default CreateUserForm;