import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assessment,
  People,
  Analytics,
  Security,
  IntegrationInstructions,
  SupportAgent,
  TrendingUp,
  ArrowForward,
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
  '&:nth-of-type(even)': {
    backgroundColor: '#FFFFFF',
  },
});

const SectionDark = styled(Box)({
  padding: '80px 0',
  backgroundColor: '#0F172A',
  color: 'white',
});

const ServiceCard = styled(Card)({
  borderRadius: '20px',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  padding: '8px',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
});

const FeatureCard = styled(Card)({
  borderRadius: '16px',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  height: '100%',
  textAlign: 'center',
  padding: '8px',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.06)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
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
});

// COMPONENT
const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <Assessment sx={{ fontSize: 32, color: '#3B82F6' }} />,
      title: 'Weekly Reporting',
      description: 'Streamline your weekly report submissions with our intuitive and user-friendly interface.',
      features: ['Easy report creation', 'Quick submission', 'Auto-save drafts'],
    },
    {
      icon: <Analytics sx={{ fontSize: 32, color: '#8B5CF6' }} />,
      title: 'Team Analytics',
      description: 'Gain valuable insights into team performance with comprehensive analytics and visualizations.',
      features: ['Real-time dashboards', 'Performance metrics', 'Trend analysis'],
    },
    {
      icon: <People sx={{ fontSize: 32, color: '#10B981' }} />,
      title: 'Team Management',
      description: 'Efficiently manage your team members, track progress, and foster collaboration.',
      features: ['Member profiles', 'Role management', 'Team performance'],
    },
    {
      icon: <Security sx={{ fontSize: 32, color: '#F59E0B' }} />,
      title: 'Secure Platform',
      description: 'Keep your data safe with enterprise-grade security and privacy features.',
      features: ['Data encryption', 'Secure access', 'Privacy controls'],
    },
    {
      icon: <IntegrationInstructions sx={{ fontSize: 32, color: '#EC4899' }} />,
      title: 'Easy Integration',
      description: 'Seamlessly integrate with your existing tools and workflows.',
      features: ['API access', 'Webhook support', 'Custom integrations'],
    },
    {
      icon: <SupportAgent sx={{ fontSize: 32, color: '#06B6D4' }} />,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated support team.',
      features: ['Email support', 'Live chat', 'Help documentation'],
    },
  ];

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#3B82F6' }} />,
      title: 'Boost Productivity',
      description: 'Save time with streamlined workflows and automated processes.',
    },
    {
      icon: <Assessment sx={{ fontSize: 40, color: '#8B5CF6' }} />,
      title: 'Better Insights',
      description: 'Make informed decisions with data-driven insights and analytics.',
    },
    {
      icon: <People sx={{ fontSize: 40, color: '#10B981' }} />,
      title: 'Team Collaboration',
      description: 'Improve communication and transparency across your team.',
    },
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
              Our Services
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
              Everything You Need to
              <Box component="span" sx={{ 
                color: '#60A5FA',
                display: 'block',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
              }}>
                Succeed
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
              Discover our comprehensive suite of tools designed to help your team work smarter and achieve more.
            </Typography>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Services Grid */}
      <Section>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="#1E293B"
              sx={{ mb: 2 }}
            >
              Our Services
            </Typography>
            <Typography
              variant="body1"
              color="#64748B"
              sx={{ maxWidth: '600px', margin: '0 auto' }}
            >
              Comprehensive solutions to streamline your reporting and team management
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ServiceCard>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'rgba(59, 130, 246, 0.08)',
                        mb: 2,
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                      {service.features.map((feature, idx) => (
                        <Typography
                          key={idx}
                          component="li"
                          variant="caption"
                          color="#94A3B8"
                          sx={{ display: 'block', py: 0.5 }}
                        >
                          ✓ {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Why Choose Us */}
      <SectionDark>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="white"
              sx={{ mb: 2 }}
            >
              Why Choose WorkPulse?
            </Typography>
            <Typography
              variant="body1"
              color="rgba(226,232,240,0.7)"
              sx={{ maxWidth: '600px', margin: '0 auto' }}
            >
              We're committed to helping teams achieve their full potential
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="rgba(226,232,240,0.6)">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </SectionDark>

      {/* CTA Section */}
      <Section>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#1E293B"
              sx={{ mb: 2 }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant="body1"
              color="#64748B"
              sx={{ mb: 4, maxWidth: '500px', margin: '0 auto' }}
            >
              Join thousands of teams already using WorkPulse to streamline their reporting.
            </Typography>
            <GradientButton
              variant="contained"
              onClick={() => navigate('/register')}
              endIcon={<ArrowForward />}
            >
              Start Free Trial
            </GradientButton>
          </Box>
        </Container>
      </Section>
    </Box>
  );
};

export default Services;