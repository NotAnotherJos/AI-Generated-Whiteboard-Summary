// Page Editing Component
import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MainCard from '../common/MainCard';
import CardButtons from '../common/CardButtons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import EditSquare from '@mui/icons-material/EditSquare';

const Edit = ({
  result,
  onCreatePage,
  onRetry,
  loading,
}) => {
  const { t } = useTranslation();
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');


  useEffect(() => {
    if (result?.title) setCustomTitle(result.title);
    if (result?.content) setCustomContent(result.content);
  }, [result]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const title = customTitle.trim();
    const content = customContent?.trim();
    onCreatePage(title, content, result.imageId);
  };

  return (
    <MainCard icon={<EditSquare />} title="main.edit.title" description="main.edit.description">
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            {t('main.edit.page_title')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={t('main.edit.placeholder')}
            disabled={loading}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            {t('main.edit.content_title')}
          </Typography>
          <ReactQuill
            theme="snow"
            value={customContent}
            onChange={setCustomContent}
            readOnly={loading}
          />
        </Box>
        <CardButtons
          onRetry={onRetry}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Box>
    </MainCard>
  );
};

export default Edit;
