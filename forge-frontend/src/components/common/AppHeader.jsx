/**
 * AppHeader component
 * This component renders the main application header including title and description
 * i18n for multi-language and MUI for style
 */

import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <Box 
      sx={{
        textAlign: 'center',
        mb: 3,
        mx: 'auto',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Typography
        variant="h4" 
        component="h1"
        sx={{
          fontWeight: 600,
          color: 'text.title',
          marginBottom: 0.3,
        }}
      >
        {t('app.title')}
      </Typography>
      <Typography 
        variant="body1"
        sx={{
          color: 'text.title',
          fontSize: '1rem',
        }}
      >
        {t('app.description')}
      </Typography>
    </Box>
  );
};

export default AppHeader;
