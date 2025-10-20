import { Box, ButtonBase, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TranslateIcon from '@mui/icons-material/Translate';
import PaletteIcon from '@mui/icons-material/Palette';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import LangMenu from '../setting/LangMenu';
import ThemeMenu from '../setting/ThemeMenu';

const Settings = ({
  themeValue,
  language,
  onThemeChange,
  onLanguageChange,
  onOpenHelpCenter,
}) => {
  const { t } = useTranslation();
  const [anchorElLang, setAnchorElLang] = useState(null);
  const [anchorElTheme, setAnchorElTheme] = useState(null);

  const openMenu = (setter) => (event) => setter(event.currentTarget);
  const closeMenu = (setter) => () => setter(null);

  const iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    color: 'info.main',
    px: 1,
    py: 0.5,
    borderRadius: 1,
    '&:hover': { bgcolor: 'action.hover' },
    width: 130,
    justifyContent: 'flex-start',
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 2000,
        alignItems: 'flex-start',
      }}
    >
      <ButtonBase
        onClick={openMenu(setAnchorElLang)}
        sx={iconButtonStyle}
        className="guide-language-button"
      >
        <TranslateIcon sx={{ mr: 1, color: 'info.main' }} />
        <Typography variant="body2">{t('language')}</Typography>
      </ButtonBase>
              <LangMenu
        open={Boolean(anchorElLang)}
        anchorEl={anchorElLang}
        onClose={closeMenu(setAnchorElLang)}
        selected={language}
        onChange={onLanguageChange}
      />

      <ButtonBase
        onClick={openMenu(setAnchorElTheme)}
        sx={iconButtonStyle}
      >
        <PaletteIcon sx={{ mr: 1, color: 'info.main' }} />
        <Typography variant="body2">{t('theme.title')}</Typography>
      </ButtonBase>
      <ThemeMenu
        open={Boolean(anchorElTheme)}
        anchorEl={anchorElTheme}
        onClose={closeMenu(setAnchorElTheme)}
        selected={themeValue}
        onChange={onThemeChange}
      />

      <ButtonBase
        onClick={onOpenHelpCenter}
        sx={iconButtonStyle}
      >
        <HelpOutlineIcon sx={{ mr: 1, color: 'info.main' }} />
        <Typography variant="body2">{t('help.title')}</Typography>
      </ButtonBase>
    </Box>
  );
};

export default Settings;
