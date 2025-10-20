import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  IconButton,
  styled,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../../utils';
import MainCard from '../common/MainCard';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadFile from '@mui/icons-material/UploadFile';
import CustomTooltip from '../common/Tip';
import HistoryCard from '../common/HistoryCard';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';
import { imageService } from '../../services';

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2),
}));

const UploadButton = ({ onClose, t }) => (
  <CustomTooltip title={t('history.upload')}>
    <IconButton onClick={onClose}>
      <UploadFile />
    </IconButton>
  </CustomTooltip>
);

const UserHistory = ({ userId, onClose, onRestore, onReGenerate }) => {
  const { t } = useTranslation();
  const deleteDialogRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 设定历史记录上限
  const HISTORY_LIMIT = 10;

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    api
      .get(`/api/users/${userId}/images`)
      .then((data) => setHistory(data))
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message;
        setError(t('history.loadFailed') + ': ' + msg);
      })
      .finally(() => setLoading(false));
  }, [userId, t]);



  const handleDeleteAll = async () => {
    if (!history.length) return;

    setDeleting(true);
    try {
      await Promise.all(
        history.map((item) =>
          imageService.remove(item.image_id, userId)
        )
      );
      setHistory([]);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(t('history.deleteFailed') + ': ' + msg);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (imageId) => {
    try {
      await imageService.remove(imageId, userId);
      setHistory(history.filter(item => item.image_id !== imageId));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(t('history.deleteFailed') + ': ' + msg);
      throw err;
    }
  };

  const handleDelete = (imageId) => {
    deleteDialogRef.current?.openConfirm('single', imageId);
  };

  if (!userId) {
    return <ErrorText>{t('history.noUser')}</ErrorText>;
  }

  return (
    <>
      <MainCard
        icon={<HistoryIcon />}
        title={t('history.title')}
        description={t('history.description')}
        headerActions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {history.length > 0 && (
              <CustomTooltip title={t('history.deleteAll')}>
                <IconButton
                  onClick={() => deleteDialogRef.current?.openConfirm('all')}
                  disabled={deleting}
                  color="error"
                >
                  <DeleteForeverIcon />
                </IconButton>
              </CustomTooltip>
            )}
            <UploadButton onClose={onClose} t={t} />
          </Box>
        }
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : !history.length ? (
          <Typography>{t('history.empty')}</Typography>
        ) : (
          <>
            {/* record count */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 2,
              mb: 2,
              px: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                {t('history.recordCount')}
              </Typography>
              <Chip
                label={`${history.length} / ${HISTORY_LIMIT}`}
                size="small"
                color={history.length >= HISTORY_LIMIT ? "warning" : "default"}
                variant="outlined"
              />
            </Box>
            
            {/* history record grid */}
            <Grid container spacing={2}>
              {history.map((item) => (
              <Grid
                item
                key={item.image_id}
                sx={{
                  width: {
                    xs: '100%',
                    sm: '48%',
                    md: '30%',
                  },
                  position: 'relative',
                }}
              >
                <HistoryCard
                  item={item}
                  onRestore={onRestore}
                  onReGenerate={onReGenerate}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
            </Grid>
          </>
        )}
      </MainCard>

      <ConfirmDeleteDialog
        ref={deleteDialogRef}
        onDeleteSingle={handleDeleteSingle}
        onDeleteAll={handleDeleteAll}
        disabled={deleting}
      />

    </>
  );
};

export default UserHistory;
