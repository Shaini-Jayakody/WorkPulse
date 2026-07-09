import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton, // <-- Added this missing import
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  ArrowForward,
  AccessTime,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
} from '@mui/icons-material';
import Navbar from '../components/common/Navbar';

// STYLED COMPONENTS
const HeroSection = styled(Box)({
  minHeight: '50vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#050B16',
  backgroundImage: 'linear-gradient(135deg, rgba(5, 11, 22, 0.92) 0%, rgba(8, 18, 38, 0.88) 30%, rgba(15, 23, 42, 0.82) 100%), url(/assets/images/Home.png)',
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
    background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 35%), radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.18) 0%, transparent 32%), linear-gradient(135deg, rgba(2, 6, 23, 0.86) 0%, rgba(15, 23, 42, 0.72) 55%, rgba(30, 41, 59, 0.58) 100%)',
    zIndex: 1,
  },
});

const HeroContent = styled(Box)({
  position: 'relative',
  zIndex: 2,
  color: 'white',
  textAlign: 'center',
  maxWidth: '800px',
  margin: '0 auto',
  padding: 'clamp(12px, 3vw, 28px)',
});

const Section = styled(Box)({
  padding: '80px 0',
  backgroundColor: '#F8FAFC',
});

const ContactCard = styled(Card)({
  borderRadius: '20px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  textAlign: 'center',
  padding: '8px',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
});

const FormCard = styled(Paper)({
  borderRadius: '20px',
  padding: '40px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: 'none',
  background: 'white',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
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
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #6366F1 100%)',
  color: 'white',
  padding: '14px 44px',
  borderRadius: '50px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.5)',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #4F46E5 100%)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.15)',
    boxShadow: 'none',
    transform: 'none',
    color: 'rgba(255,255,255,0.3)',
  },
});

const SocialIcon = styled(IconButton)({
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    transform: 'translateY(-2px)',
  },
});

// COMPONENT
const ContactUs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 28, color: '#3B82F6' }} />,
      title: 'Email Us',
      details: ['support@workpulse.com', 'hello@workpulse.com'],
    },
    {
      icon: <Phone sx={{ fontSize: 28, color: '#10B981' }} />,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    },
    {
      icon: <LocationOn sx={{ fontSize: 28, color: '#8B5CF6' }} />,
      title: 'Visit Us',
      details: ['123 WorkPulse Street', 'San Francisco, CA 94105'],
    },
    {
      icon: <AccessTime sx={{ fontSize: 28, color: '#F59E0B' }} />,
      title: 'Working Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat - Sun: Closed'],
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call
    setTimeout(() => {
      setSuccess('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setLoading(false);
    }, 1500);
  };

  const socialLinks = [
    { icon: <Facebook />, url: '#' },
    { icon: <Twitter />, url: '#' },
    { icon: <LinkedIn />, url: '#' },
    { icon: <Instagram />, url: '#' },
  ];

  return (
    <Box>
      <Navbar />

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Box
              sx={{
                display: 'inline-block',
                background: 'rgba(59, 130, 246, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(96, 165, 250, 0.18)',
                padding: '6px 20px',
                borderRadius: '50px',
                mb: 4,
                fontSize: '14px',
                color: '#BFDBFE',
                fontWeight: 500,
              }}
            >
              Contact Us
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
                mb: 3,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Get in Touch
              <Box component="span" sx={{ 
                color: '#60A5FA',
                display: 'block',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
              }}>
                We'd Love to Hear From You
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                color: 'rgba(226,232,240,0.84)',
                lineHeight: 1.8,
                mb: 4,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Have questions, feedback, or need support? Reach out to us and we'll get back to you as soon as possible.
            </Typography>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Contact Section */}
      <Section>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Contact Info Cards */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                {contactInfo.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <ContactCard>
                      <CardContent sx={{ p: 3 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                            margin: '0 auto 12px',
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                          {item.title}
                        </Typography>
                        {item.details.map((detail, idx) => (
                          <Typography key={idx} variant="body2" color="#64748B">
                            {detail}
                          </Typography>
                        ))}
                      </CardContent>
                    </ContactCard>
                  </Grid>
                ))}
              </Grid>

              {/* Social Links */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="#94A3B8" sx={{ mb: 2 }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {socialLinks.map((social, index) => (
                    <SocialIcon key={index} onClick={() => window.open(social.url, '_blank')}>
                      {social.icon}
                    </SocialIcon>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <FormCard elevation={0}>
                <Typography variant="h5" fontWeight={700} color="#1E293B" sx={{ mb: 1 }}>
                  Send Us a Message
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                  We'll get back to you within 24 hours
                </Typography>

                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Your Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Message"
                        name="message"
                        placeholder="Tell us about your inquiry..."
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <GradientButton
                          type="submit"
                          disabled={loading || !formData.name || !formData.email || !formData.message}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        >
                          {loading ? 'Sending...' : 'Send Message'}
                        </GradientButton>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </FormCard>
            </Grid>
          </Grid>
        </Container>
      </Section>
    </Box>
  );
};

export default ContactUs;