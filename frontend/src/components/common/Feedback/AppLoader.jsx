import React, { useState, useEffect } from 'react';

const AppLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [
    'Loading your workspace...',
    'Fetching your data...',
    'Getting things ready...',
    'Almost there...',
    'Welcome!'
  ];

  useEffect(() => {
    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return Math.min(prev + Math.random() * 8 + 2, 100);
      });
    }, 200);

    // Message rotation
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const nextIndex = (prev + 1) % messages.length;
        // Stop at "Welcome!" when progress is high
        if (progress > 90 && nextIndex === messages.length - 1) {
          return nextIndex;
        }
        if (progress > 90) {
          return messages.length - 1;
        }
        return nextIndex;
      });
    }, 1500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [progress, messages.length]);

  // Get current message
  const getCurrentMessage = () => {
    if (progress < 25) return messages[0];
    if (progress < 50) return messages[1];
    if (progress < 75) return messages[2];
    if (progress < 95) return messages[3];
    return messages[4];
  };

  return (
    <div className="app-loader" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      animation: 'fadeIn 0.5s ease-out',
      position: 'relative'
    }}>
      {/* Background Decorative Circles */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
        bottom: '-50px',
        left: '-50px',
        pointerEvents: 'none'
      }} />

      {/* Logo / Icon Container */}
       {/* Logo Image - Large, No Frame */}
      <img 
        src="/assets/images/logo.png" 
        alt="WorkPulse Logo"
        style={{
          width: 300,
          height: 300,
          objectFit: 'contain',
          marginBottom: 28,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />


      {/* Brand Name */}
      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#1E293B',
        margin: 0,
        marginBottom: 4,
        letterSpacing: '-0.5px'
      }}>
        WorkPulse
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: 14,
        color: '#1d3658',
        margin: 0,
        marginBottom: 36,
        fontWeight: 400,
        letterSpacing: '0.3px'
      }}>
        The Pulse of the Team
      </p>

      {/* Progress Bar Container */}
      <div style={{
        width: 340,
        maxWidth: '90%',
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {/* Progress Bar Fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          borderRadius: 4,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          boxShadow: '0 0 10px rgba(99,102,241,0.3)'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 20,
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))',
            borderRadius: 4
          }} />
        </div>
      </div>

      {/* Loading Message */}
      <p style={{
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 16,
        fontWeight: 500,
        minHeight: '24px',
        transition: 'opacity 0.3s ease'
      }}>
        {getCurrentMessage()}
        <span className="loading-dot" style={{ marginLeft: 2 }}>.</span>
        <span className="loading-dot" style={{ marginLeft: 2 }}>.</span>
        <span className="loading-dot" style={{ marginLeft: 2 }}>.</span>
      </p>

      {/* Percentage */}
      <p style={{
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: 600,
        letterSpacing: '0.5px'
      }}>
        {Math.round(progress)}%
      </p>

      {/* Footer Quote */}
      <p style={{
        position: 'absolute',
        bottom: 40,
        fontSize: 13,
        color: '#3b516f',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 400,
        padding: '0 20px'
      }}>
        "One team under one pulse."
      </p>
    </div>
  );
};

export default AppLoader;