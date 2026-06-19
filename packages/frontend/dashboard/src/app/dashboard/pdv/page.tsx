'use client';

import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { TrendingUp, ShoppingCart, People, AttachMoney, PointOfSale } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';

const hourlySales = [
  { hora: '06h', vendas: 1200, ticket: 45.2 },
  { hora: '07h', vendas: 3400, ticket: 52.8 },
  { hora: '08h', vendas: 6800, ticket: 61.5 },
  { hora: '09h', vendas: 10200, ticket: 68.3 },
  { hora: '10h', vendas: 14500, ticket: 72.1 },
  { hora: '11h', vendas: 18200, ticket: 74.6 },
  { hora: '12h', vendas: 21500, ticket: 78.2 },
  { hora: '13h', vendas: 19800, ticket: 76.8 },
  { hora: '14h', vendas: 16200, ticket: 71.4 },
  { hora: '15h', vendas: 20500, ticket: 75.9 },
  { hora: '16h', vendas: 24800, ticket: 80.3 },
  { hora: '17h', vendas: 27500, ticket: 82.5 },
  { hora: '18h', vendas: 29200, ticket: 85.1 },
  { hora: '19h', vendas: 25800, ticket: 81.7 },
  { hora: '20h', vendas: 18200, ticket: 73.4 },
  { hora: '21h', vendas: 9500, ticket: 62.8 },
  { hora: '22h', vendas: 4200, ticket: 51.3 },
];

const paymentMethods = [
  { name: 'Cartão Crédito', value: 42 },
  { name: 'Cartão Débito', value: 28 },
  { name: 'Dinheiro', value: 15 },
  { name: 'PIX', value: 12 },
  { name: 'Vale Alimentação', value: 3 },
];

const salesByCategory = [
  { categoria: 'Bebidas', faturamento: 285000, qtd: 12450 },
  { categoria: 'Hortifrúti', faturamento: 235000, qtd: 8900 },
  { categoria: 'Açougue', faturamento: 198000, qtd: 5200 },
  { categoria: 'Mercearia', faturamento: 175000, qtd: 11200 },
  { categoria: 'Laticínios', faturamento: 145000, qtd: 7800 },
  { categoria: 'Padaria', faturamento: 112000, qtd: 15400 },
  { categoria: 'Limpeza', faturamento: 98000, qtd: 6300 },
];

const lastSales = [
  { hora: '18:45', valor: 156.80, itens: 8, cliente: 'João P.', forma: 'Crédito' },
  { hora: '18:42', valor: 89.50, itens: 4, cliente: 'Maria S.', forma: 'PIX' },
  { hora: '18:38', valor: 234.90, itens: 12, cliente: 'Pedro A.', forma: 'Débito' },
  { hora: '18:35', valor: 45.00, itens: 2, cliente: 'Ana C.', forma: 'Dinheiro' },
  { hora: '18:30', valor: 312.40, itens: 18, cliente: 'Lucas M.', forma: 'Crédito' },
  { hora: '18:25', valor: 67.80, itens: 3, cliente: 'Carla F.', forma: 'PIX' },
  { hora: '18:20', valor: 178.20, itens: 9, cliente: 'Roberto L.', forma: 'Débito' },
  { hora: '18:15', valor: 95.30, itens: 5, cliente: 'Juliana D.', forma: 'Crédito' },
];

const salesColumns = [
  { id: 'hora', label: 'Hora', minWidth: 70 },
  { id: 'valor', label: 'Valor', minWidth: 100, format: (v: unknown) => `R$ ${Number(v).toFixed(2)}` },
  { id: 'itens', label: 'Itens', minWidth: 60 },
  { id: 'cliente', label: 'Cliente', minWidth: 120 },
  { id: 'forma', label: 'Forma Pagto', minWidth: 110 },
];

export default function PDVPage() {
  const todayTotal = hourlySales.reduce((a, b) => a + b.vendas, 0);
  const avgTicket = hourlySales.reduce((a, b) => a + b.ticket, 0) / hourlySales.length;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard PDV</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Vendas Hoje" value={`R$ ${(todayTotal / 1000).toFixed(1)}K`} icon={<TrendingUp />} trend="up" trendValue="+11,3%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ticket Médio" value={`R$ ${avgTicket.toFixed(2)}`} icon={<ShoppingCart />} trend="up" trendValue="+3,8%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Clientes Atendidos" value="1.847" icon={<People />} trend="up" trendValue="+7,2%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Faturamento /h" value={`R$ ${(todayTotal / 17 / 1000).toFixed(1)}K`} icon={<PointOfSale />} trend="up" trendValue="+5,6%" color="secondary.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Vendas por Hora (Hoje)"
              data={hourlySales}
              lines={[
                { dataKey: 'vendas', name: 'Vendas (R$)', color: '#2E7D32' },
              ]}
              xAxisKey="hora"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Formas de Pagamento"
              data={paymentMethods}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Faturamento por Categoria"
              data={salesByCategory}
              bars={[
                { dataKey: 'faturamento', name: 'Faturamento', color: '#2E7D32' },
              ]}
              xAxisKey="categoria"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney color="primary" /> Resumo de Métricas
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="caption">Produtos por venda</Typography>
              <Typography variant="h5" fontWeight={700}>7,3</Typography>
            </Box>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="caption">Cancelamentos (%)</Typography>
              <Typography variant="h5" fontWeight={700}>2,1%</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="caption">Tempo médio (min)</Typography>
              <Typography variant="h5" fontWeight={700}>4,5</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Últimas Vendas"
            columns={salesColumns}
            rows={lastSales as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
