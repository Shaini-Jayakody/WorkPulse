import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const NavLink = styled(Typography)({
  color: 'rgba(255,255,255,0.8)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'color 0.3s ease, transform 0.3s ease',
  fontSize: '15px',
  '&:hover': {
    color: '#60A5FA',
    transform: 'translateY(-1px)',
  },
});

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        pt: 3,
        height: '100%',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(8, 17, 31, 0.98) 100%)',
        color: '#E2E8F0',
        borderLeft: '1px solid rgba(96, 165, 250, 0.12)',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ px: 2, mb: 3 }}>
        <img 
          src="/assets/images/logo.png" 
          alt="WorkPulse Logo"
          style={{
            height: 40,
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            component="div" 
            key={item.label}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.12)' },
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: {
                  color: isActivePath(item.path) ? '#93C5FD' : '#E2E8F0',
                  fontWeight: isActivePath(item.path) ? 700 : 500,
                },
              }}
            />
          </ListItem>
        ))}
        <ListItem 
          component="div"
          onClick={() => {
            navigate('/login');
            setDrawerOpen(false);
          }}
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.12)' },
          }}
        >
          <ListItemText primary="Sign In" primaryTypographyProps={{ sx: { color: '#93C5FD', fontWeight: 600 } }} />
        </ListItem>
        <ListItem 
          component="div"
          onClick={() => {
            navigate('/register');
            setDrawerOpen(false);
          }}
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.12)' },
          }}
        >
          <ListItemText primary="Sign Up" primaryTypographyProps={{ sx: { color: '#93C5FD', fontWeight: 600 } }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
        sx={{ 
          background: 'rgba(10, 16, 32, 0.76)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(148,163,184,0.08)',
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
            {/* Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <img 
                src="/assets/images/logo.png" 
                alt="WorkPulse Logo"
                style={{
                  height: 48,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </Box>

            {/* Desktop Nav Links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 4 }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: isActivePath(item.path) ? '#93C5FD' : 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      '&::after': isActivePath(item.path)
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: '-6px',
                            height: '2px',
                            borderRadius: '999px',
                            background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                            boxShadow: '0 0 12px rgba(96, 165, 250, 0.55)',
                          }
                        : {},
                    }}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </Box>
            )}

            {/* Desktop Auth Buttons */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontWeight: 500, 
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: '#60A5FA' }
                  }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    borderRadius: '50px',
                    textTransform: 'none',
                    px: 3.5,
                    py: 1,
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 2px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            background: 'transparent',
            color: '#E2E8F0',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;