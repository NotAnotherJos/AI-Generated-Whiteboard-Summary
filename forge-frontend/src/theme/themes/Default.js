// theme/Default.js
import { createTheme } from '@mui/material/styles';

export function makeDefaultTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,

      background: {
        default: isDark
          ? 'linear-gradient(120deg, #0a0b2f 0%, #2e2b6f 55%, #3c4b6f 100%)'
          : 'linear-gradient(120deg, #121363ff 0%, #6558d6ff 55%, #90abd5ff 100%)',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },

      text: {
        primary:   isDark ? 'rgba(255,255,255,0.87)' : '#212121',
        secondary: isDark ? 'rgba(255,255,255,0.60)' : '#757575',
        disabled:  isDark ? 'rgba(255,255,255,0.38)' : '#bdbdbd',
        title:     '#ffffff',
      },

      divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgb(198, 193, 242)',

      primary: {
        main: isDark ? 'rgb(121, 140, 255)' : 'rgb(75, 98, 245)',
      },

      success: {
        main: isDark ? 'rgb(145, 200, 100)' : 'rgb(179, 236, 135)',
      },
      error: {
        main: isDark ? 'rgb(255, 120, 120)' : 'rgb(236, 135, 135)',
      },
      info: {
        main: isDark ? 'rgba(255,255,255,0.8)' : 'rgb(255, 255, 255)',
      },
    },
  });
}
