import {
  Drawer,
  Divider,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  useTheme,
  alpha,
  Collapse,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { keyframes } from '@emotion/react';
import { useState } from 'react';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const HelpCenter = ({ open, onClose, onStartTutorial }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sections = t('help.sections', { returnObjects: true }) || [];
  const [expandedSection, setExpandedSection] = useState(null);
  
  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            height: '85vh',
            width: '85vw',
            margin: 'auto',
            mt: 2,
            borderRadius: 4,
            padding: 0,
            background: (theme) => theme.palette.background.default,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              pointerEvents: 'none',
            },
          },
        },
      }}
    >
      <Box
        sx={{
          background: (theme) => alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          height: '100%',
          padding: 4,
          overflowY: 'auto',
          position: 'relative',
        }}
      >

        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              background: (theme) => theme.palette.primary.main,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {t('help.title')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            {t('help.intro')}
          </Typography>
        </Box>

        <Divider 
          sx={{ 
            mb: 4,
            background: (theme) => `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.6)}, transparent)`,
            height: 2,
            borderRadius: 1,
          }} 
        />

        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'center',
            animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
          }}
        >
          <Button 
            variant="contained" 
            onClick={onStartTutorial}
            sx={{
              background: (theme) => theme.palette.primary.main,
              borderRadius: 3,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(198, 202, 219, 0.4)',
              transition: 'all 0.3s ease',
              animation: `${pulse} 2s infinite`,
              '&:hover': {
                background: (theme) => alpha(theme.palette.primary.main, 0.8),
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(170, 174, 190, 0.6)',
                animation: 'none',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
          {t('help.tutorial')}
          </Button>
        </Box>



        <Box sx={{ animation: `${fadeInUp} 0.8s ease-out 0.6s both` }}>
          {sections.map((section, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  background: (theme) => alpha(theme.palette.background.paper, 0.8),
                  borderRadius: 3,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                    background: (theme) => alpha(theme.palette.background.paper, 0.95),
                  },
                }}
                onClick={() => toggleSection(idx)}
              >
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: (theme) => theme.palette.primary.main,
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: '1.1rem',
                      }}
                    >
                      {section.title}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '1.2rem',
                      transform: expandedSection === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    ▼
                  </Typography>
                </Box>
                
                <Collapse in={expandedSection === idx}>
                  <Box sx={{ px: 3, pb: 3 }}>
                    {Array.isArray(section.content) ? (
                      <Box sx={{ ml: 3 }}>
                        {section.content.map((feature, featureIdx) => (
                          <Box key={featureIdx} sx={{ mb: 2 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                color: theme.palette.text.primary,
                                fontWeight: 600,
                                fontSize: '1rem',
                                mb: 0.5,
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                lineHeight: 1.6,
                                fontSize: '0.9rem',
                                ml: 2,
                              }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                          ml: 3,
                          fontSize: '1rem',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {section.content}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};

export default HelpCenter;
