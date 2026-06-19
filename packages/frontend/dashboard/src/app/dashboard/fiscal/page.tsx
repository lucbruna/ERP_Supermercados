'use client';

import { Box, Grid, Paper, Typography, Alert, AlertTitle, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Receipt, TrendingUp, TrendingDown, AccountBalance, Warning, CheckCircle, Schedule, AttachMoney } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const nfeStatusData = [
  { name: 'Autorizadas', value: 1245 },
  { name: 'Rejeitadas', value: 23 },
  { name: 'Canceladas', value: 12 },
  { name: 'Denegadas', value: 5 },
];

const taxByMonth = [
  { mes: 'Jan', icms: 185000, pis: 32000, cofins: 98000 },
  { mes: 'Fev', icms: 172000, pis: 29500, cofins: 91200 },
  { mes: 'Mar', icms: 198000, pis: 34000, cofins: 105000 },
  { mes: 'Abr', icms: 192000, pis: 32800, cofins: 101500 },
  { mes: 'Mai', icms: 215000, pis: 36500, cofins: 112000 },
  { mes: 'Jun', icms: 228000, pis: 38200, cofins: 118500 },
];

const nfeList = [
  { numero: 'NF-e 4521', valor: 125800, status: 'autorizada', data: '18/06/2026' },
  { numero: 'NF-e 4520', valor: 89200, status: 'autorizada', data: '18/06/2026' },
  { numero: 'NF-e 4519', valor: 24500, status: 'rejeitada', data: '17/06/2026' },
  { numero: 'NF-e 4518', valor: 168500, status: 'autorizada', data: '17/06/2026' },
  { numero: 'NF-e 4517', valor: 45200, status: 'cancelada', data: '16/06/2026' },
  { numero: 'NF-e 4516', valor: 98500, status: 'autorizada', data: '16/06/2026' },
  { numero: 'NF-e 4515', valor: 71200, status: 'autorizada', data: '15/06/2026' },
  { numero: 'NF-e 4514', valor: 33400, status: 'denegada', data: '15/06/2026' },
];

const nfeColumns = [
  { id: 'numero', label: 'Número', minWidth: 110 },
  { id: 'valor', label: 'Valor', minWidth: 120, format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'status', label: 'Status', minWidth: 110, format: (v: unknown) => <StatusBadge status={String(v)} /> },
  { id: 'data', label: 'Data', minWidth: 100 },
];

const taxAlerts = [
  { type: 'error', icon: <Warning color="error" />, title: 'NF-e Rejeitadas', description: '3 NF-e rejeitadas aguardam correção. Prazo: 24h.' },
  { type: 'warning', icon: <Warning color="warning" />, title: 'Certificado A1 Vencendo', description: 'Certificado digital expira em 15 dias.' },
  { type: 'warning', icon: <Schedule color="warning" />, title: 'SPED Pendente', description: 'Escrituração fiscal do mês anterior não enviada.' },
  { type: 'success', icon: <CheckCircle color="success" />, title: 'DAS Mensal', description: 'Última DAS paga em 15/06. Próximo vencimento: 20/07.' },
];

export default function FiscalPage() {
  const totalNfeMes = nfeStatusData.reduce((a, b) => a + b.value, 0);
  const nfeHoje = nfeList.filter((n) => n.data === '18/06/2026' && n.status === 'autorizada').length;
  const valorTributado = taxByMonth[taxByMonth.length - 1];
  const totalTributos = valorTributado.icms + valorTributado.pis + valorTributado.cofins;
  const pendentes = nfeList.filter((n) => n.status === 'rejeitada' || n.status === 'denegada').length;
  const nfeHojeFormat = `${nfeHoje} NFC-e`;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Fiscal</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="NF-e Emitidas (Mês)" value={totalNfeMes} icon={<Receipt />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="NFC-e Hoje" value={nfeHojeFormat} icon={<TrendingUp />} trend="up" trendValue="+2" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Valor Tributado" value={`R$ ${(totalTributos / 1000).toFixed(1)}K`} icon={<AccountBalance />} trend="up" trendValue="+6,2%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pendências" value={pendentes} icon={<Warning />} trend="down" trendValue={`-${pendentes}`} color="error.main" />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="NF-e por Status"
              data={nfeStatusData}
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Valor de Impostos por Mês"
              data={taxByMonth as unknown as Record<string, unknown>[]}
              bars={[
                { dataKey: 'icms', name: 'ICMS', color: '#2E7D32' },
                { dataKey: 'pis', name: 'PIS', color: '#1565C0' },
                { dataKey: 'cofins', name: 'COFINS', color: '#ED6C02' },
              ]}
              xAxisKey="mes"
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <DataTable
            title="Últimas NF-e Emitidas"
            columns={nfeColumns}
            rows={nfeList as unknown as Record<string, unknown>[]}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning /> Alertas Fiscais
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {taxAlerts.map((alert, idx) => (
                <Alert key={idx} severity={alert.type as 'error' | 'warning' | 'success'} icon={alert.icon} sx={{ borderRadius: 2 }}>
                  <AlertTitle sx={{ mb: 0.5 }}>{alert.title}</AlertTitle>
                  {alert.description}
                </Alert>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
