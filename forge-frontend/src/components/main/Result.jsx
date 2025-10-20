import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MainCard from '../common/MainCard';
import CardButtons from '../common/CardButtons';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmsFailedIcon from '@mui/icons-material/SmsFailed';

const Result = ({ result, onRetry }) => {
  const { t } = useTranslation();
  const pageUrl = result.pageUrl
  const isSuccess = result?.success;

  return (
    <MainCard
      icon={isSuccess ? <CheckCircleIcon /> : <SmsFailedIcon />}
      title={isSuccess ? 'main.successfully.title' : 'main.errors.title'}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: (theme) =>
            isSuccess
              ? alpha(theme.palette.success.main, 0.2)
              : alpha(theme.palette.error.main, 0.2),
          border: (theme) =>
            `1px solid ${isSuccess ? theme.palette.success.main : theme.palette.error.main}`,
          color: (theme) =>
            isSuccess ? theme.palette.success.dark : theme.palette.error.dark,
        }}
      >
        <Typography variant="body1">
          {isSuccess
            ? t('main.successfully.content')
            : result?.error || t('result.unknownError')}
        </Typography>
      </Box>

      <Box mt={3}>
        <CardButtons
          onRetry={onRetry}
          onSubmit={null}
          pageUrl={isSuccess ? pageUrl : null}
          loading={false}
        />
      </Box>
    </MainCard>
  );
};

export default Result;