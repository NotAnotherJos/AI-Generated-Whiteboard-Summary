import { MenuItem, Select } from '@mui/material';
import CustomTooltip from '../common/Tip';
import { useTranslation } from 'react-i18next';

const scrollableMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 250,
      overflowY: 'auto',
    },
  },
};

const ToolbarSelect = ({ 
  toolbar, 
  handleSelectChange, 
  handleSelectBlur,
  aiCapabilities, 
  capabilitiesLoading, 
  disabled 
}) => {
  const { t } = useTranslation();

  const getPromptTypeDisplayName = type => {
    const translatedName = t(`toolbar.prompt_types.${type}`);
    if (translatedName && translatedName !== `toolbar.prompt_types.${type}`) {
      return translatedName;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <>

      <CustomTooltip title={!disabled ? t('toolbar.model') || 'AI Model' : ''}>
        <Select
          className="guide-model-select"
          size="small"
          value={toolbar.model}
          onChange={e => handleSelectChange('model', e.target.value)}
          onBlur={handleSelectBlur}
          displayEmpty
          disabled={capabilitiesLoading || disabled}
          sx={{ minWidth: 140 }}
          MenuProps={scrollableMenuProps}
        >
          {capabilitiesLoading ? (
            <MenuItem value={toolbar.model}>Loading...</MenuItem>
          ) : (
            aiCapabilities.supportedModels.map(model => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))
          )}
        </Select>
      </CustomTooltip>

      <CustomTooltip title={!disabled ? t('toolbar.prompt_type') || 'Prompt Type' : ''}>
        <Select
          className="guide-prompt-type-select"
          size="small"
          value={toolbar.promptType || 'general'}
          onChange={e => handleSelectChange('promptType', e.target.value)}
          onBlur={handleSelectBlur}
          displayEmpty
          disabled={capabilitiesLoading || disabled}
          sx={{ minWidth: 120 }}
          MenuProps={scrollableMenuProps}
        >
          {capabilitiesLoading ? (
            <MenuItem value={toolbar.promptType || 'general'}>Loading...</MenuItem>
          ) : (
            aiCapabilities.supportedPromptTypes.map(type => (
              <MenuItem key={type} value={type}>
                {getPromptTypeDisplayName(type)}
              </MenuItem>
            ))
          )}
        </Select>
      </CustomTooltip>
    </>
  );
};

export default ToolbarSelect;
