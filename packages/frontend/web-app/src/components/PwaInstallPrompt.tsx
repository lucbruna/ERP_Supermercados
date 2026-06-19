'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { Close, GetApp } from '@mui/icons-material';

const STORAGE_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!showPrompt) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 400,
        mx: 'auto',
        p: 2,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
      }}
    >
      <GetApp color="primary" sx={{ fontSize: 32 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Instale o CRM Supermercado
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Acesse rapidamente pela tela inicial
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={handleInstall}
        sx={{ flexShrink: 0 }}
      >
        Instalar
      </Button>
      <IconButton size="small" onClick={handleDismiss}>
        <Close fontSize="small" />
      </IconButton>
    </Paper>
  );
}
