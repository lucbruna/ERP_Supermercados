'use client';

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Toolbar,
} from '@mui/material';
import {
  Dashboard,
  People,
  AttachMoney,
  PointOfSale,
  Inventory,
  ShoppingCart,
  Group,
  Videocam,
  PriceCheck,
  Assessment,
  ExpandLess,
  ExpandMore,
  Store,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Api,
  Business,
  Handshake,
  Notifications,
  LocalShipping,
  QrCode,
  Description,
  School,
  Settings,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const drawerWidth = 260;
const collapsedWidth = 72;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  path?: string;
  children?: { labelKey: string; path: string }[];
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const t = useTranslations('nav');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const currentWidth = open ? drawerWidth : collapsedWidth;

  const handleToggleExpand = (labelKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(labelKey) ? prev.filter((i) => i !== labelKey) : [...prev, labelKey],
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) onToggle();
  };

  const navItems: NavItem[] = [
    { labelKey: 'dashboard', icon: <Dashboard />, path: '/dashboard' },
    { labelKey: 'relatorios', icon: <Assessment />, path: '/relatorios' },
    {
      labelKey: 'rh',
      icon: <People />,
      children: [
        { labelKey: 'funcionarios', path: '/dashboard/rh' },
      ],
    },
    {
      labelKey: 'financeiro',
      icon: <AttachMoney />,
      children: [
        { labelKey: 'movimentacoes', path: '/dashboard/financeiro' },
      ],
    },
    {
      labelKey: 'fiscal',
      icon: <Receipt />,
      children: [
        { labelKey: 'gestaoFiscal', path: '/fiscal' },
      ],
    },
    {
      labelKey: 'pdv',
      icon: <PointOfSale />,
      children: [
        { labelKey: 'vendas', path: '/dashboard/pdv' },
        { labelKey: 'tabelasPreco', path: '/precos' },
        { labelKey: 'pdvAvancado', path: '/pdv-avancado' },
      ],
    },
    {
      labelKey: 'estoque',
      icon: <Inventory />,
      children: [
        { labelKey: 'produtos', path: '/dashboard/estoque' },
        { labelKey: 'estoqueAvancado', path: '/estoque' },
      ],
    },
    {
      labelKey: 'compras',
      icon: <ShoppingCart />,
      children: [
        { labelKey: 'pedidos', path: '/dashboard/compras' },
        { labelKey: 'comprasAvancado', path: '/compras' },
      ],
    },
    {
      labelKey: 'crm',
      icon: <Group />,
      children: [
        { labelKey: 'clientes', path: '/dashboard/crm' },
        { labelKey: 'crmCompleto', path: '/crm' },
      ],
    },
    {
      labelKey: 'convenios',
      icon: <Handshake />,
      children: [
        { labelKey: 'gestaoConvenios', path: '/convenios' },
      ],
    },
    {
      labelKey: 'frota',
      icon: <LocalShipping />,
      children: [
        { labelKey: 'gestaoFrota', path: '/frota' },
      ],
    },
    {
      labelKey: 'codigoBarras',
      icon: <QrCode />,
      children: [
        { labelKey: 'gestaoCodigos', path: '/codigo-barras' },
      ],
    },
    {
      labelKey: 'contratos',
      icon: <Description />,
      children: [
        { labelKey: 'gestaoContratos', path: '/contratos' },
      ],
    },
    {
      labelKey: 'habilidades',
      icon: <School />,
      children: [
        { labelKey: 'gestaoHabilidades', path: '/habilidades' },
      ],
    },
    {
      labelKey: 'cftv',
      icon: <Videocam />,
      children: [
        { labelKey: 'monitoramento', path: '/dashboard/cftv' },
      ],
    },
    {
      labelKey: 'integracoes',
      icon: <Api />,
      children: [
        { labelKey: 'apiExterna', path: '/integracoes' },
      ],
    },
    {
      labelKey: 'empresas',
      icon: <Business />,
      children: [
        { labelKey: 'multiEmpresa', path: '/empresas' },
      ],
    },
    {
      labelKey: 'notificacoes',
      icon: <Notifications />,
      children: [
        { labelKey: 'alertas', path: '/notificacoes' },
      ],
    },
    {
      labelKey: 'delivery',
      icon: <LocalShipping />,
      children: [
        { labelKey: 'gestaoDelivery', path: '/delivery' },
      ],
    },
    {
      labelKey: 'configuracoes',
      icon: <Settings />,
      children: [
        { labelKey: 'configSistema', path: '/configuracoes' },
      ],
    },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: 64, px: open ? 2 : 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <Store color="primary" sx={{ fontSize: 32 }} />
          {open && (
            <Typography variant="h6" fontWeight={700} color="primary.main" noWrap>
              CRM Supermercado
            </Typography>
          )}
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ flex: 1, overflow: 'auto', px: open ? 1 : 0.5 }}>
        {navItems.map((item) => {
          const isExpanded = expandedItems.includes(item.labelKey);
          const isActive = item.path
            ? pathname === item.path
            : item.children?.some((child) => pathname.startsWith(child.path));

          if (item.children) {
            return (
              <Box key={item.labelKey}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => handleToggleExpand(item.labelKey)}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        mr: open ? 2 : 'auto',
                        color: isActive ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && <ListItemText primary={t(item.labelKey)} />}
                    {open && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.path;
                      return (
                        <ListItem key={child.path} disablePadding>
                          <ListItemButton
                            onClick={() => handleNavigation(child.path)}
                            selected={isChildActive}
                            sx={{ pl: 7, borderRadius: 1, mb: 0.5 }}
                          >
                            <ListItemText
                              primary={t(child.labelKey)}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: isChildActive ? 600 : 400,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItem key={item.labelKey} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path!)}
                selected={isActive}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    mr: open ? 2 : 'auto',
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={t(item.labelKey)} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {!isMobile && (
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <IconButton onClick={onToggle} sx={{ width: '100%' }}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}
