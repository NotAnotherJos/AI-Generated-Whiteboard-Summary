/**
 * CardButtons.jsx
 *
 * Renders a set of action buttons under a card : Retry / Publish /Go to new page 
 * Uses MUI for layout and styling, i18n for multi-language text,
 * and @forge/bridge router for page navigation.
 */
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { router } from '@forge/bridge';

const CardButtons = ({
  onRetry,
  onSubmit,
  pageUrl,
  loading,
}) => {
  const { t } = useTranslation();

  const handleViewPage = () => {
    const url = pageUrl?.startsWith('http')
      ? pageUrl
      : `https://ai-whiteboard.atlassian.net/wiki${pageUrl}`;
    router.navigate(url);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Retry Button */}
      {onRetry && (      
        <Button
          variant="outlined"
          onClick={onRetry}
          disabled={loading}
        >
          🔄 {t('main.card_but.retry')}
        </Button>
      )}


              {/* Publish Button */}
      {onSubmit && (
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          🚀 {t('main.card_but.publish')}
        </Button>
      )}

              {/* Go to New Page Button */}
      {pageUrl && (
        <Button
          variant="outlined"
          onClick={handleViewPage}
          disabled={loading}
        >
          📖 {t('main.card_but.go')}
        </Button>
      )}
    </Box>
  );
};

export default CardButtons;
