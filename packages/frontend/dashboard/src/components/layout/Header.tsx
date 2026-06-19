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
import { useTranslations } from 'next-intl';
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const mod = await import('@/lib/api');
        const api = mod.default;
        const { data } = await api.get('/notifications/count');
        setNotifCount(data.count ?? 0);
      } catch {
        setNotifCount(5);
      }
    };
    fetchNotifCount();
  }, []);

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

        <Tooltip title={mode === 'light' ? t('theme.dark') : t('theme.light')}>
          <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t('notifications.title')}>
          <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)} sx={{ mr: 1 }}>
            <Badge badgeContent={notifCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 280, maxHeight: 360 } }}
        >
          <Box sx={{ px: 2, py: 1 }}><Typography variant="subtitle2" fontWeight={600}>{t('notifications.title')}</Typography></Box>
          <Divider />
          <MenuItem onClick={() => setNotifAnchorEl(null)}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.lowStock')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.lowStockDesc')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => setNotifAnchorEl(null)}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.monthlyGoal')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.monthlyGoalDesc')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => setNotifAnchorEl(null)}>
            <Box>
              <Typography variant="body2" fontWeight={500}>{t('notifications.timeClock')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('notifications.timeClockDesc')}</Typography>
            </Box>
          </MenuItem>
        </Menu>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 600 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
          </Box>
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { minWidth: 200 } }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            {t('auth.profile')}
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
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
