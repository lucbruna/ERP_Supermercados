'use client';

import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material';
import { People, TrendingUp, TrendingDown, CalendarMonth, MonetizationOn } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

const departmentCount = [
  { departamento: 'Operacional', total: 45, ativos: 42 },
  { departamento: 'Vendas', total: 32, ativos: 30 },
  { departamento: 'Administrativo', total: 18, ativos: 17 },
  { departamento: 'Logística', total: 22, ativos: 20 },
  { departamento: 'Gerência', total: 8, ativos: 8 },
];

const attendanceTrend = [
  { mes: 'Jan', presente: 112, falta: 8, atraso: 5 },
  { mes: 'Fev', presente: 115, falta: 6, atraso: 4 },
  { mes: 'Mar', presente: 118, falta: 4, atraso: 3 },
  { mes: 'Abr', presente: 116, falta: 5, atraso: 4 },
  { mes: 'Mai', presente: 120, falta: 3, atraso: 2 },
  { mes: 'Jun', presente: 118, falta: 5, atraso: 2 },
];

const payrollSummary = [
  { mes: 'Jan', salarios: 285000, beneficios: 42000, encargos: 68000 },
  { mes: 'Fev', salarios: 285000, beneficios: 41000, encargos: 68000 },
  { mes: 'Mar', salarios: 292000, beneficios: 43000, encargos: 70000 },
  { mes: 'Abr', salarios: 292000, beneficios: 42500, encargos: 70000 },
  { mes: 'Mai', salarios: 298000, beneficios: 44000, encargos: 71500 },
  { mes: 'Jun', salarios: 298000, beneficios: 43500, encargos: 71500 },
];

const employees = [
  { nome: 'Carlos Silva', cargo: 'Operador de Caixa', departamento: 'Vendas', admissao: '10/03/2022', status: 'ativo' },
  { nome: 'Ana Oliveira', cargo: 'Gerente', departamento: 'Gerência', admissao: '05/01/2020', status: 'ativo' },
  { nome: 'Marcos Santos', cargo: 'Repositor', departamento: 'Operacional', admissao: '20/08/2023', status: 'ativo' },
  { nome: 'Juliana Costa', cargo: 'Auxiliar Adm', departamento: 'Administrativo', admissao: '15/06/2021', status: 'ferias' },
  { nome: 'Roberto Lima', cargo: 'Motorista', departamento: 'Logística', admissao: '01/02/2023', status: 'ativo' },
  { nome: 'Fernanda Souza', cargo: 'Analista RH', departamento: 'Administrativo', admissao: '12/11/2022', status: 'ativo' },
  { nome: 'Paulo Mendes', cargo: 'Açougueiro', departamento: 'Operacional', admissao: '08/07/2019', status: 'inativo' },
  { nome: 'Luciana Dias', cargo: 'Supervisora', departamento: 'Vendas', admissao: '22/04/2021', status: 'ativo' },
];

const employeeColumns = [
  { id: 'nome', label: 'Nome', minWidth: 180 },
  { id: 'cargo', label: 'Cargo', minWidth: 140 },
  { id: 'departamento', label: 'Departamento', minWidth: 120 },
  { id: 'admissao', label: 'Admissão', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 90, format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function RHPage() {
  const totalFunc = departmentCount.reduce((a, b) => a + b.total, 0);
  const totalAtivos = departmentCount.reduce((a, b) => a + b.ativos, 0);
  const folhaAtual = payrollSummary[payrollSummary.length - 1];
  const custoTotal = folhaAtual.salarios + folhaAtual.beneficios + folhaAtual.encargos;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard RH</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Funcionários" value={totalFunc} icon={<People />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ativos" value={totalAtivos} icon={<TrendingUp />} trend="up" trendValue="+4,2%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Inativos" value={totalFunc - totalAtivos} icon={<TrendingDown />} trend="down" trendValue="-2,1%" color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Folha Mensal" value={`R$ ${(custoTotal / 1000).toFixed(1)}K`} icon={<MonetizationOn />} color="info.main" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Funcionários por Departamento"
              data={departmentCount}
              bars={[
                { dataKey: 'total', name: 'Total', color: '#2E7D32' },
                { dataKey: 'ativos', name: 'Ativos', color: '#1565C0' },
              ]}
              xAxisKey="departamento"
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Presença x Faltas (Mensal)"
              data={attendanceTrend}
              lines={[
                { dataKey: 'presente', name: 'Presentes', color: '#2E7D32' },
                { dataKey: 'falta', name: 'Faltas', color: '#D32F2F' },
                { dataKey: 'atraso', name: 'Atrasos', color: '#ED6C02' },
              ]}
              xAxisKey="mes"
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              title="Evolução da Folha de Pagamento"
              data={payrollSummary}
              bars={[
                { dataKey: 'salarios', name: 'Salários', color: '#2E7D32' },
                { dataKey: 'beneficios', name: 'Benefícios', color: '#1565C0' },
                { dataKey: 'encargos', name: 'Encargos', color: '#ED6C02' },
              ]}
              xAxisKey="mes"
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Taxa de Absenteísmo</Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">4,8%</Typography>
              <Typography variant="body2" color="text.secondary">Média dos últimos 6 meses</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {attendanceTrend.slice(-3).map((m, i) => (
                <Box key={i} sx={{ flex: 1, minWidth: 100 }}>
                  <Typography variant="caption" fontWeight={600}>{m.mes}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={100 - (m.falta / (m.presente + m.falta)) * 100}
                    sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                    color={m.falta > 5 ? 'error' : m.falta > 3 ? 'warning' : 'success'}
                  />
                  <Typography variant="caption" color="text.secondary">{m.falta} faltas</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <DataTable
            title="Quadro de Funcionários"
            columns={employeeColumns}
            rows={employees as unknown as Record<string, unknown>[]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
