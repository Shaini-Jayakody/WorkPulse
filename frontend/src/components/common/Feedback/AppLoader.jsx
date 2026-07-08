import React, { useState, useEffect } from 'react';

const AppLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  const messages = [
    { text: 'Loading your workspace...', icon: '◈' },
    { text: 'Fetching your data...', icon: '◈' },
    { text: 'Getting things ready...', icon: '◈' },
    { text: 'Almost there...', icon: '◈' },
    { text: 'Welcome!', icon: '◈' }
  ];

  useEffect(() => {
    setTimeout(() => setLogoVisible(true), 100);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          // Start fade out
          setTimeout(() => setFadeOut(true), 300);
          // Call onComplete after fade out
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
          return 100;
        }
        const increment = prev < 30 ? 3 : prev < 60 ? 4 : prev < 85 ? 5 : 2.5;
        return Math.min(prev + increment + Math.random() * 2, 100);
      });
    }, 80);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  const currentMessage = () => {
    if (progress < 20) return messages[0];
    if (progress < 40) return messages[1];
    if (progress < 60) return messages[2];
    if (progress < 85) return messages[3];
    return messages[4];
  };

  const message = currentMessage();

  // Generate bar chart data
  const generateBars = () => {
    const bars = [];
    const numBars = 12;
    const completedBars = Math.floor((progress / 100) * numBars);
    
    for (let i = 0; i < numBars; i++) {
      const isCompleted = i < completedBars;
      const isPartial = i === completedBars && progress < 100;
      const height = isCompleted ? 80 + Math.random() * 20 : 
                     isPartial ? (progress % (100 / numBars)) / (100 / numBars) * 100 : 
                     30 + Math.random() * 20;
      bars.push({
        isCompleted,
        isPartial,
        height: Math.min(Math.max(height, 20), 100)
      });
    }
    return bars;
  };

  const bars = generateBars();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#050B16',
      backgroundImage: `
        radial-gradient(circle at 18% 20%, rgba(59, 130, 246, 0.16) 0%, transparent 30%),
        radial-gradient(circle at 82% 78%, rgba(99, 102, 241, 0.14) 0%, transparent 28%),
        linear-gradient(135deg, #050B16 0%, #081326 45%, #0F172A 100%)
      `,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease'
    }}>
      
      {/* Blue Gradient Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.10) 0%, transparent 52%),
          radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.08) 0%, transparent 48%),
          radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.06) 0%, transparent 68%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Floating Blue Shapes */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '6%',
        width: 70,
        height: 70,
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.05)',
        animation: 'floatShape 7s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '18%',
        right: '8%',
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: 'rgba(37, 99, 235, 0.04)',
        animation: 'floatShape 9s ease-in-out infinite reverse'
      }} />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '560px',
        width: '100%',
        padding: '8px 0 72px'
      }}>
        
        {/* Logo Section */}
        <div style={{
          position: 'relative',
          marginBottom: 12,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {/* Blue Glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
            animation: 'glowPulse 2s ease-in-out infinite'
          }} />

          {/* Blue Rotating Ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 230,
            height: 230,
            borderRadius: '50%',
            padding: 3,
            background: 'conic-gradient(from 0deg, #3B82F6, #60A5FA, #6366F1, #2563EB, #3B82F6)',
            animation: 'rotateRing 4s linear infinite',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))'
          }} />

          {/* Logo */}
          <img 
            src="/assets/images/logo.png" 
            alt="WorkPulse"
            style={{
              width: 280,
              height: 280,
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 12px 40px rgba(59, 130, 246, 0.22))',
              animation: 'logoFloat 3s ease-in-out infinite'
            }}
          />
        </div>

        {/* Brand Name */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 40%, #818CF8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          marginBottom: 2,
          letterSpacing: '1px',
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s'
        }}>
          WorkPulse
        </h1>

        <p style={{
          fontSize: 13,
          color: 'rgba(226,232,240,0.68)',
          margin: 0,
          marginBottom: 28,
          fontWeight: 400,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s'
        }}>
          The Pulse of the Team
        </p>

        {/* Progress Label */}
        <div style={{
          width: '100%',
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.3s'
        }}>
          {/* Bar Chart Container */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 80,
            gap: 4,
            padding: '0 4px',
            marginBottom: 12
          }}>
            {bars.map((bar, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${bar.height}%`,
                  minHeight: 4,
                  borderRadius: '3px 3px 0 0',
                  background: bar.isCompleted 
                    ? 'linear-gradient(180deg, #3B82F6, #6366F1)'
                    : bar.isPartial
                      ? 'linear-gradient(180deg, #93C5FD, #BFDBFE)'
                      : '#E2E8F0',
                  transition: 'height 0.3s ease, background 0.3s ease',
                  position: 'relative',
                  opacity: bar.isCompleted ? 1 : bar.isPartial ? 0.8 : 0.5,
                  boxShadow: bar.isCompleted ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
                }}
              >
                {/* Shimmer on active bars */}
                {bar.isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)',
                    animation: 'barShimmer 1.5s ease-in-out infinite'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Progress Label */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{
                color: '#93C5FD',
                fontSize: 14,
                fontWeight: 500
              }}>
                {message.icon}
              </span>
              <span style={{
                color: 'rgba(226,232,240,0.74)',
                fontSize: 14,
                fontWeight: 400
              }}>
                {message.text}
              </span>
            </div>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#BFDBFE',
              background: 'rgba(59, 130, 246, 0.14)',
              padding: '2px 16px',
              borderRadius: 20,
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Dots */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 22,
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.4s'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                animation: 'dotBounce 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>

        {/* Footer quote */}
        <div style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: 0.5,
          transition: 'opacity 0.5s ease 0.5s'
        }}>
          <span style={{
            width: 30,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #60A5FA)'
          }} />
          <p style={{
            fontSize: 13,
            color: '#93C5FD',
            fontWeight: 500,
            margin: 0,
            letterSpacing: '1px'
          }}>
            One team, one pulse.
          </p>
          <span style={{
            width: 30,
            height: 1,
            background: 'linear-gradient(90deg, #60A5FA, transparent)'
          }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes barShimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { opacity: 0.3; }
          }

          @keyframes glowPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
          }

          @keyframes rotateRing {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }

          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }

          @keyframes floatShape {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -20px) scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default AppLoader;