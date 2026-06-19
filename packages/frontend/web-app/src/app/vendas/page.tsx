'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  PointOfSale, CheckCircle, Cancel, PendingActions, Visibility, Refresh,
  ShoppingCart, AttachMoney, TrendingUp, Receipt,
} from '@mui/icons-material';
import { pdvApi } from '@/lib/api';

export default function VendasPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<any>(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelVendaId, setCancelVendaId] = useState('');
  const [cancelaMotivo, setCancelaMotivo] = useState('');

  useEffect(() => {
    carregarVendas();
  }, []);

  async function carregarVendas() {
    setLoading(true);
    try {
      const { data } = await pdvApi.get('/vendas');
      setVendas(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setVendas([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelarVenda() {
    if (!cancelaMotivo.trim()) { setError('Informe o motivo do cancelamento'); return; }
    try {
      await pdvApi.post(`/vendas/${cancelVendaId}/cancelar`, { motivo: cancelaMotivo });
      setSuccess('Venda cancelada');
      setOpenCancelDialog(false);
      setCancelaMotivo('');
      await carregarVendas();
    } catch {
      setError('Erro ao cancelar venda');
    }
  }

  function abrirDetalhe(v: any) {
    setSelectedVenda(v);
    setOpenDetail(true);
  }

  const vendasFiltradas = vendas.filter((v: any) => {
    if (tab === 0) return true;
    if (tab === 1) return v.status === 'PENDENTE' || v.status === 'pendente';
    if (tab === 2) return v.status === 'FINALIZADA' || v.status === 'concluido' || v.status === 'CONCLUIDO';
    if (tab === 3) return v.status === 'CANCELADA' || v.status === 'cancelado';
    return true;
  });

  const vendasHoje = vendas.filter((v: any) => {
    const hoje = new Date().toISOString().split('T')[0];
    return v.data?.startsWith(hoje) || v.createdAt?.startsWith(hoje);
  });

  const totalVendasHoje = vendasHoje.reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);
  const totalVendasMes = vendas.filter((v: any) => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const dataVenda = v.data ? new Date(v.data) : null;
    return dataVenda && dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  }).reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);

  const qtdeVendas = vendas.filter((v: any) => v.status !== 'CANCELADA' && v.status !== 'cancelado').length;
  const ticketMedio = qtdeVendas > 0 ? totalVendasMes / qtdeVendas : 0;

  const statusChip = (s: string) => {
    const m: Record<string, any> = {
      CONCLUIDO: <Chip label="Finalizada" color="success" size="small" />,
      concluido: <Chip label="Finalizada" color="success" size="small" />,
      FINALIZADA: <Chip label="Finalizada" color="success" size="small" />,
      PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
      pendente: <Chip label="Pendente" color="warning" size="small" />,
      CANCELADA: <Chip label="Cancelada" color="error" size="small" />,
      cancelado: <Chip label="Cancelada" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <PointOfSale sx={{ mr: 1, verticalAlign: 'middle' }} />
        Vendas
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalVendasHoje.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Vendas Hoje</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalVendasMes.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Vendas Mês</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">R$ {ticketMedio.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Ticket Médio</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{qtdeVendas}</Typography>
            <Typography variant="body2" color="text.secondary">Qtde Vendas</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Receipt />} label="Todas" />
          <Tab icon={<PendingActions />} label="Pendentes" />
          <Tab icon={<CheckCircle />} label="Finalizadas" />
          <Tab icon={<Cancel />} label="Canceladas" />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={carregarVendas}>Atualizar</Button>
        </Box>

        {loading ? <LinearProgress /> : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Forma Pagamento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendasFiltradas.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.data ? new Date(v.data).toLocaleDateString() : (v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '-')}</TableCell>
                    <TableCell><Chip label={v.numero || v.id} color="primary" size="small" /></TableCell>
                    <TableCell>{v.cliente || v.clienteNome || '-'}</TableCell>
                    <TableCell>R$ {Number(v.total || 0).toFixed(2)}</TableCell>
                    <TableCell>{v.formaPagamento || v.forma_pagamento || '-'}</TableCell>
                    <TableCell>{statusChip(v.status)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => abrirDetalhe(v)}><Visibility /></IconButton>
                      {(v.status === 'PENDENTE' || v.status === 'pendente') && (
                        <IconButton size="small" color="error" onClick={() => { setCancelVendaId(v.id); setCancelaMotivo(''); setOpenCancelDialog(true); }}><Cancel /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {vendasFiltradas.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nenhuma venda encontrada</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes da Venda</DialogTitle>
        <DialogContent>
          {selectedVenda && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Informações Gerais</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={6}><Typography variant="body2"><strong>Número:</strong> {selectedVenda.numero || selectedVenda.id}</Typography></Grid>
                <Grid xs={6}><Typography variant="body2"><strong>Data:</strong> {selectedVenda.data ? new Date(selectedVenda.data).toLocaleDateString() : (selectedVenda.createdAt ? new Date(selectedVenda.createdAt).toLocaleDateString() : '-')}</Typography></Grid>
                <Grid xs={6}><Typography variant="body2"><strong>Cliente:</strong> {selectedVenda.cliente || selectedVenda.clienteNome || 'Consumidor Final'}</Typography></Grid>
                <Grid xs={6}><Typography variant="body2"><strong>Status:</strong> {statusChip(selectedVenda.status)}</Typography></Grid>
              </Grid>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Itens Vendidos</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Qtd</TableCell>
                      <TableCell>Valor Unit.</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedVenda.itens || selectedVenda.items || []).map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.produto || item.produtoNome || item.nome || '-'}</TableCell>
                        <TableCell>{item.quantidade || item.qtd || 1}</TableCell>
                        <TableCell>R$ {Number(item.valorUnitario || item.preco || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(item.subtotal || item.total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedVenda.itens || selectedVenda.itens.length === 0) && (!selectedVenda.items || selectedVenda.items.length === 0) && (
                      <TableRow><TableCell colSpan={4} align="center">Nenhum item registrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Pagamentos</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Forma</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Troco</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedVenda.pagamentos || selectedVenda.payments || []).map((p: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{p.forma || p.formaPagamento || p.tipo || '-'}</TableCell>
                        <TableCell>R$ {Number(p.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(p.troco || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedVenda.pagamentos || selectedVenda.pagamentos.length === 0) && (!selectedVenda.payments || selectedVenda.payments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2"><strong>Valor Total:</strong> R$ {Number(selectedVenda.total || 0).toFixed(2)}</Typography>
                          {selectedVenda.formaPagamento && <Typography variant="body2"><strong>Forma:</strong> {selectedVenda.formaPagamento}</Typography>}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar Venda</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Motivo do Cancelamento" value={cancelaMotivo} sx={{ mt: 1 }}
            onChange={e => setCancelaMotivo(e.target.value)} multiline rows={3} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Voltar</Button>
          <Button variant="contained" color="error" onClick={cancelarVenda}>Confirmar Cancelamento</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
