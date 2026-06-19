'use client';

import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { ShoppingCart, Pending, CheckCircle, Schedule, TrendingUp } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const pendingOrders = [
  { pedido: 'PO-2024-0158', fornecedor: 'Distribuidora ABC', valor: 45200, data: '18/06', previsao: '25/06', status: 'pendente' },
  { pedido: 'PO-2024-0159', fornecedor: 'Grãos Brasil', valor: 28500, data: '17/06', previsao: '24/06', status: 'processando' },
  { pedido: 'PO-2024-0160', fornecedor: 'Laticínios MG', valor: 19200, data: '17/06', previsao: '23/06', status: 'pendente' },
  { pedido: 'PO-2024-0161', fornecedor: 'Bebidas Geladas', valor: 38400, data: '16/06', previsao: '22/06', status: 'aprovado' },
  { pedido: 'PO-2024-0162', fornecedor: 'Limpax', valor: 12500, data: '16/06', previsao: '21/06', status: 'processando' },
  { pedido: 'PO-2024-0163', fornecedor: 'Usina Doce', valor: 22100, data: '15/06', previsao: '20/06', status: 'pendente' },
  { pedido: 'PO-2024-0164', fornecedor: 'Café Brasil', valor: 15800, data: '15/06', previsao: '19/06', status: 'concluido' },
  { pedido: 'PO-2024-0165', fornecedor: 'Óleos União', valor: 9800, data: '14/06', previsao: '18/06', status: 'concluido' },
];

const supplierPerformance = [
  { fornecedor: 'Distribuidora ABC', pedidos: 42, valorTotal: 385000, prazoMedio: 4.2, confiabilidade: 95 },
  { fornecedor: 'Grãos Brasil', pedidos: 28, valorTotal: 198000, prazoMedio: 3.8, confiabilidade: 98 },
  { fornecedor: 'Laticínios MG', pedidos: 35, valorTotal: 215000, prazoMedio: 2.5, confiabilidade: 100 },
  { fornecedor: 'Bebidas Geladas', pedidos: 22, valorTotal: 312000, prazoMedio: 5.1, confiabilidade: 88 },
  { fornecedor: 'Limpax', pedidos: 18, valorTotal: 95000, prazoMedio: 3.2, confiabilidade: 92 },
  { fornecedor: 'Usina Doce', pedidos: 15, valorTotal: 142000, prazoMedio: 4.0, confiabilidade: 90 },
  { fornecedor: 'Café Brasil', pedidos: 12, valorTotal: 88000, prazoMedio: 3.0, confiabilidade: 96 },
  { fornecedor: 'Óleos União', pedidos: 10, valorTotal: 72000, prazoMedio: 6.0, confiabilidade: 82 },
];

const monthlyOrders = [
  { mes: 'Jan', pedidos: 22, valorGasto: 185000 },
  { mes: 'Fev', pedidos: 18, valorGasto: 158000 },
  { mes: 'Mar', pedidos: 25, valorGasto: 212000 },
  { mes: 'Abr', pedidos: 20, valorGasto: 178000 },
  { mes: 'Mai', pedidos: 28, valorGasto: 235000 },
  { mes: 'Jun', pedidos: 24, valorGasto: 198000 },
];

const ordersColumns = [
  { id: 'pedido', label: 'Pedido', minWidth: 130 },
  { id: 'fornecedor', label: 'Fornecedor', minWidth: 160 },
  { id: 'valor', label: 'Valor', minWidth: 110, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'data', label: 'Data', minWidth: 80 },
  { id: 'previsao', label: 'Previsão', minWidth: 80 },
  { id: 'status', label: 'Status', minWidth: 100, format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const supplierColumns = [
  { id: 'fornecedor', label: 'Fornecedor', minWidth: 160 },
  { id: 'pedidos', label: 'Pedidos', minWidth: 80 },
  { id: 'valorTotal', label: 'Valor Total', minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'prazoMedio', label: 'Prazo (dias)', minWidth: 90 },
  { id: 'confiabilidade', label: 'Confiabilidade', minWidth: 110, format: (v: unknown) => {
    const val = Number(v);
    return <Chip label={`${val}%`} size="small" color={val >= 95 ? 'success' : val >= 85 ? 'warning' : 'error'} variant="outlined" />;
  }},
];

export default function ComprasPage() {
  const totalPending = pendingOrders.filter((o) => o.status === 'pendente' || o.status === 'processando').length;
  const totalComprasMes = monthlyOrders[monthlyOrders.length - 1];
  const totalFornecedores = supplierPerformance.length;
  const prazoMedio = supplierPerformance.reduce((a, b) => a + b.prazoMedio, 0) / totalFornecedores;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Compras</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pedidos Pendentes" value={totalPending} icon={<Pending />} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Compras no Mês" value={`R$ ${(totalComprasMes.valorGasto / 1000).toFixed(1)}K`} icon={<ShoppingCart />} trend="up" trendValue="+4,8%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Fornecedores" value={totalFornecedores} icon={<CheckCircle />} trend="up" trendValue="+2" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Prazo Médio" value={`${prazoMedio.toFixed(1)} dias`} icon={<Schedule />} trend="down" trendValue="-0,3d" color="info.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Compras Mensais (Valor Gasto)"
              data={monthlyOrders}
              bars={[
                { dataKey: 'valorGasto', name: 'Valor Gasto', color: '#2E7D32' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Volume por Fornecedor"
              data={supplierPerformance.slice(0, 6).map((s) => ({ name: s.fornecedor.split(' ')[0], value: s.valorTotal }))}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Pedidos de Compra"
            columns={ordersColumns}
            rows={pendingOrders as unknown as Record<string, unknown>[]}
          />
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Performance de Fornecedores"
            columns={supplierColumns}
            rows={supplierPerformance as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
