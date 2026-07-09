import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import Navbar from '../components/common/Navbar';


// STYLED COMPONENTS
const HeroSection = styled(Box)({
  minHeight: '100vh',
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
  maxWidth: '920px',
  margin: '0 auto',
  padding: 'clamp(12px, 3vw, 28px)',
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

const OutlineButton = styled(Button)({
  border: '2px solid rgba(255,255,255,0.3)',
  color: 'white',
  padding: '14px 44px',
  borderRadius: '50px',
  fontSize: '16px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '2px solid #60A5FA',
    background: 'rgba(96, 165, 250, 0.1)',
  },
});

const StatBox = styled(Box)({
  textAlign: 'center',
  padding: '0 24px',
  borderRight: '1px solid rgba(255,255,255,0.12)',
  '&:last-child': {
    borderRight: 'none',
  },
});


// COMPONENT
const Home = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/*NAVBAR */}
      <Navbar />

      {/* HERO SECTION - Centered*/}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            {/* Small Badge */}
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
              Welcome
            </Box>

            {/* Main Heading */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '38px', md: '68px' },
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
                mb: 3,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Report Your
              <Box component="span" sx={{ 
                color: '#60A5FA',
                display: 'block',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
              }}>
                WorkPulse
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '16px', md: '20px' },
                color: 'rgba(226,232,240,0.84)',
                lineHeight: 1.8,
                mb: 4,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Feel the Pulse of Productivity
            </Typography>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <GradientButton
                variant="contained"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
              >
                Get Started
              </GradientButton>
              <OutlineButton
                variant="outlined"
                onClick={() => navigate('/about')}
              >
                Learn More
              </OutlineButton>
            </Box>

            {/* Stats - Centered */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 6,
                pt: 4,
                borderTop: '1px solid rgba(148,163,184,0.12)',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <StatBox>
                <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#F8FAFC' }}>
                  Weekly
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'rgba(226,232,240,0.62)' }}>
                  Reports
                </Typography>
              </StatBox>
              <StatBox>
                <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#F8FAFC' }}>
                    Team
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'rgba(226,232,240,0.62)' }}>
                  Collaboration
                </Typography>
              </StatBox>
              <StatBox>
                <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#F8FAFC' }}>
                  Actionable
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'rgba(226,232,240,0.62)' }}>
                    Insights
                </Typography>
              </StatBox>
            </Box>
          </HeroContent>
        </Container>
      </HeroSection>
    </Box>
  );
};

export default Home;