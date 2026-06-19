'use client';

import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { AttachMoney, TrendingUp, TrendingDown, AccountBalance, Receipt, CheckCircle, Warning } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const revenueData = [
  { mes: 'Jan', receita: 1450000, despesa: 1120000, margem: 330000 },
  { mes: 'Fev', receita: 1380000, despesa: 1080000, margem: 300000 },
  { mes: 'Mar', receita: 1520000, despesa: 1150000, margem: 370000 },
  { mes: 'Abr', receita: 1480000, despesa: 1180000, margem: 300000 },
  { mes: 'Mai', receita: 1650000, despesa: 1250000, margem: 400000 },
  { mes: 'Jun', receita: 1720000, despesa: 1300000, margem: 420000 },
];

const expenseCategories = [
  { name: 'Folha Pagamento', value: 415000 },
  { name: 'Fornecedores', value: 520000 },
  { name: 'Impostos', value: 185000 },
  { name: 'Energia/Água', value: 65000 },
  { name: 'Aluguel', value: 80000 },
  { name: 'Marketing', value: 25000 },
  { name: 'Manutenção', value: 35000 },
  { name: 'Outros', value: 25000 },
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

const transactions = [
  { data: '15/06', descricao: 'Pagamento Fornecedor - Distribuidora ABC', valor: 45200, tipo: 'saida', status: 'pago' },
  { data: '15/06', descricao: 'Recebimento - Vendas Matriz', valor: 128500, tipo: 'entrada', status: 'concluido' },
  { data: '14/06', descricao: 'Conta de Energia', valor: 12500, tipo: 'saida', status: 'pago' },
  { data: '14/06', descricao: 'Recebimento - Filial Norte', valor: 85200, tipo: 'entrada', status: 'concluido' },
  { data: '13/06', descricao: 'Folha de Pagamento', valor: 298000, tipo: 'saida', status: 'pago' },
  { data: '13/06', descricao: 'Recebimento - Filial Sul', valor: 102300, tipo: 'entrada', status: 'pendente' },
  { data: '12/06', descricao: 'Aluguel Galpão Matriz', valor: 45000, tipo: 'saida', status: 'pago' },
  { data: '12/06', descricao: 'Recebimento - Filial Leste', valor: 62100, tipo: 'entrada', status: 'concluido' },
];

const transactionColumns = [
  { id: 'data', label: 'Data', minWidth: 90 },
  { id: 'descricao', label: 'Descrição', minWidth: 250 },
  { id: 'valor', label: 'Valor', minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'tipo', label: 'Tipo', minWidth: 80, format: (v: unknown) => {
    const t = String(v);
    return <Chip label={t === 'entrada' ? 'Entrada' : 'Saída'} size="small" color={t === 'entrada' ? 'success' : 'error'} variant="outlined" />;
  }},
  { id: 'status', label: 'Status', minWidth: 100, format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function FinanceiroPage() {
  const last = revenueData[revenueData.length - 1];
  const totalDespesas = expenseCategories.reduce((a, b) => a + b.value, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Financeiro</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Receita Mensal" value={`R$ ${(last.receita / 1000).toFixed(1)}K`} icon={<TrendingUp />} trend="up" trendValue="+4,2%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Despesas" value={`R$ ${(last.despesa / 1000).toFixed(1)}K`} icon={<TrendingDown />} trend="down" trendValue="-2,1%" color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Margem Líquida" value={`R$ ${(last.margem / 1000).toFixed(1)}K`} icon={<AccountBalance />} trend="up" trendValue="+5,0%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Margem %" value={`${((last.margem / last.receita) * 100).toFixed(1)}%`} icon={<AttachMoney />} trend="up" trendValue="+1,2pp" color="info.main" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Receita x Despesa (Últimos 6 Meses)"
              data={revenueData}
              lines={[
                { dataKey: 'receita', name: 'Receita', color: '#2E7D32' },
                { dataKey: 'despesa', name: 'Despesa', color: '#D32F2F' },
                { dataKey: 'margem', name: 'Margem', color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Composição de Despesas"
              data={expenseCategories}
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Fluxo de Caixa (Real x Projetado)"
              data={cashFlow}
              lines={[
                { dataKey: 'entrada', name: 'Entradas', color: '#2E7D32' },
                { dataKey: 'saida', name: 'Saídas', color: '#D32F2F' },
                { dataKey: 'projetado', name: 'Projetado', color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt /> Resumo de Despesas
            </Typography>
            <List dense>
              {expenseCategories.map((cat, i) => (
                <ListItem key={i} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><AttachMoney fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={cat.name} secondary={`R$ ${cat.value.toLocaleString('pt-BR')}`} />
                  <Chip label={`${((cat.value / totalDespesas) * 100).toFixed(0)}%`} size="small" variant="outlined" />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={600}>R$ {totalDespesas.toLocaleString('pt-BR')}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <DataTable
            title="Últimas Movimentações"
            columns={transactionColumns}
            rows={transactions as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
