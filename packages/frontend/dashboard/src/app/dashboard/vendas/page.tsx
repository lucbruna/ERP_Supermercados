'use client';

import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, ShoppingCart, People, AttachMoney, CreditCard, Receipt, AccountBalance } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';

const dailySales30 = [
  { dia: '20/05', vendas: 45200, meta: 48000 }, { dia: '21/05', vendas: 48800, meta: 48000 },
  { dia: '22/05', vendas: 51200, meta: 50000 }, { dia: '23/05', vendas: 47500, meta: 48000 },
  { dia: '24/05', vendas: 39800, meta: 42000 }, { dia: '25/05', vendas: 42300, meta: 45000 },
  { dia: '26/05', vendas: 46500, meta: 47000 }, { dia: '27/05', vendas: 50200, meta: 49000 },
  { dia: '28/05', vendas: 53400, meta: 51000 }, { dia: '29/05', vendas: 49800, meta: 50000 },
  { dia: '30/05', vendas: 47200, meta: 48000 }, { dia: '31/05', vendas: 44500, meta: 46000 },
  { dia: '01/06', vendas: 41800, meta: 44000 }, { dia: '02/06', vendas: 46200, meta: 46000 },
  { dia: '03/06', vendas: 50500, meta: 49000 }, { dia: '04/06', vendas: 52800, meta: 51000 },
  { dia: '05/06', vendas: 49500, meta: 50000 }, { dia: '06/06', vendas: 51200, meta: 50000 },
  { dia: '07/06', vendas: 47800, meta: 48000 }, { dia: '08/06', vendas: 43500, meta: 45000 },
  { dia: '09/06', vendas: 48900, meta: 48000 }, { dia: '10/06', vendas: 52100, meta: 51000 },
  { dia: '11/06', vendas: 55800, meta: 53000 }, { dia: '12/06', vendas: 54200, meta: 52000 },
  { dia: '13/06', vendas: 51000, meta: 50000 }, { dia: '14/06', vendas: 48200, meta: 49000 },
  { dia: '15/06', vendas: 46100, meta: 47000 }, { dia: '16/06', vendas: 52300, meta: 51000 },
  { dia: '17/06', vendas: 55600, meta: 53000 }, { dia: '18/06', vendas: 53400, meta: 52000 },
];

const paymentMethods = [
  { name: 'Cartão Crédito', value: 425000 },
  { name: 'Cartão Débito', value: 285000 },
  { name: 'PIX', value: 356000 },
  { name: 'Dinheiro', value: 142000 },
  { name: 'Vale Alimentação', value: 98000 },
  { name: 'Outros', value: 45000 },
];

const salesByCategory = [
  { categoria: 'Bebidas', vendas: 285000, meta: 260000 },
  { categoria: 'Hortifrúti', vendas: 235000, meta: 220000 },
  { categoria: 'Açougue', vendas: 198000, meta: 210000 },
  { categoria: 'Mercearia', vendas: 175000, meta: 180000 },
  { categoria: 'Laticínios', vendas: 145000, meta: 140000 },
  { categoria: 'Padaria', vendas: 112000, meta: 110000 },
  { categoria: 'Limpeza', vendas: 98000, meta: 105000 },
  { categoria: 'Higiene', vendas: 85000, meta: 80000 },
];

const topProducts = [
  { pos: 1, produto: 'Arroz Tipo 1 5kg', qtd: 1245, valor: 28450, categoria: 'Grãos' },
  { pos: 2, produto: 'Feijão Preto 1kg', qtd: 1020, valor: 14280, categoria: 'Grãos' },
  { pos: 3, produto: 'Leite Integral 1L', qtd: 985, valor: 11820, categoria: 'Laticínios' },
  { pos: 4, produto: 'Óleo de Soja 900ml', qtd: 872, valor: 10464, categoria: 'Mercearia' },
  { pos: 5, produto: 'Café Torrado 500g', qtd: 765, valor: 19890, categoria: 'Mercearia' },
  { pos: 6, produto: 'Açúcar Refinado 5kg', qtd: 712, valor: 9280, categoria: 'Mercearia' },
  { pos: 7, produto: 'Carne Bovina (kg)', qtd: 658, valor: 32900, categoria: 'Açougue' },
  { pos: 8, produto: 'Refrigerante 2L', qtd: 610, valor: 4880, categoria: 'Bebidas' },
  { pos: 9, produto: 'Pão Francês (un)', qtd: 590, valor: 4720, categoria: 'Padaria' },
  { pos: 10, produto: 'Sabão em Pó 1kg', qtd: 542, valor: 10840, categoria: 'Limpeza' },
];

const topProductColumns = [
  { id: 'pos', label: '#', minWidth: 30 },
  { id: 'produto', label: 'Produto', minWidth: 180 },
  { id: 'categoria', label: 'Categoria', minWidth: 100 },
  { id: 'qtd', label: 'Qtd Vendida', minWidth: 100, format: (v: unknown) => Number(v).toLocaleString('pt-BR') },
  { id: 'valor', label: 'Valor Total', minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
];

export default function VendasPage() {
  const totalVendasMes = dailySales30.reduce((a, b) => a + b.vendas, 0);
  const vendasHoje = dailySales30[dailySales30.length - 1].vendas;
  const ticketMedio = Math.round(vendasHoje / 520);
  const totalPayment = paymentMethods.reduce((a, b) => a + b.value, 0);
  const mesAnterior = 1480000;
  const variacaoPct = ((totalVendasMes - mesAnterior) / mesAnterior * 100).toFixed(1);
  const isUp = Number(variacaoPct) >= 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard de Vendas</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Vendas Hoje" value={`R$ ${(vendasHoje / 1000).toFixed(1)}K`} icon={<TrendingUp />} trend="up" trendValue="+12,5%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Vendas Mês" value={`R$ ${(totalVendasMes / 1000).toFixed(1)}K`} icon={<ShoppingCart />} trend={isUp ? 'up' : 'down'} trendValue={`${isUp ? '+' : ''}${variacaoPct}%`} color="primary.main" comparisonText="vs. mês anterior" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ticket Médio" value={`R$ ${ticketMedio.toFixed(2)}`} icon={<AttachMoney />} trend="up" trendValue="+5,2%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Qtde Clientes" value="1.910" icon={<People />} trend="up" trendValue="+8,1%" color="secondary.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Vendas por Dia (Últimos 30 Dias)"
              data={dailySales30 as unknown as Record<string, unknown>[]}
              lines={[
                { dataKey: 'vendas', name: 'Vendas', color: '#2E7D32' },
                { dataKey: 'meta', name: 'Meta', color: '#ED6C02' },
              ]}
              xAxisKey="dia"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Vendas por Forma de Pagamento"
              data={paymentMethods}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Vendas por Categoria de Produto"
              data={salesByCategory as unknown as Record<string, unknown>[]}
              bars={[
                { dataKey: 'vendas', name: 'Vendas', color: '#2E7D32' },
                { dataKey: 'meta', name: 'Meta', color: '#ED6C02' },
              ]}
              xAxisKey="categoria"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance /> Métodos de Pagamento
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {paymentMethods.map((pm, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {idx === 0 ? <CreditCard fontSize="small" /> : idx === 1 ? <CreditCard fontSize="small" /> : idx === 2 ? <AttachMoney fontSize="small" /> : <Receipt fontSize="small" />}
                    <Typography variant="body2">{pm.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600}>R$ {(pm.value / 1000).toFixed(1)}K</Typography>
                    <Chip label={`${((pm.value / totalPayment) * 100).toFixed(0)}%`} size="small" variant="outlined" sx={{ height: 20 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Top 10 Produtos Mais Vendidos"
            columns={topProductColumns}
            rows={topProducts as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
