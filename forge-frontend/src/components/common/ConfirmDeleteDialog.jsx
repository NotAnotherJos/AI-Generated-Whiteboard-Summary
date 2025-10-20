import { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTranslation } from 'react-i18next';


const ConfirmDeleteDialog = forwardRef(({
  open,
  onClose,
  onConfirm,
  type: controlledType = 'single',
  
  onDeleteSingle,  
  onDeleteAll, 
  disabled = false,
}, ref) => {
  const { t } = useTranslation();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalType, setInternalType] = useState('single');
  const [targetId, setTargetId] = useState(null);
  const [loading, setLoading] = useState(false);

  const isControlledMode = open !== undefined;
  
  const actualOpen = isControlledMode ? open : internalOpen;
  const actualType = isControlledMode ? controlledType : internalType;

  const openConfirm = (deleteType, id = null) => {
    if (disabled) return;
    setInternalType(deleteType);
    setTargetId(id);
    setInternalOpen(true);
  };

  const closeConfirm = () => {
    setInternalOpen(false);
    setInternalType('single');
    setTargetId(null);
  };

  const handleControlledConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleSelfManagedConfirm = async () => {
    setLoading(true);
    try {
      if (internalType === 'all' && onDeleteAll) {
        await onDeleteAll();
      } else if (internalType === 'single' && targetId && onDeleteSingle) {
        await onDeleteSingle(targetId);
      }
      closeConfirm();
    } catch (error) {
      console.error('Delete operation failed:', error);
      closeConfirm();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = isControlledMode ? handleControlledConfirm : handleSelfManagedConfirm;
  
  const handleClose = isControlledMode ? onClose : closeConfirm;

  useImperativeHandle(ref, () => ({
    openConfirm,
    closeConfirm,
  }));

  const canClose = isControlledMode ? true : !(disabled || loading);

  return (
    <Dialog open={actualOpen} onClose={canClose ? handleClose : undefined}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteForeverIcon color="error" />
        {actualType === 'all'
          ? t('history.confirmDeleteAllTitle')
          : t('history.confirmDeleteSingleTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {actualType === 'all'
            ? t('history.confirmDeleteAllContent')
            : t('history.confirmDeleteSingleContent')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={!isControlledMode && loading}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          autoFocus
          disabled={!isControlledMode && loading}
        >
          {!isControlledMode && loading ? '...' : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmDeleteDialog;