'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useTheme,
  Tooltip,
  Select,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  DarkMode,
  LightMode,
  Settings,
  Person,
  Logout,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useThemeMode } from '@/app/providers';
import LocaleSwitcher from '@/components/LocaleSwitcher';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
  const t = useTranslations();
  const { user, signOut } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const router = useRouter();

  const [empresas, setEmpresas] = useState<{ id: string; nomeFantasia: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState(user?.companyId || '');
  const [notifCount, setNotifCount] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const notifApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3014',
    timeout: 30000,
  });
  notifApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const { token } = parseCookies();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (user?.companyId) {
      api.get('/auth/empresas').then(({ data }) => setEmpresas(Array.isArray(data) ? data : [])).catch(() => {});
      notifApi.get('/notificacoes?companyId=1&lida=false').then(({ data }) => setNotifCount(Array.isArray(data) ? data.length : 0)).catch(() => {});
    }
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        {title && (
          <Typography variant="h6" fontWeight={600} noWrap sx={{ flex: 1 }}>
            {title}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        <LocaleSwitcher />

        {empresas.length > 0 && (
          <Select
            size="small"
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            sx={{ mr: 2, minWidth: 180, '& .MuiSelect-select': { py: 0.5 } }}
          >
            {empresas.map(e => (
              <MenuItem key={e.id} value={e.id}>
                <Chip label={e.nomeFantasia} size="small" sx={{ mr: 1 }} />
              </MenuItem>
            ))}
          </Select>
        )}

        <Tooltip title={mode === 'light' ? t('theme.dark') : t('theme.light')}>
          <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Tooltip>

        <Tooltip title={t('notifications.title')}>
          <IconButton onClick={handleNotifOpen} sx={{ mr: 1 }}>
            <Badge badgeContent={notifCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          PaperProps={{ sx: { minWidth: 280, maxHeight: 360 } }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {t('notifications.title')}
            </Typography>
            <Button size="small" onClick={() => { handleNotifClose(); router.push('/notificacoes'); }}>{t('notifications.viewAll')}</Button>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.lowStock')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.lowStockDesc')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.dailyGoal')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.dailyGoalDesc')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.timeClock')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.timeClockDesc')}</Typography>
            </Box>
          </MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleMenuOpen}>
          <Avatar
            src={user?.avatar}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { minWidth: 200 } }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            {t('auth.profile')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            {t('auth.settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={signOut}>
            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
            <Typography color="error">{t('auth.logout')}</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
