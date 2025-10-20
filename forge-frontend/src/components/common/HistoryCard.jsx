import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import RestorePage from '@mui/icons-material/RestorePage';
import Delete from '@mui/icons-material/Delete';
import Update from '@mui/icons-material/Update';
import { useTranslation } from 'react-i18next';
import CustomTooltip from './Tip';

const HistoryCard = ({
  item,           
  onRestore,        
  onReGenerate,    
  onDelete,       
}) => {
  const { t } = useTranslation();
  
  const [hoveredImageId, setHoveredImageId] = useState(null);
  const [hoveredContentId, setHoveredContentId] = useState(null);

  const handleRestore = () => {
    onRestore(item);
  };

  const handleReGenerate = (e) => {
    e.stopPropagation();
    onReGenerate(item);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.image_id);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        overflow: 'hidden',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
          zIndex: 1,
        },
      }}
    >

      <Box
        onMouseEnter={() => setHoveredImageId(item.image_id)}
        onMouseLeave={() => setHoveredImageId(null)}
        sx={{
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={handleRestore}
      >
        <CardMedia
          component="img"
          image={item.image_url}
          alt="History preview"
          sx={{
            width: '100%',
            aspectRatio: '3/2',
          }}
        />
        
        {hoveredImageId === item.image_id && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
            }}
          >

            <CustomTooltip title={t('tips.regenerateTip')}>
              <Box
                onClick={handleReGenerate}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Update sx={{ fontSize: 36 }} />
                <Typography variant="caption" ml={1}>
                  {t('history.regenerate')}
                </Typography>
              </Box>
            </CustomTooltip>
            

            <CustomTooltip title={t('tips.restoreTip')}>
              <Box
                onClick={handleRestore}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <RestorePage sx={{ fontSize: 36 }} />
                <Typography variant="caption" ml={1}>
                  {t('history.restore')}
                </Typography>
              </Box>
            </CustomTooltip>
          </Box>
        )}
      </Box>

      <CardContent
        onMouseEnter={() => setHoveredContentId(item.image_id)}
        onMouseLeave={() => setHoveredContentId(null)}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          minHeight: '80px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        }}
        onClick={handleDelete}
      >
        {hoveredContentId === item.image_id && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main',
            }}
          >
            <Delete sx={{ fontSize: 40 }} />
            <Typography variant="caption" display="block">
              {t('history.delete')}
            </Typography>
          </Box>
        )}
        
        <Typography
          variant="body2"
          sx={{ opacity: hoveredContentId === item.image_id ? 0 : 1 }}
        >
          <strong>{t('history.model')}:</strong> {item.model_name}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{ opacity: hoveredContentId === item.image_id ? 0 : 1 }}
        >
          <strong>{t('history.time')}:</strong>{' '}
          {new Date(item.created_at).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
