/**
 * AppBackground – Shows a themed background with floating particles behind the main content.
 * Uses Framer Motion for animation and custom scrollbars for style.
 */

import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion as Motion } from 'framer-motion';
import { useThemeContext } from '../../theme/useThemeContext';
const PARTICLE_COUNT = 20;

const AppBackground = React.memo(({ children }) => {
  const theme = useTheme();
  const { themeName } = useThemeContext();

  const backgroundImage = useMemo(() => {
    switch (themeName) {
      case 'sea':
        return 'url("../images/coconut_tree.png")';
      case 'cloud':
        return 'url("../images/cloud.png")';
      default:
        return 'none';
    }
  }, [themeName]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const size = 10 + Math.random() * 10;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 5 + Math.random() * 10;
        const delay = Math.random() * 5;
        const opacity = 0.4 + Math.random() * 0.6;
        const rotation = Math.random() * 20 - 10;

        return (
          <Motion.div
            key={`particle-${i}`}
            initial={{
              x: `${x}vw`,
              y: `${y}vh`,
              opacity: 0,
              scale: 0.8,
              rotate: rotation,
            }}
            animate={{
              x: [`${x}vw`, `${x + Math.random() * 10 - 5}vw`, `${x}vw`],
              y: [`${y}vh`, `${y - 10 + Math.random() * 20}vh`, `${y}vh`],
              opacity: [opacity, opacity + 0.2, opacity],
              scale: [0.9, 1.1, 0.95],
              rotate: [rotation, rotation + 10, rotation],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: 'rgba(255, 254, 246, 0.9)',
              boxShadow: '0 0 12px 3px rgba(255, 255, 255, 0.9)',
              clipPath:
                'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              zIndex: 0,
            }}
          />
        );
      }),
    []
  );

return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        maxHeight: '100vh',
        background: theme.palette.background.default,
        padding: 3,
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#ffffff transparent',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.text.title,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme.palette.primary.main,
        },
      }}
    >
              {/* Background layer (above gradient, below animation) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0.5,
          pointerEvents: 'none',
        
        }}
      />

              {/* Animated particle layer */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {particles}
      </Box>

              {/* Content layer */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>{children}</Box>
    </Box>

  );
});

export default AppBackground;
