import React, { useState, useEffect } from 'react';
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
  Avatar,
  Divider,
  Chip,
  Stack,
  Tooltip,
  FormHelperText,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  ArrowBack,
  Save,
  Cancel,
  CheckCircle,
  Error as ErrorIcon,
  PhotoCamera,
  Badge as BadgeIcon,
  Work,
  Group,
  Event,
  Cake,
  Home,
  Wc,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/axiosConfig';


// STYLED COMPONENTS
const ProfileContainer = styled(Box)({
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

const ProfileCard = styled(Paper)({
  position: 'relative',
  zIndex: 2,
  borderRadius: '24px',
  padding: '40px 44px',
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
    '&.Mui-disabled': {
      color: 'rgba(255,255,255,0.4)',
      WebkitTextFillColor: 'rgba(255,255,255,0.4)',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 4,
    fontWeight: 400,
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
});

const StyledSelect = styled(Select)({
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  transition: 'all 0.2s ease',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
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
  '& .MuiSelect-icon': {
    color: 'rgba(255,255,255,0.5)',
  },
  '& .MuiMenuItem-root': {
    color: '#1E293B',
  },
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '12px',
  fontSize: '15px',
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
    cursor: 'not-allowed',
  },
});

const OutlineButton = styled(Button)({
  border: '2px solid rgba(255,255,255,0.2)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '2px solid #3B82F6',
    background: 'rgba(59, 130, 246, 0.08)',
  },
});

const AvatarUpload = styled('label')({
  cursor: 'pointer',
  position: 'relative',
  display: 'inline-block',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
});

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: '4px solid rgba(255,255,255,0.15)',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(255,255,255,0.08)',
  '&:hover': {
    border: '4px solid #3B82F6',
    boxShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
  },
});

const UploadIcon = styled(Box)({
  position: 'absolute',
  bottom: 4,
  right: 4,
  backgroundColor: '#3B82F6',
  borderRadius: '50%',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255,255,255,0.15)',
  '&:hover': {
    backgroundColor: '#2563EB',
    transform: 'scale(1.1)',
  },
});

const InfoCard = styled(Paper)({
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const InfoLabel = styled(Typography)({
  color: 'rgba(255,255,255,0.4)',
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const InfoValue = styled(Typography)({
  color: 'rgba(255,255,255,0.9)',
  fontSize: '14px',
  fontWeight: 500,
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
  contact_no: Yup.string()
    .required('Contact number is required')
    .matches(/^\+?[\d\s-]{10,15}$/, 'Enter a valid contact number (10-15 digits)'),
  birthday: Yup.date()
    .nullable()
    .typeError('Please enter a valid date'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Invalid gender'),
  address: Yup.string()
    .max(250, 'Address cannot exceed 250 characters'),
  team_no: Yup.string()
    .max(50, 'Team number cannot exceed 50 characters'),
});

// COMPONENT
const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          const userData = response.data.data.user;
          setUser(userData);
          if (userData.profile_picture_url) {
            setProfilePreview(userData.profile_picture_url);
          }
          
          // Set form values
          formik.setValues({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            contact_no: userData.contact_no || '',
            birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
            gender: userData.gender || '',
            address: userData.address || '',
            team_no: userData.team_no || '',
          });
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      contact_no: '',
      birthday: '',
      gender: '',
      address: '',
      team_no: '',
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const formData = new FormData();
        formData.append('first_name', values.first_name);
        formData.append('last_name', values.last_name);
        formData.append('contact_no', values.contact_no);
        
        if (values.birthday) {
          formData.append('birthday', values.birthday);
        }
        if (values.gender) {
          formData.append('gender', values.gender);
        }
        if (values.address) {
          formData.append('address', values.address);
        }
        if (values.team_no) {
          formData.append('team_no', values.team_no);
        }
        
        if (profileFile) {
          formData.append('profile_picture', profileFile);
        }

        const response = await api.put('/auth/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setSuccess('Profile updated successfully!');
          // Update local user data
          setUser(response.data.data.user);
          if (response.data.data.user.profile_picture_url) {
            setProfilePreview(response.data.data.user.profile_picture_url);
          }
          setHasChanges(false);
          // Reset form with new values
          const userData = response.data.data.user;
          formik.setValues({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            contact_no: userData.contact_no || '',
            birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
            gender: userData.gender || '',
            address: userData.address || '',
            team_no: userData.team_no || '',
          });
          setTimeout(() => setSuccess(null), 5000);
        }
      } catch (err) {
        let errorMessage = 'Failed to update profile.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          errorMessage = errors.map(e => e.message).join(', ');
        }
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    },
  });

  // Check for changes in form values
  const checkForChanges = (values) => {
    if (!user) return false;
    
    const initialValues = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      contact_no: user.contact_no || '',
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      address: user.address || '',
      team_no: user.team_no || '',
    };

    // Check if any field has changed
    for (const key in initialValues) {
      if (values[key] !== initialValues[key]) {
        return true;
      }
    }
    return false;
  };

  // Check if form has changes on every value update
  useEffect(() => {
    setHasChanges(checkForChanges(formik.values));
  }, [formik.values, user]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be smaller than 5MB');
        setTimeout(() => setError(null), 3000);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        setTimeout(() => setError(null), 3000);
        return;
      }
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleLabel = () => {
    if (!user) return 'Guest';
    const roleMap = {
      team_member: 'Team Member',
      manager: 'Manager',
      admin: 'Administrator',
      super_admin: 'Super Admin',
    };
    return roleMap[user.role] || user.role || 'Guest';
  };

  const getRoleColor = () => {
    if (!user) return '#64748B';
    const colors = {
      super_admin: '#EC4899',
      admin: '#8B5CF6',
      manager: '#3B82F6',
      team_member: '#10B981',
    };
    return colors[user.role] || '#64748B';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Determine if save button should be disabled
  const isSaveDisabled = () => {
    return loading || !hasChanges || !formik.isValid || !formik.dirty;
  };

  if (fetchLoading) {
    return (
      <ProfileContainer>
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#3B82F6', zIndex: 2 }} />
        </Container>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', px: { xs: 2, md: 4 } }}>
        <ProfileCard elevation={0}>
          {/* Back Button */}
          <IconButton
            onClick={() => navigate(-1)}
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
              My Profile
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={0.5}>
              View and manage your personal information
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
              onClose={() => setSuccess(null)}
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
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Profile Picture */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <AvatarUpload>
              <StyledAvatar src={profilePreview || undefined}>
                {!profilePreview && getInitials()}
              </StyledAvatar>
              <UploadIcon>
                <PhotoCamera sx={{ fontSize: 18, color: 'white' }} />
              </UploadIcon>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </AvatarUpload>
          </Box>

          {/* User Info Chips */}
          {user && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              <Chip
                icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                label={`ID: ${user.user_id}`}
                size="small"
                sx={{
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <Chip
                icon={<Work sx={{ fontSize: 16 }} />}
                label={getRoleLabel()}
                size="small"
                sx={{
                  borderRadius: '6px',
                  backgroundColor: `${getRoleColor()}20`,
                  color: getRoleColor(),
                  border: `1px solid ${getRoleColor()}30`,
                }}
              />
              {user.team_no && (
                <Chip
                  icon={<Group sx={{ fontSize: 16 }} />}
                  label={`Team ${user.team_no}`}
                  size="small"
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
              )}
              <Chip
                icon={<Email sx={{ fontSize: 16 }} />}
                label={user.email}
                size="small"
                sx={{
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            </Box>
          )}

          {/* Read-only Info Cards */}
          {user && (
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CalendarToday sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                  <Box>
                    <InfoLabel>Member Since</InfoLabel>
                    <InfoValue>{formatDate(user.createdAt)}</InfoValue>
                  </Box>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CheckCircle sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                  <Box>
                    <InfoLabel>Status</InfoLabel>
                    <InfoValue sx={{ color: user.isActive ? '#10B981' : '#EF4444' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </InfoValue>
                  </Box>
                </InfoCard>
              </Grid>
            </Grid>
          )}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2.5}>
              {/* First Name */}
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
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Last Name */}
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
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email - Read Only */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user?.email || ''}
                  disabled
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Email cannot be changed"
                />
              </Grid>

              {/* Contact Number */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="contact_no"
                  placeholder="+1 234 567 8900"
                  size="medium"
                  value={formik.values.contact_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contact_no && Boolean(formik.errors.contact_no)}
                  helperText={formik.touched.contact_no && formik.errors.contact_no}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Team Number - Read Only */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Team Number"
                  name="team_no"
                  value={formik.values.team_no || ''}
                  disabled
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Group sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Team number is set by admin and cannot be changed"
                />
              </Grid>

              {/* User ID - Read Only */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="User ID"
                  name="user_id"
                  value={user?.user_id || ''}
                  disabled
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="User ID is auto-generated and cannot be changed"
                />
              </Grid>

              {/* Birthday */}
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
                  error={formik.touched.birthday && Boolean(formik.errors.birthday)}
                  helperText={formik.touched.birthday && formik.errors.birthday}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Gender</InputLabel>
                  <StyledSelect
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Gender"
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.06)',
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: 'rgba(255,255,255,0.5)' }}>Select gender</em>
                    </MenuItem>
                    <MenuItem value="male" sx={{ color: 'white' }}>Male</MenuItem>
                    <MenuItem value="female" sx={{ color: 'white' }}>Female</MenuItem>
                    <MenuItem value="other" sx={{ color: 'white' }}>Other</MenuItem>
                    <MenuItem value="prefer_not_to_say" sx={{ color: 'white' }}>Prefer not to say</MenuItem>
                  </StyledSelect>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText error>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  placeholder="Enter your address"
                  size="medium"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Change Indicator */}
              {hasChanges && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: 2, 
                      fontSize: '13px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      color: 'rgba(255,255,255,0.9)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    You have unsaved changes. Click "Save Changes" to update your profile.
                  </Alert>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <OutlineButton
                    variant="outlined"
                    onClick={() => {
                      if (hasChanges) {
                        if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          navigate(-1);
                        }
                      } else {
                        navigate(-1);
                      }
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </OutlineButton>
                  <GradientButton
                    type="submit"
                    disabled={isSaveDisabled()}
                    startIcon={!loading && <Save />}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                  </GradientButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </ProfileCard>
      </Container>
    </ProfileContainer>
  );
};

export default Profile;