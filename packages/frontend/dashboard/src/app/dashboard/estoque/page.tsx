'use client';

import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material';
import { Inventory, Warning, CheckCircle, TrendingUp, Category } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const stockABC = [
  { categoria: 'A (Alto Giro)', itens: 45, valorTotal: 892000, giro: 8.2 },
  { categoria: 'B (Médio Giro)', itens: 82, valorTotal: 425000, giro: 4.5 },
  { categoria: 'C (Baixo Giro)', itens: 156, valorTotal: 158000, giro: 1.8 },
];

const stockAlerts = [
  { produto: 'Arroz Tipo 1 5kg', codigo: 'ARZ001', atual: 42, minimo: 50, status: 'alerta', fornecedor: 'Distribuidora ABC' },
  { produto: 'Feijão Preto 1kg', codigo: 'FEJ002', atual: 38, minimo: 40, status: 'alerta', fornecedor: 'Grãos Brasil' },
  { produto: 'Óleo de Soja 900ml', codigo: 'OLE003', atual: 25, minimo: 60, status: 'critico', fornecedor: 'Óleos União' },
  { produto: 'Açúcar Refinado 5kg', codigo: 'ACU004', atual: 18, minimo: 30, status: 'critico', fornecedor: 'Usina Doce' },
  { produto: 'Café Torrado 500g', codigo: 'CAF005', atual: 55, minimo: 30, status: 'normal', fornecedor: 'Café Brasil' },
  { produto: 'Leite Integral 1L', codigo: 'LEI006', atual: 22, minimo: 40, status: 'alerta', fornecedor: 'Laticínios MG' },
  { produto: 'Sabão em Pó 1kg', codigo: 'SAB007', atual: 45, minimo: 35, status: 'normal', fornecedor: 'Limpax' },
  { produto: 'Refrigerante 2L', codigo: 'REF008', atual: 12, minimo: 50, status: 'critico', fornecedor: 'Bebidas Geladas' },
];

const stockByCategory = [
  { categoria: 'Grãos', valor: 185000, qtd: 1200 },
  { categoria: 'Bebidas', valor: 165000, qtd: 2800 },
  { categoria: 'Laticínios', valor: 95000, qtd: 850 },
  { categoria: 'Limpeza', valor: 72000, qtd: 620 },
  { categoria: 'Padaria', valor: 45000, qtd: 350 },
  { categoria: 'Açougue', valor: 88000, qtd: 420 },
  { categoria: 'Hortifrúti', valor: 35000, qtd: 280 },
  { categoria: 'Mercearia', valor: 125000, qtd: 950 },
];

const stockColumns = [
  { id: 'produto', label: 'Produto', minWidth: 180 },
  { id: 'codigo', label: 'Código', minWidth: 90 },
  { id: 'atual', label: 'Estoque Atual', minWidth: 100 },
  { id: 'minimo', label: 'Mínimo', minWidth: 70 },
  { id: 'status', label: 'Status', minWidth: 90, format: (v: unknown) => <StatusBadge status={String(v)} /> },
  { id: 'fornecedor', label: 'Fornecedor', minWidth: 150 },
];

const totalItems = stockByCategory.reduce((a, b) => a + b.qtd, 0);
const totalValor = stockByCategory.reduce((a, b) => a + b.valor, 0);
const alertCount = stockAlerts.filter((s) => s.status !== 'normal').length;

export default function EstoquePage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Estoque</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Itens" value={totalItems.toLocaleString('pt-BR')} icon={<Inventory />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Valor em Estoque" value={`R$ ${(totalValor / 1000).toFixed(1)}K`} icon={<TrendingUp />} trend="up" trendValue="+3,4%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Alertas" value={alertCount} icon={<Warning />} trend="up" trendValue="+2" color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Giro Médio" value="4,8x" icon={<Category />} trend="up" trendValue="+0,3x" color="info.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Estoque por Categoria (Valor R$)"
              data={stockByCategory}
              bars={[
                { dataKey: 'valor', name: 'Valor (R$)', color: '#2E7D32' },
              ]}
              xAxisKey="categoria"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Curva ABC"
              data={stockABC.map((a) => ({ name: a.categoria, value: a.valorTotal }))}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" /> Alertas de Estoque
            </Typography>
            {stockAlerts.filter((s) => s.status !== 'normal').slice(0, 6).map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>{item.produto}</Typography>
                  <StatusBadge status={item.status} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Atual: {item.atual}</Typography>
                  <Typography variant="caption" color="text.secondary">Mínimo: {item.minimo}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (item.atual / item.minimo) * 100)}
                  color={item.status === 'critico' ? 'error' : 'warning'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" /> Curva ABC - Detalhamento
            </Typography>
            {stockABC.map((cat, idx) => (
              <Box key={idx} sx={{ p: 2, mb: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{cat.categoria}</Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    R$ {(cat.valorTotal / 1000).toFixed(1)}K
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{cat.itens} itens</Typography>
                  <Typography variant="caption">Giro: {cat.giro}x</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(cat.valorTotal / totalValor) * 100}
                  color={idx === 0 ? 'success' : idx === 1 ? 'info' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {((cat.valorTotal / totalValor) * 100).toFixed(1)}% do valor total
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Produtos em Estoque"
            columns={stockColumns}
            rows={stockAlerts as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
