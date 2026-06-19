'use client';

import { Box, Grid, Paper, Typography, Chip, Avatar, AvatarGroup, Rating } from '@mui/material';
import { Group, TrendingUp, PersonAdd, Star, Loyalty } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const customerAcquisition = [
  { mes: 'Jan', novos: 320, ativos: 2450, churn: 2.1 },
  { mes: 'Fev', novos: 285, ativos: 2520, churn: 1.8 },
  { mes: 'Mar', novos: 350, ativos: 2650, churn: 1.5 },
  { mes: 'Abr', novos: 310, ativos: 2740, churn: 1.9 },
  { mes: 'Mai', novos: 380, ativos: 2890, churn: 1.3 },
  { mes: 'Jun', novos: 420, ativos: 3080, churn: 1.1 },
];

const loyaltyTiers = [
  { name: 'Diamante', value: 180 },
  { name: 'Ouro', value: 420 },
  { name: 'Prata', value: 850 },
  { name: 'Bronze', value: 1630 },
];

const topCustomers = [
  { nome: 'Supermercado Silva', cidade: 'São Paulo', compras: 52, totalGasto: 425000, ultimaCompra: '15/06', status: 'ativo' },
  { nome: 'Mercado Oliveira', cidade: 'Campinas', compras: 38, totalGasto: 312000, ultimaCompra: '14/06', status: 'ativo' },
  { nome: 'Adega Santos', cidade: 'São Bernardo', compras: 45, totalGasto: 289000, ultimaCompra: '13/06', status: 'ativo' },
  { nome: 'Empório Lima', cidade: 'Santos', compras: 28, totalGasto: 198000, ultimaCompra: '12/06', status: 'ativo' },
  { nome: 'Mercado Costa', cidade: 'Osasco', compras: 35, totalGasto: 245000, ultimaCompra: '10/06', status: 'inativo' },
  { nome: 'Comercial Dias', cidade: 'Guarulhos', compras: 22, totalGasto: 156000, ultimaCompra: '08/06', status: 'ativo' },
  { nome: 'Sacolão Mendes', cidade: 'Santo André', compras: 18, totalGasto: 112000, ultimaCompra: '05/06', status: 'ativo' },
  { nome: 'Mercado Souza', cidade: 'Sorocaba', compras: 15, totalGasto: 98500, ultimaCompra: '03/06', status: 'pendente' },
];

const satisfactionByCategory = [
  { categoria: 'Atendimento', nota: 4.5 },
  { categoria: 'Qualidade', nota: 4.2 },
  { categoria: 'Preço', nota: 3.8 },
  { categoria: 'Variedade', nota: 4.0 },
  { categoria: 'Limpeza', nota: 4.6 },
  { categoria: 'Agilidade', nota: 3.9 },
];

const customerColumns = [
  { id: 'nome', label: 'Cliente', minWidth: 180 },
  { id: 'cidade', label: 'Cidade', minWidth: 120 },
  { id: 'compras', label: 'Compras', minWidth: 80 },
  { id: 'totalGasto', label: 'Total Gasto', minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'ultimaCompra', label: 'Última Compra', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 90, format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function CRMPage() {
  const lastMonth = customerAcquisition[customerAcquisition.length - 1];
  const totalClientes = lastMonth.ativos;
  const totalLoyalty = loyaltyTiers.reduce((a, b) => a + b.value, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard CRM</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Clientes Ativos" value={totalClientes.toLocaleString('pt-BR')} icon={<Group />} trend="up" trendValue="+6,6%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Novos no Mês" value={lastMonth.novos} icon={<PersonAdd />} trend="up" trendValue="+10,5%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Churn Rate" value={`${lastMonth.churn}%`} icon={<TrendingUp />} trend="down" trendValue="-0,2pp" color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Programa Fidelidade" value={totalLoyalty} icon={<Loyalty />} trend="up" trendValue="+5,8%" color="info.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Aquisição x Base Ativa"
              data={customerAcquisition}
              lines={[
                { dataKey: 'novos', name: 'Novos Clientes', color: '#2E7D32' },
                { dataKey: 'ativos', name: 'Base Ativa', color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Programa de Fidelidade"
              data={loyaltyTiers}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Satisfação por Categoria"
              data={satisfactionByCategory}
              bars={[
                { dataKey: 'nota', name: 'Nota (0-5)', color: '#2E7D32' },
              ]}
              xAxisKey="categoria"
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color="warning" /> Score de Satisfação
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h2" fontWeight={700} color="warning.main">4,2</Typography>
              <Rating value={4.2} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">Média geral de 1.247 avaliações</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {satisfactionByCategory.map((cat, i) => (
                <Chip
                  key={i}
                  label={`${cat.categoria}: ${cat.nota}`}
                  color={cat.nota >= 4 ? 'success' : cat.nota >= 3.5 ? 'warning' : 'error'}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Top Clientes"
            columns={customerColumns}
            rows={topCustomers as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
