import { Typography, Box, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import History from '@mui/icons-material/ManageHistory';
import MainCard from '../common/MainCard';
import CustomTooltip from '../common/Tip';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

const Upload = ({ onUpload, disabled, showHistory, onToggleHistory }) => {
  const { t } = useTranslation();

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onUpload?.(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSelect = (e) => {
    if (!disabled && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <MainCard
      icon={<AddAPhotoIcon />}
      title="main.upload.title"
      description="main.upload.description"
      headerActions={
        <CustomTooltip title={t('toolbar.show_history') || 'Show History'}>
          <IconButton
            className="guide-history-btn"
            onClick={onToggleHistory}
            sx={{ color: showHistory ? 'primary.main' : 'inherit' }}
          >
            <History />
          </IconButton>
        </CustomTooltip>
      }
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleSelect}
        disabled={disabled}
        id="file-upload"
        style={{ display: 'none' }}
      />
      <Box
        component="label"
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="guide-upload-area"
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 5,
          padding: '2rem',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'block',
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
          },
        }}
      >
        <Box>
          <Box sx={{ fontSize: '2.5rem', marginBottom: 1 }}>📁</Box>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
            {t('main.upload.content')}
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
};

export default Upload;