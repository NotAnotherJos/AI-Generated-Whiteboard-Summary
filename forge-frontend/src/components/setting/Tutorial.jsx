import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, Portal, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, SkipNext } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

const Tutorial = ({ run, onCallback }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const observerRef = useRef(null);

  const steps = [
    {
      target: '.guide-upload-area',
      content: t('tutorial.steps.0.content'),
      title: t('tutorial.steps.0.title'),
    },
    {
      target: '.guide-history-btn',
      content: t('tutorial.steps.1.content'),
      title: t('tutorial.steps.1.title'),
    },
    {
      target: '.guide-model-select',
      content: t('tutorial.steps.2.content'),
      title: t('tutorial.steps.2.title'),
    },
    {
      target: '.guide-prompt-type-select',
      content: t('tutorial.steps.3.content'),
      title: t('tutorial.steps.3.title'),
    },
    {
      target: '.guide-prompt-input',
      content: t('tutorial.steps.4.content'),
      title: t('tutorial.steps.4.title'),
    },
    {
      target: '.guide-edit-toggle',
      content: t('tutorial.steps.5.content'),
      title: t('tutorial.steps.5.title'),
    },
    {
      target: '.guide-autoclear-toggle',
      content: t('tutorial.steps.6.content'),
      title: t('tutorial.steps.6.title'),
    },
    {
      target: '.guide-reset-btn',
      content: t('tutorial.steps.7.content'),
      title: t('tutorial.steps.7.title'),
    },
  ];

  const updateTargetPosition = useCallback(() => {
    if (!run || currentStep >= steps.length) return;

    const targetSelector = steps[currentStep].target;
    const targetElement = document.querySelector(targetSelector);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let top = rect.top;
      let left = rect.right + 20;

      if (left + tooltipWidth > viewport.width) {
        left = rect.left - tooltipWidth - 20;
      }

      if (left < 20) {
        left = Math.max(20, rect.left + (rect.width - tooltipWidth) / 2);
        top = rect.bottom + 20;
      }

      if (top + tooltipHeight > viewport.height) {
        top = rect.top - tooltipHeight - 20;
      }

      top = Math.max(20, Math.min(top, viewport.height - tooltipHeight - 20));
      left = Math.max(20, Math.min(left, viewport.width - tooltipWidth - 20));

      setTooltipPosition({ top, left });
    }
  }, [currentStep, run, steps]);

  useEffect(() => {
    if (!run) return;

    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    observerRef.current = new MutationObserver(updateTargetPosition);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [updateTargetPosition, run]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onCallback?.({ status: 'skipped' });
  };

  const handleFinish = () => {
    onCallback?.({ status: 'finished' });
  };

  useEffect(() => {
    if (run) {
      setCurrentStep(0);
    }
  }, [run]);

  if (!run || currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Portal>
      {targetRect && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: targetRect.top - 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 12999,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: targetRect.top + targetRect.height + 8,
              left: 0,
              width: '100vw',
              height: `calc(100vh - ${targetRect.top + targetRect.height + 8}px)`,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 12999,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: targetRect.top - 8,
              left: 0,
              width: targetRect.left - 8,
              height: targetRect.height + 16,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 12999,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: targetRect.top - 8,
              left: targetRect.left + targetRect.width + 8,
              width: `calc(100vw - ${targetRect.left + targetRect.width + 8}px)`,
              height: targetRect.height + 16,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 12999,
              pointerEvents: 'none',
            }}
          />
          
          <Box
            sx={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              border: `3px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              zIndex: 13001,
              pointerEvents: 'none',
              animation: 'tutorialPulse 2s infinite',
              '@keyframes tutorialPulse': {
                '0%': {
                  boxShadow: `0 0 0 0 ${theme.palette.primary.main}60`,
                  transform: 'scale(1)',
                },
                '50%': {
                  boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`,
                  transform: 'scale(1.02)',
                },
                '100%': {
                  boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
                  transform: 'scale(1)',
                },
              },
            }}
          />
        </>
      )}

      <Box
        sx={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 320,
          maxHeight: '80vh',
          background: theme.palette.background.paper,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 13001,
          overflow: 'hidden',
        }}
      >

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            backgroundColor: 'rgba(112, 148, 184, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: theme.palette.primary.main,
        },
      }}
    />


        <Box sx={{ p: 3 }}>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {currentStepData.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            {currentStepData.content}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 3,
              color: theme.palette.text.disabled,
              textAlign: 'center',
              fontSize: '0.8rem',
            }}
          >
            {currentStep + 1} / {steps.length}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'nowrap',
            }}
          >

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={currentStep === 0}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('common.back')}
              </Button>

              <Button
                variant="text"
                startIcon={<SkipNext />}
                onClick={handleSkip}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('common.skip')}
              </Button>
            </Box>

            <Button
              variant="contained"
              endIcon={currentStep === steps.length - 1 ? null : <ArrowForward />}
              onClick={handleNext}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                minWidth: 85,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {currentStep === steps.length - 1 ? t('common.finish') : t('common.next')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default Tutorial;