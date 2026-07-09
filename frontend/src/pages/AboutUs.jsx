import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  TrendingUp,
  People,
  Lightbulb,
  Rocket,
  Shield,
  EmojiEvents,
  CheckCircle,
} from '@mui/icons-material';
import Navbar from '../components/common/Navbar';

// STYLED COMPONENTS
const HeroSection = styled(Box)({
  minHeight: '60vh',
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

const MissionCard = styled(Card)({
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

const ValueCard = styled(Card)({
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
const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Lightbulb sx={{ fontSize: 40, color: '#F59E0B' }} />,
      title: 'Innovation',
      description: 'Embracing cutting-edge solutions to solve complex challenges and drive progress.',
    },
    {
      icon: <People sx={{ fontSize: 40, color: '#3B82F6' }} />,
      title: 'Collaboration',
      description: 'Building strong teams and fostering a culture of open communication and shared success.',
    },
    {
      icon: <Shield sx={{ fontSize: 40, color: '#10B981' }} />,
      title: 'Integrity',
      description: 'Operating with honesty, transparency, and accountability in everything we do.',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#8B5CF6' }} />,
      title: 'Excellence',
      description: 'Striving for the highest quality in our work and consistently exceeding expectations.',
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
              About Us
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
              Empowering Teams to
              <Box component="span" sx={{ 
                color: '#60A5FA',
                display: 'block',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
              }}>
                Work Smarter
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
              We believe in the power of well-structured reporting and team collaboration to drive success.
            </Typography>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Mission & Vision Section */}
      <Section>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <MissionCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}>
                      <Rocket />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#1E293B">
                      Our Mission
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="#64748B" sx={{ lineHeight: 1.8 }}>
                    To provide a seamless and intuitive reporting platform that empowers teams to track progress, 
                    identify blockers, and celebrate achievements. We aim to make weekly reporting a valuable 
                    habit rather than a tedious task.
                  </Typography>
                </CardContent>
              </MissionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <MissionCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                      <Visibility />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#1E293B">
                      Our Vision
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="#64748B" sx={{ lineHeight: 1.8 }}>
                    To become the go-to platform for teams worldwide to streamline their reporting process, 
                    enhance transparency, and foster a culture of continuous improvement. We envision a world 
                    where every team has the tools they need to succeed.
                  </Typography>
                </CardContent>
              </MissionCard>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Core Values Section */}
      <SectionDark>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="white"
              sx={{ mb: 2 }}
            >
              Our Core Values
            </Typography>
            <Typography
              variant="body1"
              color="rgba(226,232,240,0.7)"
              sx={{ maxWidth: '600px', margin: '0 auto' }}
            >
              The principles that guide everything we do
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ValueCard sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="white" sx={{ mb: 1 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="rgba(226,232,240,0.6)" sx={{ lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </ValueCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </SectionDark>

      {/* Why Choose Us Section */}
      <Section>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="#1E293B"
              sx={{ mb: 2 }}
            >
              Why Choose WorkPulse?
            </Typography>
            <Typography
              variant="body1"
              color="#64748B"
              sx={{ maxWidth: '600px', margin: '0 auto' }}
            >
              We're committed to making reporting simple, effective, and impactful
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <MissionCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Simple & Intuitive
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Easy-to-use interface that makes reporting quick and hassle-free for everyone on your team.
                  </Typography>
                </CardContent>
              </MissionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MissionCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 48, color: '#3B82F6', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Actionable Insights
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Turn your weekly reports into valuable insights that drive better decision-making.
                  </Typography>
                </CardContent>
              </MissionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MissionCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: '#8B5CF6', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 1 }}>
                    Team Collaboration
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Foster better communication and transparency across your entire organization.
                  </Typography>
                </CardContent>
              </MissionCard>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <GradientButton
              variant="contained"
              onClick={() => navigate('/register')}
            >
              Get Started Today
            </GradientButton>
          </Box>
        </Container>
      </Section>
    </Box>
  );
};

export default AboutUs;