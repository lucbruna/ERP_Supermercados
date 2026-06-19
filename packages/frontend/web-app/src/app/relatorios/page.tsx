'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Chip, CircularProgress, IconButton, MenuItem, TextField, Button,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AttachMoney, ShoppingCart, People, Inventory,
  Warning, CheckCircle, Schedule, Refresh, Download,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#c62828', '#7b1fa2', '#00796b', '#5d4037'];

export default function RelatoriosPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('MENSAL');
  const [vendasData, setVendasData] = useState<any[]>([]);
  const [categoriaData, setCategoriaData] = useState<any[]>([]);

  useEffect(() => { loadData(); }, [periodo]);

  async function loadData() {
    setLoading(true);
    try {
      const { data } = await api.get('/pdv/vendas/relatorios?periodo=' + periodo);
      if (data.success) {
        setKpis(data.kpis || []);
        setVendasData(data.vendasPorDia || []);
        setCategoriaData(data.vendasPorCategoria || []);
      }
    } catch {
      // fallback: load from BI service
      try {
        const { data: biData } = await api.get('/bi/kpis?periodo=' + periodo);
        if (biData.success) {
          setKpis(biData.data || []);
        }
      } catch {}
    }
    setLoading(false);
  }

  // Demo data if API not available
  const demoKpis = kpis.length > 0 ? kpis : [
    { nome: 'Faturamento do Mês', categoria: 'VENDAS', valor: 485230, meta: 500000, variacao: -0.03, periodo: 'MENSAL' },
    { nome: 'Ticket Médio', categoria: 'VENDAS', valor: 187.50, meta: 180, variacao: 0.042, periodo: 'DIARIO' },
    { nome: 'Produtos Vendidos', categoria: 'VENDAS', valor: 12580, meta: 12000, variacao: 0.048, periodo: 'MENSAL' },
    { nome: 'Margem Líquida', categoria: 'FINANCEIRO', valor: 18.3, meta: 18, variacao: 0.017, periodo: 'MENSAL' },
    { nome: 'Inadimplência', categoria: 'FINANCEIRO', valor: 2.8, meta: 2.5, variacao: 0.12, periodo: 'MENSAL' },
    { nome: 'Giro de Estoque', categoria: 'ESTOQUE', valor: 7.2, meta: 8, variacao: -0.1, periodo: 'MENSAL' },
    { nome: 'Clientes Ativos', categoria: 'CRM', valor: 3420, meta: 3500, variacao: -0.023, periodo: 'MENSAL' },
  ];

  const demoVendas = vendasData.length > 0 ? vendasData : [
    { dia: 'Seg', valor: 18500 }, { dia: 'Ter', valor: 22300 }, { dia: 'Qua', valor: 19800 },
    { dia: 'Qui', valor: 25400 }, { dia: 'Sex', valor: 32100 }, { dia: 'Sáb', valor: 45200 },
    { dia: 'Dom', valor: 38900 },
  ];

  const demoCat = categoriaData.length > 0 ? categoriaData : [
    { nome: 'Perecíveis', valor: 35 }, { nome: 'Não Perecíveis', valor: 25 }, { nome: 'Bebidas', valor: 20 },
    { nome: 'Higiene', valor: 12 }, { nome: 'Limpeza', valor: 8 },
  ];

  const kpiCards = [
    {
      label: 'Faturamento', value: `R$ ${(demoKpis[0]?.valor || 0).toLocaleString()}`, meta: `Meta: R$ ${(demoKpis[0]?.meta || 0).toLocaleString()}`,
      icon: <AttachMoney />, color: '#1976d2', variacao: demoKpis[0]?.variacao || 0,
    },
    {
      label: 'Ticket Médio', value: `R$ ${demoKpis[1]?.valor?.toFixed(2) || '0,00'}`, meta: `Meta: R$ ${demoKpis[1]?.meta?.toFixed(2) || '0,00'}`,
      icon: <ShoppingCart />, color: '#388e3c', variacao: demoKpis[1]?.variacao || 0,
    },
    {
      label: 'Margem Líquida', value: `${demoKpis[3]?.valor || 0}%`, meta: `Meta: ${demoKpis[3]?.meta || 0}%`,
      icon: <TrendingUp />, color: '#f57c00', variacao: demoKpis[3]?.variacao || 0,
    },
    {
      label: 'Giro Estoque', value: `${demoKpis[5]?.valor || 0}x`, meta: `Meta: ${demoKpis[5]?.meta || 0}x`,
      icon: <Inventory />, color: '#7b1fa2', variacao: demoKpis[5]?.variacao || 0,
    },
    {
      label: 'Inadimplência', value: `${demoKpis[4]?.valor || 0}%`, meta: `Meta: ${demoKpis[4]?.meta || 0}%`,
      icon: <Warning />, color: '#c62828', variacao: demoKpis[4]?.variacao || 0,
    },
    {
      label: 'Clientes Ativos', value: `${(demoKpis[6]?.valor || 0).toLocaleString()}`, meta: `Meta: ${(demoKpis[6]?.meta || 0).toLocaleString()}`,
      icon: <People />, color: '#00796b', variacao: demoKpis[6]?.variacao || 0,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Dashboard / Relatórios</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select size="small" value={periodo} onChange={(e) => setPeriodo(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="DIARIO">Hoje</MenuItem>
            <MenuItem value="SEMANAL">Esta Semana</MenuItem>
            <MenuItem value="MENSAL">Este Mês</MenuItem>
            <MenuItem value="ANUAL">Este Ano</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData}>Atualizar</Button>
          <Button variant="outlined" startIcon={<Download />}>Exportar</Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {kpiCards.map((kpi, i) => (
              <Grid xs={12} sm={6} md={4} key={i}>
                <Card sx={{ p: 2, borderLeft: `4px solid ${kpi.color}`, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                    <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">{kpi.value}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{kpi.meta}</Typography>
                    <Chip
                      size="small"
                      icon={kpi.variacao >= 0 ? <TrendingUp /> : <TrendingDown />}
                      label={`${(kpi.variacao * 100).toFixed(1)}%`}
                      color={kpi.variacao >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Vendas por Dia</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={demoVendas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="valor" stroke="#1976d2" fill="#1976d2" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Vendas por Categoria</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={demoCat} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="valor" label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                      {demoCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card sx={{ p: 3, height: 320 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Evolução do Faturamento</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={[
                    { mes: 'Jan', valor: 380000 }, { mes: 'Fev', valor: 420000 }, { mes: 'Mar', valor: 395000 },
                    { mes: 'Abr', valor: 445000 }, { mes: 'Mai', valor: 470000 }, { mes: 'Jun', valor: 485230 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString()}`} />
                    <Bar dataKey="valor" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card sx={{ p: 3, height: 320 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Comparativo: Real vs Meta</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={demoKpis.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${v}`} />
                    <YAxis type="category" dataKey="nome" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" name="Real" fill="#1976d2" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="meta" name="Meta" fill="#f57c00" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
