import { TextField } from '@mui/material';
import CustomTooltip from '../common/Tip';
import { useTranslation } from 'react-i18next';

const ToolbarInput = ({ toolbar, handleChange, disabled }) => {
  const { t } = useTranslation();

  return (
    <CustomTooltip title={!disabled ? t('toolbar.prompt') || 'Custom Prompt' : ''}>
      <TextField
        className="guide-prompt-input"
        size="small"
        value={toolbar.prompt}
        onChange={e => handleChange('prompt', e.target.value)}
        placeholder={t('toolbar.prompt_placeholder')}
        sx={{ minWidth: 200 }}
        disabled={disabled}
      />
    </CustomTooltip>
  );
};

export default ToolbarInput;
