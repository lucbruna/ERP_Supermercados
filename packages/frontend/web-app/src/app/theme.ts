'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

const corporateGreen = '#2E7D32';
const corporateBlue = '#1565C0';

const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' } },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5' },
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: { main: corporateGreen, light: '#4CAF50', dark: '#1B5E20', contrastText: '#fff' },
    secondary: { main: corporateBlue, light: '#1976D2', dark: '#0D47A1', contrastText: '#fff' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1a1a2e', secondary: '#546e7a' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
    info: { main: '#0288D1' },
    divider: '#e0e0e0',
  },
});

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#66BB6A', light: '#81C784', dark: '#388E3C', contrastText: '#fff' },
    secondary: { main: '#42A5F5', light: '#64B5F6', dark: '#1565C0', contrastText: '#fff' },
    background: { default: '#0a1929', paper: '#1e2937' },
    text: { primary: '#e3f2fd', secondary: '#90caf9' },
    success: { main: '#66BB6A' },
    warning: { main: '#FFA726' },
    error: { main: '#EF5350' },
    info: { main: '#29B6F6' },
    divider: '#2d3a4a',
  },
});
