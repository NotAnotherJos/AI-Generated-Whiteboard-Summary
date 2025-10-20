//Loading State Component
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MainCard from '../common/MainCard';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';


const Loading = ({ type = null}) => {
  const { t } = useTranslation();

  const titleKey = type ? `main.loading.${type}.title` : 'main.loading.title';
  const descKey = type ? `main.loading.${type}.description` : null;
  const contentKey = type ? `main.loading.${type}.content` :'main.loading.content';

  const Content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        minHeight: 200,
      }}
    >
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
        {t(contentKey)}
      </Typography>
    </Box>
  );

  return(
    <MainCard icon={<HourglassBottomIcon />} title={titleKey} description={descKey}>
      {Content}
    </MainCard>
  )

};

export default Loading;
