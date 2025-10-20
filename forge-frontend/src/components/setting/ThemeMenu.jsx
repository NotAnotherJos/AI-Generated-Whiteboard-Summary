// Settings/ThemeMenu.jsx
import { Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const THEMES = [
  { code: 'default', labelKey: 'theme.default' },
  { code: 'sea', labelKey: 'theme.theme_1' },
  { code: 'cloud', labelKey: 'theme.theme_2' },
  { code: 'rgblind', labelKey: 'theme.theme_3' },
];

const ThemeMenu = ({ open, anchorEl, onClose, selected, onChange }) => {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
    >
      {THEMES.map((theme) => (
        <MenuItem
          key={theme.code}
          selected={selected === theme.code}
          onClick={() => {
            onChange(theme.code);
            onClose();
          }}
        >
          {t(theme.labelKey)}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ThemeMenu;
