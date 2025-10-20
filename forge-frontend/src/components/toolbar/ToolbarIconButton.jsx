import { Box, Checkbox, useTheme } from '@mui/material';
import EditSquare from '@mui/icons-material/EditSquare';
import DeleteSweep from '@mui/icons-material/DeleteSweep';
import RestartAlt from '@mui/icons-material/RestartAlt';
import CustomTooltip from '../common/Tip';
import { useTranslation } from 'react-i18next';

const IconCheckButton = ({ checked, onChange, icon, tooltip, disabled, className }) => {
  const theme = useTheme();

  return (
    <CustomTooltip title={tooltip}>
      <Box
        className={className}
        onClick={() => !disabled && onChange(!checked)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          cursor: disabled ? 'not-allowed' : 'pointer',
          px: 1,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {icon && icon({ sx: { color: checked ? theme.palette.primary.main : 'inherit' } })}
        <Checkbox
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          size="small"
          sx={{
            padding: 0,
            color: theme.palette.primary.main,
          }}
          disabled={disabled}
        />
      </Box>
    </CustomTooltip>
  );
};

const ToolbarIconButton = ({ toolbar, handleChange, disabled }) => {
  const { t } = useTranslation();

  const handleReset = () => {
    if (!disabled && handleChange) {
      handleChange('reset');
    }
  };

  return (
    <>

      <IconCheckButton
        className="guide-edit-toggle"
        checked={toolbar.edit}
        onChange={val => handleChange('edit', val)}
        icon={props => <EditSquare {...props} />}
        tooltip={t('toolbar.edit') || 'Enable Editing'}
        disabled={disabled}
      />

      <IconCheckButton
        className="guide-autoclear-toggle"
        checked={toolbar.autoClear}
        onChange={val => handleChange('autoClear', val)}
        icon={props => <DeleteSweep {...props} />}
        tooltip={t('toolbar.auto_clear') || 'Auto Clear'}
        disabled={disabled}
      />

      <CustomTooltip title={!disabled ? t('toolbar.reset') || 'Reset' : ''}>
        <Box
          className="guide-reset-btn"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            pointerEvents: disabled ? 'none' : 'auto',
            opacity: disabled ? 0.7 : 1,
          }}
          onClick={disabled ? undefined : handleReset}
        >
          <RestartAlt />
        </Box>
      </CustomTooltip>
    </>
  );
};

export default ToolbarIconButton;
