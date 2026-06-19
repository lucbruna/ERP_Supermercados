'use client';

import { ReactNode, useState, useMemo, createContext, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { lightTheme, darkTheme } from './theme';
import { register } from '@/lib/pwa';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    register();
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '8px',
                background: mode === 'dark' ? '#333' : '#fff',
                color: mode === 'dark' ? '#fff' : '#333',
              },
            }}
          />
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
