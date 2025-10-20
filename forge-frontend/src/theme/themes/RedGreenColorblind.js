// theme/RedGreenColorblind.js
import { createTheme } from '@mui/material/styles';

export function makeColorblindTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark
          ? '#222435'
          : '#eaf6fa',
        paper: isDark ? '#29294c' : '#ffffff',
      },
      text: {
        primary: isDark ? '#F7F7F7' : '#111',
        secondary: isDark ? '#C6DEF1' : '#333',
        disabled: isDark ? '#b5b5b5' : '#bbbbbb',
        title: isDark ? '#FFC145' : '#333399',
      },
      divider: isDark ? '#5B7DB1' : '#bcd2e8',
      // Primary color (dark blue - colorblind-friendly)
      primary: {
        main: isDark ? '#3B61A5' : '#2364AA',
      },
      // Secondary color (orange - colorblind-friendly)
      secondary: {
        main: isDark ? '#FFC145' : '#FFB627',
      },
      // Success color (deep yellow - colorblind-friendly)
      success: {
        main: isDark ? '#F6E27A' : '#FFD23F',
      },
      // Error color (purple - colorblind-friendly)
      error: {
        main: isDark ? '#B77DDB' : '#843b97',
      },
      // Info color (cyan - colorblind-friendly)
      info: {
        main: isDark ? '#47B8E0' : '#00A6ED',
      },
      // Warning color (high-contrast orange)
      warning: {
        main: isDark ? '#FFC145' : '#FF9636',
      },
    }
  });
}
