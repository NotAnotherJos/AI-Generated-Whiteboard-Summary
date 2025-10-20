import { Menu, MenuItem } from '@mui/material';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
  { code: 'ja', label: '日本語' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

const LangMenu = ({ open, anchorEl, onClose, selected, onChange }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
    >
      {LANGUAGES.map((lang) => (
        <MenuItem
          key={lang.code}
          selected={selected === lang.code}
          onClick={() => {
            onChange(lang.code);
            onClose();
          }}
        >
          {lang.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default LangMenu;
