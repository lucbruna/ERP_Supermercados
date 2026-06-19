'use client';

import { Box, Grid, Paper, Typography, Chip, Card, CardContent, Alert, AlertTitle, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { TrendingUp, TrendingDown, AutoGraph, Psychology, Campaign, Warning, CheckCircle, Lightbulb, BugReport, Inventory, ShoppingCart, AttachMoney } from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';

const salesForecast = [
  { mes: 'Jan', real: 1450000, previsto: 1420000 },
  { mes: 'Fev', real: 1380000, previsto: 1400000 },
  { mes: 'Mar', real: 1520000, previsto: 1480000 },
  { mes: 'Abr', real: 1480000, previsto: 1500000 },
  { mes: 'Mai', real: 1650000, previsto: 1580000 },
  { mes: 'Jun', real: 1720000, previsto: 1680000 },
  { mes: 'Jul', real: 0, previsto: 1780000 },
  { mes: 'Ago', real: 0, previsto: 1750000 },
  { mes: 'Set', real: 0, previsto: 1820000 },
  { mes: 'Out', real: 0, previsto: 1880000 },
  { mes: 'Nov', real: 0, previsto: 1950000 },
  { mes: 'Dez', real: 0, previsto: 2100000 },
];

const stockAnalysis = [
  { name: 'Estoque OK', value: 1250 },
  { name: 'Estoque Baixo', value: 185 },
  { name: 'Excesso', value: 92 },
];

const suggestedPurchases = [
  { produto: 'Arroz Tipo 1 5kg', atual: 42, sugerido: 120, motivo: 'Tendência de alta (+15%)' },
  { produto: 'Óleo de Soja 900ml', atual: 25, sugerido: 200, motivo: 'Estoque crítico' },
  { produto: 'Café Torrado 500g', atual: 55, sugerido: 150, motivo: 'Sazonalidade' },
  { produto: 'Refrigerante 2L', atual: 80, sugerido: 300, motivo: 'Aproximação de feriado' },
  { produto: 'Carne Bovina (kg)', atual: 85, sugerido: 200, motivo: 'Demanda crescente (+22%)' },
];

const recommendations = [
  { tipo: 'estoque', icon: <Inventory color="warning" />, titulo: 'Aumentar estoque de Arroz', descricao: 'Previsão de aumento de 18% na demanda para o próximo mês.' },
  { tipo: 'promocao', icon: <Campaign color="primary" />, titulo: 'Promoção sugerida: Bebidas', descricao: 'Histórico indica aumento de 35% nas vendas de bebidas no verão.' },
  { tipo: 'preco', icon: <AttachMoney color="success" />, titulo: 'Reajuste de preço: Laticínios', descricao: 'Custo de insumos subiu 8%. Sugerir reajuste de 5%.' },
  { tipo: 'estoque', icon: <Inventory color="error" />, titulo: 'Reduzir compra de Limpeza', descricao: 'Estoque atual cobre 45 dias de venda. Reduzir pedido em 30%.' },
  { tipo: 'promocao', icon: <Campaign color="info" />, titulo: 'Cross-sell: Café + Açúcar', descricao: 'Clientes que compram café têm 72% de chance de comprar açúcar.' },
];

const anomalies = [
  { data: '17/06', descricao: 'Venda atípica de Refrigerante 2L (+340% vs média)', gravidade: 'alta', valor: 28400 },
  { data: '16/06', descricao: 'Queda repentina em vendas de Hortifrúti (-62% vs média)', gravidade: 'alta', valor: -12450 },
  { data: '15/06', descricao: 'Horário de pico anormal às 14h (volume 2x maior)', gravidade: 'media', valor: 0 },
  { data: '14/06', descricao: 'Cliente com compra atípica: R$ 12.450 em produtos de limpeza', gravidade: 'media', valor: 12450 },
  { data: '13/06', descricao: 'Estoque de Arroz zerado por 4 horas (falha no abastecimento)', gravidade: 'alta', valor: -18500 },
];

const forecast30Days = [
  { dia: '+1', previsto: 54800 }, { dia: '+5', previsto: 56200 },
  { dia: '+10', previsto: 58500 }, { dia: '+15', previsto: 57200 },
  { dia: '+20', previsto: 59800 }, { dia: '+25', previsto: 61400 },
  { dia: '+30', previsto: 63500 },
];

export default function IAPage() {
  const lastActual = salesForecast.filter((s) => s.real > 0);
  const accuracy = 94.7;
  const forecastTotal = forecast30Days.reduce((a, b) => a + b.previsto, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard Inteligência Artificial</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Previsão Vendas Mês" value={`R$ ${(forecastTotal / 1000).toFixed(1)}K`} icon={<AutoGraph />} trend="up" trendValue="+8,3%" color="primary.main" comparisonText="vs. mês atual" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Acurácia Modelo" value={`${accuracy}%`} icon={<Psychology />} trend="up" trendValue="+2,1pp" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Recomendações Ativas" value="5" icon={<Lightbulb />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Alertas IA" value="3" icon={<Warning />} trend="down" trendValue="-1" color="warning.main" />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoGraph /> Previsão de Vendas
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              title="Vendas Reais vs Previstas (12 Meses)"
              data={salesForecast as unknown as Record<string, unknown>[]}
              lines={[
                { dataKey: 'real', name: 'Vendas Reais', color: '#2E7D32' },
                { dataKey: 'previsto', name: 'Previsão', color: '#1565C0' },
              ]}
              xAxisKey="mes"
              height={350}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Acurácia do Modelo</Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box sx={{ width: 140, height: 140, borderRadius: '50%', border: '8px solid', borderColor: accuracy > 90 ? 'success.main' : 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={700} color={accuracy > 90 ? 'success.main' : 'warning.main'}>{accuracy}%</Typography>
                <Typography variant="caption" color="text.secondary">acurácia</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ mb: 1 }}><CheckCircle color="success" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} /> Erro médio: 5,3%</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><CheckCircle color="success" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} /> MAE: R$ 42.500</Typography>
              <Typography variant="body2"><CheckCircle color="success" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} /> R²: 0.94</Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Previsão Próximos 30 Dias</Typography>
              <Grid container spacing={1}>
                {forecast30Days.map((f, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{f.dia}</Typography>
                      <Typography variant="body2" fontWeight={600}>R$ {(f.previsto / 1000).toFixed(1)}K</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory /> Análise de Estoque
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <PieChart
              title="Distribuição de Estoque"
              data={stockAnalysis}
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Compras Sugeridas</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {suggestedPurchases.map((item, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{item.produto}</Typography>
                    <Chip label={item.motivo} size="small" color={item.motivo.includes('crítico') ? 'error' : 'warning'} variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">Atual: <strong>{item.atual} un</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Sugerido: <strong>{item.sugerido} un</strong></Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb /> Recomendações Inteligentes
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {recommendations.map((rec, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={idx}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {rec.icon}
                      <Typography variant="subtitle2" fontWeight={600}>{rec.titulo}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{rec.descricao}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport /> Anomalias Detectadas
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {anomalies.map((anomaly, idx) => (
                <Alert
                  key={idx}
                  severity={anomaly.gravidade === 'alta' ? 'error' : 'warning'}
                  icon={anomaly.gravidade === 'alta' ? <Warning /> : <BugReport />}
                  sx={{ borderRadius: 2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <AlertTitle sx={{ mb: 0 }}>{anomaly.descricao}</AlertTitle>
                      <Typography variant="caption" color="text.secondary">{anomaly.data}</Typography>
                    </Box>
                    {anomaly.valor !== 0 && (
                      <Chip
                        label={`${anomaly.valor > 0 ? '+' : ''}R$ ${Math.abs(anomaly.valor).toLocaleString('pt-BR')}`}
                        size="small"
                        color={anomaly.valor > 0 ? 'warning' : 'error'}
                        variant="filled"
                      />
                    )}
                  </Box>
                </Alert>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
