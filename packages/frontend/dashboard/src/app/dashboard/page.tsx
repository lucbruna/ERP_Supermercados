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
  AvatarGroup,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Warning,
  CheckCircle,
  Schedule,
  Store,
  LocalAtm,
  AccountBalance,
  Assignment,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const realTimeSales = [
  { hora: '00:00', vendas: 1240, meta: 1500 },
  { hora: '01:00', vendas: 980, meta: 1200 },
  { hora: '02:00', vendas: 650, meta: 800 },
  { hora: '03:00', vendas: 420, meta: 500 },
  { hora: '04:00', vendas: 780, meta: 1000 },
  { hora: '05:00', vendas: 2100, meta: 1800 },
  { hora: '06:00', vendas: 4500, meta: 4000 },
  { hora: '07:00', vendas: 7800, meta: 7000 },
  { hora: '08:00', vendas: 12500, meta: 11000 },
  { hora: '09:00', vendas: 16800, meta: 15000 },
  { hora: '10:00', vendas: 20500, meta: 18500 },
  { hora: '11:00', vendas: 23400, meta: 21000 },
  { hora: '12:00', vendas: 19800, meta: 19000 },
  { hora: '13:00', vendas: 18200, meta: 17500 },
  { hora: '14:00', vendas: 21500, meta: 20000 },
  { hora: '15:00', vendas: 24800, meta: 22500 },
  { hora: '16:00', vendas: 27200, meta: 25000 },
  { hora: '17:00', vendas: 29500, meta: 27000 },
  { hora: '18:00', vendas: 31200, meta: 29000 },
  { hora: '19:00', vendas: 28500, meta: 28000 },
  { hora: '20:00', vendas: 22500, meta: 22000 },
  { hora: '21:00', vendas: 15200, meta: 16000 },
  { hora: '22:00', vendas: 8900, meta: 10000 },
  { hora: '23:00', vendas: 4500, meta: 5000 },
];

const departmentRevenue = [
  { name: 'Bebidas', value: 285000 },
  { name: 'Hortifrúti', value: 235000 },
  { name: 'Açougue', value: 198000 },
  { name: 'Mercearia', value: 175000 },
  { name: 'Laticínios', value: 145000 },
  { name: 'Padaria', value: 112000 },
  { name: 'Limpeza', value: 98000 },
  { name: 'Outros', value: 152000 },
];

const monthOverMonth = [
  { mes: 'Jan', atual: 1450000, anterior: 1320000 },
  { mes: 'Fev', atual: 1380000, anterior: 1280000 },
  { mes: 'Mar', atual: 1520000, anterior: 1410000 },
  { mes: 'Abr', atual: 1480000, anterior: 1390000 },
  { mes: 'Mai', atual: 1650000, anterior: 1520000 },
  { mes: 'Jun', atual: 1720000, anterior: 1580000 },
];

const topProducts = [
  { pos: 1, produto: 'Arroz Tipo 1 5kg', categoria: 'Grãos', vendas: 12450, receita: 289450, estoque: 42 },
  { pos: 2, produto: 'Feijão Preto 1kg', categoria: 'Grãos', vendas: 10200, receita: 142800, estoque: 38 },
  { pos: 3, produto: 'Leite Integral 1L', categoria: 'Laticínios', vendas: 9850, receita: 118200, estoque: 120 },
  { pos: 4, produto: 'Óleo de Soja 900ml', categoria: 'Mercearia', vendas: 8720, receita: 104640, estoque: 25 },
  { pos: 5, produto: 'Café Torrado 500g', categoria: 'Mercearia', vendas: 7650, receita: 198900, estoque: 55 },
  { pos: 6, produto: 'Açúcar Refinado 5kg', categoria: 'Mercearia', vendas: 7120, receita: 92800, estoque: 18 },
  { pos: 7, produto: 'Carne Bovina (kg)', categoria: 'Açougue', vendas: 6580, receita: 329000, estoque: 85 },
  { pos: 8, produto: 'Refrigerante 2L', categoria: 'Bebidas', vendas: 6100, receita: 48800, estoque: 200 },
  { pos: 9, produto: 'Pão Francês (un)', categoria: 'Padaria', vendas: 5900, receita: 47200, estoque: 0 },
  { pos: 10, produto: 'Sabão em Pó 1kg', categoria: 'Limpeza', vendas: 5420, receita: 108400, estoque: 45 },
];

const cashFlow = [
  { mes: 'Jan', entrada: 1450000, saida: 1120000, projetado: 1400000 },
  { mes: 'Fev', entrada: 1380000, saida: 1080000, projetado: 1350000 },
  { mes: 'Mar', entrada: 1520000, saida: 1150000, projetado: 1480000 },
  { mes: 'Abr', entrada: 1480000, saida: 1180000, projetado: 1450000 },
  { mes: 'Mai', entrada: 1650000, saida: 1250000, projetado: 1600000 },
  { mes: 'Jun', entrada: 1720000, saida: 1300000, projetado: 1680000 },
  { mes: 'Jul', entrada: 0, saida: 0, projetado: 1750000 },
  { mes: 'Ago', entrada: 0, saida: 0, projetado: 1700000 },
];

const inventoryAlerts = [
  { produto: 'Arroz Tipo 1 5kg', atual: 42, minimo: 50, status: 'alerta' },
  { produto: 'Feijão Preto 1kg', atual: 38, minimo: 40, status: 'alerta' },
  { produto: 'Óleo de Soja 900ml', atual: 25, minimo: 60, status: 'critico' },
  { produto: 'Açúcar Refinado 5kg', atual: 18, minimo: 30, status: 'critico' },
  { produto: 'Café Torrado 500g', atual: 55, minimo: 30, status: 'normal' },
];

const attendanceSummary = {
  presente: 118,
  ausente: 5,
  ferias: 3,
  atrasado: 2,
};

const storePerformance = [
  { loja: 'Matriz Centro', vendasHoje: 42300, meta: 45000, clientes: 512, ticket: 82.62 },
  { loja: 'Filial Norte', vendasHoje: 28500, meta: 30000, clientes: 345, ticket: 82.61 },
  { loja: 'Filial Sul', vendasHoje: 35600, meta: 35000, clientes: 428, ticket: 83.18 },
  { loja: 'Filial Leste', vendasHoje: 19800, meta: 25000, clientes: 245, ticket: 80.82 },
  { loja: 'Filial Oeste', vendasHoje: 31200, meta: 32000, clientes: 380, ticket: 82.11 },
];

export default function ExecutiveDashboardPage() {
  const t = useTranslations('dashboard');

  const topProductColumns = [
    { id: 'pos', label: t('#'), minWidth: 30 },
    { id: 'produto', label: t('product'), minWidth: 180 },
    { id: 'categoria', label: t('category'), minWidth: 100 },
    { id: 'vendas', label: t('qtySold'), minWidth: 100, format: (v: unknown) => Number(v).toLocaleString('pt-BR') },
    { id: 'receita', label: t('revenue'), minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { id: 'estoque', label: t('stock'), minWidth: 80, format: (v: unknown) => {
      const val = Number(v);
      return (
        <Chip
          label={val === 0 ? t('outOfStock') : String(val)}
          size="small"
          color={val === 0 ? 'error' : val < 30 ? 'warning' : 'success'}
          variant="outlined"
        />
      );
    }},
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title={t('salesToday')} value="R$ 152,4K" icon={<TrendingUp />} trend="up" trendValue="+12,5%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title={t('avgTicket')} value="R$ 89,50" icon={<ShoppingCart />} trend="up" trendValue="+5,2%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title={t('clientsToday')} value="1.910" icon={<People />} trend="up" trendValue="+8,1%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title={t('netProfit')} value="R$ 42,8K" icon={<AttachMoney />} trend="up" trendValue="+15,3%" color="success.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title={t('realTimeSales24h')}
              data={realTimeSales}
              lines={[
                { dataKey: 'vendas', name: t('actualSales'), color: '#2E7D32' },
                { dataKey: 'meta', name: t('hourlyGoal'), color: '#ED6C02' },
              ]}
              xAxisKey="hora"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title={t('revenueByDept')}
              data={departmentRevenue}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title={t('monthComparison')}
              data={monthOverMonth}
              bars={[
                { dataKey: 'atual', name: t('currentYear'), color: '#2E7D32' },
                { dataKey: 'anterior', name: t('prevYear'), color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title={t('cashFlowProjection')}
              data={cashFlow}
              lines={[
                { dataKey: 'entrada', name: t('inflows'), color: '#2E7D32' },
                { dataKey: 'saida', name: t('outflows'), color: '#D32F2F' },
                { dataKey: 'projetado', name: t('projected'), color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <DataTable
            title={t('topProducts')}
            columns={topProductColumns}
            rows={topProducts as unknown as Record<string, unknown>[]}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" /> {t('inventoryAlerts')}
            </Typography>
            {inventoryAlerts.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>{item.produto}</Typography>
                  <StatusBadge status={item.status} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{t('current')}: {item.atual}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('minimum')}: {item.minimo}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (item.atual / item.minimo) * 100)}
                  color={item.status === 'critico' ? 'error' : item.status === 'alerta' ? 'warning' : 'success'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <People color="primary" /> {t('attendanceSummary')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>{attendanceSummary.presente}</Typography>
                  <Typography variant="caption">{t('present')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'error.light', borderRadius: 2, color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>{attendanceSummary.ausente}</Typography>
                  <Typography variant="caption">{t('absent')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'info.light', borderRadius: 2, color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>{attendanceSummary.ferias}</Typography>
                  <Typography variant="caption">{t('vacation')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'warning.light', borderRadius: 2, color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>{attendanceSummary.atrasado}</Typography>
                  <Typography variant="caption">{t('late')}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store color="primary" /> {t('storePerformance')}
            </Typography>
            <Grid container spacing={2}>
              {storePerformance.map((loja, idx) => {
                const metaPercent = (loja.vendasHoje / loja.meta) * 100;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={idx}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{loja.loja}</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{t('goal')}: {Math.round(metaPercent)}%</Typography>
                          <Typography variant="caption" color={metaPercent >= 100 ? 'success.main' : 'warning.main'} fontWeight={600}>
                            {metaPercent >= 100 ? t('reached') : `${Math.round(metaPercent)}%`}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, metaPercent)}
                          color={metaPercent >= 100 ? 'success' : 'primary'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        R$ {loja.vendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loja.clientes} {t('customers')} | {t('ticket')} R$ {loja.ticket.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
