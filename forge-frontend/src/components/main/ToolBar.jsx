import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MainCard from '../common/MainCard';
import CustomTooltip from '../common/Tip';
import ToolbarIconButton from '../toolbar/ToolbarIconButton';
import ToolbarSelect from '../toolbar/ToolbarSelect';
import ToolbarInput from '../toolbar/ToolbarInput';

const ToolBar = ({
  toolbar,
  updateToolbar,
  onResetDefaults,
  aiCapabilities,
  capabilitiesLoading,
  disabled = false,
  expanded = true,
  onExpandedChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (key, value) => {
    if (!disabled) {
      if (key === 'reset') {
        onResetDefaults?.();
      } else {
        updateToolbar?.(key, value);
      }
    }
  };

  const handleSelectChange = (key, value) => {
    if (!disabled) {
      updateToolbar?.(key, value);

      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }

        const tooltips = document.querySelectorAll('[role="tooltip"]');
        tooltips.forEach(tooltip => {
          if (tooltip.style) {
            tooltip.style.display = 'none';
          }
        });
      }, 100);
    }
  };

  const handleSelectBlur = () => {

    setTimeout(() => {
      const tooltips = document.querySelectorAll('[role="tooltip"]');
      tooltips.forEach(tooltip => {
        if (tooltip.style) {
          tooltip.style.display = 'none';
        }
      });
    }, 50);
  };

  const disabledTooltip = t('toolbar.disabled') || 'The toolbar cannot be modified during image analysis';

  return (
    <MainCard 
      collapsible={true} 
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      headerSx={{ padding: '4px'}} 
      contentSx={{ padding: '4px'}}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            alignItems: 'center',
            opacity: disabled ? 0.7 : 1,
            minHeight: 56,
            pointerEvents: disabled ? 'none' : 'auto', 
            userSelect: disabled ? 'none' : 'auto',
          }}
        >

          <ToolbarSelect
            toolbar={toolbar}
            handleSelectChange={handleSelectChange}
            handleSelectBlur={handleSelectBlur}
            aiCapabilities={aiCapabilities}
            capabilitiesLoading={capabilitiesLoading}
            disabled={disabled}
          />

          <ToolbarInput
            toolbar={toolbar}
            handleChange={handleChange}
            disabled={disabled}
          />

          <ToolbarIconButton
            toolbar={toolbar}
            handleChange={handleChange}
            disabled={disabled}
          />
        </Box>

        {disabled && (
          <CustomTooltip
            title={disabledTooltip}
            arrow
            placement="top"
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                zIndex: 2,
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              }}
            />
          </CustomTooltip>
        )}
      </Box>
    </MainCard>
  );
};

export default ToolBar;