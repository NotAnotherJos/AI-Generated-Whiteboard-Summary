import { createContext } from 'react';

export const ThemeContext = createContext({
  themeName: 'default',          
  setThemeName: () => {},        
  mode: 'light',                 // Inform external about current light/dark
}); 
