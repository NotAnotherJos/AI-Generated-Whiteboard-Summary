// theme/Cloud.js
import { createTheme } from '@mui/material/styles';

export function makeCloudTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,

      background: {
        default: isDark
          ? 'linear-gradient(135deg, rgb(31, 38, 162) 0%, rgb(95, 67, 81) 100%)'
          : 'linear-gradient(135deg, #fafafa 0%,rgb(170, 220, 246) 100%)',
        paper: isDark ? 'rgb(17, 13, 63)' : '#ffffff',
      },

      text: {
        primary:   isDark ? 'rgb(217, 215, 229)' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgb(160, 158, 168)' : 'rgba(0, 0, 0, 0.60)',
        disabled:  isDark ? 'rgba(255,255,255,0.38)' : '#bdbdbd',
        title:     isDark ? 'rgb(154, 154, 198)' : '#4f4f90',
      },

      divider: isDark ? 'rgba(0,0,0,0.12)': 'rgb(171, 148, 131)' ,

      primary: {
        main: isDark ? 'rgb(120, 60, 180)' : 'rgb(226, 195, 60)',
      },

      success: {
        main: isDark ? 'rgb(130, 210, 122)' : 'rgb(100, 180, 95)',
      },
      error: {
        main: isDark ? 'rgb(219, 145, 118)' : 'rgb(200, 100, 90)',
      },
      info: {
        main: isDark ? 'rgb(255, 255, 255)' : 'rgba(0,0,0,0.87)',
      },
    },

  });
}
