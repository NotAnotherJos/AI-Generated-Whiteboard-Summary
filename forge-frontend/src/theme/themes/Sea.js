// theme/Sea.js
import { createTheme } from '@mui/material/styles';

export function makeSeaTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,

      background: {
        default: isDark
          ? 'linear-gradient(135deg, rgb(10, 31, 41) 0%, rgba(52, 56, 127, 1) 50%, rgba(80, 151, 115, 1) 100%)'
          : 'linear-gradient(135deg, rgb(255, 220, 216) 0%, rgb(253, 244, 236) 25%, rgb(139, 238, 238) 100%)',
        paper: isDark ? 'rgba(13, 18, 21, 1)' : 'rgb(254, 250, 248)',
      },

      text: {
        primary:   isDark ? 'rgba(255,255,255,0.87)' : 'rgb(0, 15, 62)',
        secondary: isDark ? 'rgba(255,255,255,0.60)' : 'rgb(77, 101, 140)',
        disabled:  isDark ? 'rgba(255,255,255,0.38)' : '#bdbdbd',
        title:     isDark ? 'rgba(255,255,255,0.95)' : 'rgb(0, 0, 0)',
      },

      divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(160, 66, 47, 1)',

      primary: {
        main: isDark ? 'rgba(45, 167, 108, 1)': 'rgba(242, 162, 176, 0.8)' ,
      },

      success: {
        main: isDark ? 'rgba(136, 187, 100, 1)' : 'rgb(206, 222, 152)',
      },
      error: {
        main: isDark ? 'rgba(190, 78, 78, 1)' : 'rgb(236, 143, 143)',
      },
      info: {
        main: isDark ? 'rgba(255,255,255,0.8)' : 'rgb(255, 255, 255)',
      },
    },
  });
}
