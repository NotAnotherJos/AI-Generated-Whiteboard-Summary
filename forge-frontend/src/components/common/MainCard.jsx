// General Card Component
import React, { useState } from 'react';
import { Card, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const MainCard = ({
  title,
  description,
  icon,
  children,
  sx = {},
  collapsible = false,
  expanded: externalExpanded,
  onExpandedChange,
  headerActions = null,
  headerSx = {},
  contentSx = {},
}) => {
  const { t } = useTranslation();
  const [internalExpanded, setInternalExpanded] = useState(true);
  
  // Use external control or internal state
  const expanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const setExpanded = onExpandedChange || setInternalExpanded;


  const handleToggle = () => {
    if (collapsible) {
      setExpanded((prev) => !prev);
    }
  };

  const showHeader = title || description || collapsible;

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 5,
        overflow: 'hidden',
        border: 'none',
        borderColor: 'divider',
        maxWidth: '70%',
        margin: '1rem auto',
        boxShadow: 3,
        padding:0,
        ...sx,
      }}
      elevation={0}
    >
      {showHeader && (
        <Box
          onClick={collapsible ? handleToggle : undefined}
          aria-expanded={expanded}
          role={collapsible ? 'button' : undefined}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1.5px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.5),
            gap: 1,
            px: 2,
            py: 1.5,
            cursor: collapsible ? 'pointer' : 'default',
            userSelect: 'none',
            '&:hover': collapsible ? { backgroundColor: 'action.hover' } : {},
            ...headerSx,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon && (
                <Box
                  sx={{
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </Box>
              )}
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {t(title)}
                </Typography>
              )}
              {collapsible &&
                (expanded ? (
                  <KeyboardArrowUpIcon fontSize="small" sx={{ ml: 1 }} />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1 }} />
                ))}
            </Box>

            {description && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t(description)}
              </Typography>
            )}
          </Box>

          {headerActions && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {headerActions}
            </Box>
          )}
        </Box>
      )}

      {(!collapsible || expanded) && <Box sx={{ padding: 2, ...contentSx}}>{children}</Box>}
    </Card>
  );
};

export default MainCard;
