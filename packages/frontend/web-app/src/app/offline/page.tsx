'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { WifiOff, Refresh, Home, Store, Dashboard } from '@mui/icons-material';

const cachedPages = [
  { label: 'Início', icon: <Home />, path: '/' },
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'PDV Avançado', icon: <Store />, path: '/pdv-avancado' },
];

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReconnect = () => {
    window.location.reload();
  };

  if (isOnline) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <WifiOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Você está offline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sua conexão com a internet foi perdida. Algumas funcionalidades podem não
            estar disponíveis.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleReconnect}
            size="large"
            sx={{ mb: 3 }}
          >
            Tentar reconectar
          </Button>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Páginas ainda acessíveis:
          </Typography>
          <List dense>
            {cachedPages.map((page) => (
              <ListItem key={page.path} component="a" href={page.path}>
                <ListItemIcon sx={{ minWidth: 40 }}>{page.icon}</ListItemIcon>
                <ListItemText primary={page.label} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
