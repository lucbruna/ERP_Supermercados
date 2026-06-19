'use client';

import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  People,
  TrendingUp,
  TrendingDown,
  Inventory,
  Warning,
  PersonAdd,
  LocalAtm,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';

const salesData = [
  { hora: '00:00', vendas: 1200, meta: 1500 },
  { hora: '04:00', vendas: 800, meta: 1000 },
  { hora: '08:00', vendas: 4500, meta: 4000 },
  { hora: '10:00', vendas: 8200, meta: 7500 },
  { hora: '12:00', vendas: 9800, meta: 9000 },
  { hora: '14:00', vendas: 11200, meta: 10000 },
  { hora: '16:00', vendas: 13500, meta: 12000 },
  { hora: '18:00', vendas: 15200, meta: 14000 },
];

const weeklySales = [
  { dia: 'Seg', atual: 45000, anterior: 42000 },
  { dia: 'Ter', atual: 52000, anterior: 48000 },
  { dia: 'Qua', atual: 49000, anterior: 51000 },
  { dia: 'Qui', atual: 58000, anterior: 53000 },
  { dia: 'Sex', atual: 62000, anterior: 59000 },
  { dia: 'Sáb', atual: 78000, anterior: 72000 },
  { dia: 'Dom', atual: 35000, anterior: 38000 },
];

const departmentRevenue = [
  { name: 'Hortifrúti', value: 185000 },
  { name: 'Açougue', value: 142000 },
  { name: 'Padaria', value: 98000 },
  { name: 'Laticínios', value: 115000 },
  { name: 'Bebidas', value: 205000 },
  { name: 'Limpeza', value: 88000 },
  { name: 'Outros', value: 167000 },
];

const lowStockItems = [
  { produto: 'Arroz Tipo 1 5kg', atual: 12, minimo: 50, unidade: 'sacos' },
  { produto: 'Feijão Preto 1kg', atual: 8, minimo: 40, unidade: 'sacos' },
  { produto: 'Óleo de Soja 900ml', atual: 15, minimo: 60, unidade: 'unidades' },
  { produto: 'Leite Integral 1L', atual: 20, minimo: 80, unidade: 'unidades' },
  { produto: 'Açúcar Refinado 5kg', atual: 5, minimo: 30, unidade: 'sacos' },
];

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('salesToday')}
            value="R$ 152,4 mil"
            icon={<AttachMoney />}
            trend="up"
            trendValue="+12,5%"
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('avgTicket')}
            value="R$ 89,50"
            icon={<ShoppingCart />}
            trend="up"
            trendValue="+5,2%"
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('activeClients')}
            value="1.847"
            icon={<People />}
            trend="up"
            trendValue="+8,1%"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('criticalStock')}
            value="23"
            icon={<Warning />}
            trend="down"
            trendValue="+5 itens"
            color="error.main"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title={t('salesVsGoal')}
              data={salesData}
              lines={[
                { dataKey: 'vendas', name: t('sales'), color: '#2E7D32' },
                { dataKey: 'meta', name: t('goal'), color: '#ED6C02' },
              ]}
              xAxisKey="hora"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title={t('revenueByDept')}
              data={departmentRevenue}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title={t('weeklyComparison')}
              data={weeklySales}
              bars={[
                { dataKey: 'atual', name: t('currentWeek'), color: '#2E7D32' },
                { dataKey: 'anterior', name: t('prevWeek'), color: '#1565C0' },
              ]}
              xAxisKey="dia"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              {t('stockAlerts')}
            </Typography>
            <List disablePadding>
              {lowStockItems.map((item, idx) => (
                <ListItem key={idx} disableGutters sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>{item.produto}</Typography>
                    <Chip
                      label={`${item.atual} ${item.unidade}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.atual / item.minimo) * 100}
                    color="error"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              {t('lastTransactions')}
            </Typography>
            <List disablePadding>
              {[
                { tipo: 'Venda', desc: 'Venda PDV #45892', valor: 'R$ 1.247,50', horario: '18:45', status: 'concluido' },
                { tipo: 'Compra', desc: 'Pedido #1245 - Fornecedor A', valor: 'R$ 8.920,00', horario: '17:30', status: 'pendente' },
                { tipo: 'Estoque', desc: 'Entrada de mercadorias', valor: '45 itens', horario: '16:15', status: 'processando' },
                { tipo: 'RH', desc: 'Folha de pagamento', valor: 'R$ 45.000,00', horario: '14:00', status: 'aprovado' },
              ].map((mov, idx) => (
                <ListItem key={idx} divider={idx < 3} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', fontSize: 14 }}>
                      {mov.tipo.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={mov.desc}
                    secondary={mov.horario}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600}>{mov.valor}</Typography>
                    <Chip
                      label={mov.status}
                      size="small"
                      color={
                        mov.status === 'concluido' || mov.status === 'aprovado' ? 'success' :
                        mov.status === 'pendente' ? 'warning' : 'info'
                      }
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
