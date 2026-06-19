'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Stepper, Step, StepLabel, IconButton,
} from '@mui/material';
import {
  LocalShipping, Today, PendingActions, Route, CheckCircle, Close, Refresh, Info,
} from '@mui/icons-material';
import { pdvApi } from '@/lib/api';

const statusChip = (s: string) => {
  const m: Record<string, any> = {
    PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
    EM_ROTA: <Chip label="Em Rota" color="info" size="small" />,
    ENTREGUE: <Chip label="Entregue" color="success" size="small" />,
    CANCELADO: <Chip label="Cancelado" color="error" size="small" />,
    EM_ANDAMENTO: <Chip label="Em Andamento" color="info" size="small" />,
    CONCLUIDA: <Chip label="Concluída" color="success" size="small" />,
  };
  return m[s] || <Chip label={s} size="small" />;
};

const timelineLabels: Record<string, string> = {
  PENDENTE: 'Pedido Recebido',
  EM_ROTA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue ao Cliente',
  CONCLUIDA: 'Concluído',
};

export default function DeliveryPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { carregarEntregas(); }, []);

  async function carregarEntregas() {
    setLoading(true);
    try {
      const { data } = await pdvApi.get('/delivery');
      const list = Array.isArray(data) ? data : data.data || [];
      setDeliveries(list);
    } catch { setDeliveries([]); }
    finally { setLoading(false); }
  }

  const pendentes = deliveries.filter((d: any) => d.status === 'PENDENTE');
  const emAndamento = deliveries.filter((d: any) => d.status === 'EM_ROTA' || d.status === 'EM_ANDAMENTO');
  const concluidas = deliveries.filter((d: any) => d.status === 'ENTREGUE' || d.status === 'CONCLUIDA');

  const todayStr = new Date().toISOString().slice(0, 10);
  const entregasHoje = deliveries.filter((d: any) =>
    d.createdAt?.slice(0, 10) === todayStr || d.dataEntrega?.slice(0, 10) === todayStr
  );
  const emRota = deliveries.filter((d: any) => d.status === 'EM_ROTA');

  function openDetail(d: any) {
    setSelectedDelivery(d);
    setDetailOpen(true);
  }

  function getStatusSteps(status: string): string[] {
    const order = ['PENDENTE', 'EM_ROTA', 'ENTREGUE', 'CONCLUIDA'];
    return order;
  }

  function getActiveStep(status: string): number {
    const order = ['PENDENTE', 'EM_ROTA', 'ENTREGUE', 'CONCLUIDA'];
    const idx = order.indexOf(status);
    return idx >= 0 ? idx : 0;
  }

  const currentList = tab === 0 ? pendentes : tab === 1 ? emAndamento : concluidas;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
        Delivery
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{entregasHoje.length}</Typography>
            <Typography variant="body2" color="text.secondary"><Today sx={{ verticalAlign: 'middle', mr: 0.5 }} />Entregas Hoje</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{pendentes.length}</Typography>
            <Typography variant="body2" color="text.secondary"><PendingActions sx={{ verticalAlign: 'middle', mr: 0.5 }} />Pendentes</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{emRota.length}</Typography>
            <Typography variant="body2" color="text.secondary"><Route sx={{ verticalAlign: 'middle', mr: 0.5 }} />Em Rota</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{concluidas.length}</Typography>
            <Typography variant="body2" color="text.secondary"><CheckCircle sx={{ verticalAlign: 'middle', mr: 0.5 }} />Concluídas</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={carregarEntregas}>Atualizar</Button>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<PendingActions />} label="Pendentes" />
          <Tab icon={<Route />} label="Em Andamento" />
          <Tab icon={<CheckCircle />} label="Concluídas" />
        </Tabs>

        {loading ? <LinearProgress /> : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Entregador</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor Taxa</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentList.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell>#{d.pedidoId?.slice(-6) || d.id?.slice(-6)}</TableCell>
                    <TableCell>{d.cliente?.nome || d.clienteNome || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.endereco?.logradouro || d.enderecoEntrega || '-'}
                    </TableCell>
                    <TableCell>{d.entregador?.nome || d.entregadorNome || '-'}</TableCell>
                    <TableCell>{statusChip(d.status)}</TableCell>
                    <TableCell>R$ {Number(d.valorTaxa || d.taxa || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openDetail(d)}><Info /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {currentList.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">Nenhuma entrega encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping /> Detalhes da Entrega #{selectedDelivery?.id?.slice(-6)}
            <Box sx={{ ml: 'auto' }}>{selectedDelivery && statusChip(selectedDelivery.status)}</Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDelivery && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Itens</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Produto</TableCell><TableCell>Qtd</TableCell><TableCell>Valor</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedDelivery.itens || []).map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.nome || item.produtoNome || '-'}</TableCell>
                        <TableCell>{item.quantidade || 0}</TableCell>
                        <TableCell>R$ {Number(item.valor || item.preco || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedDelivery.itens || selectedDelivery.itens.length === 0) && (
                      <TableRow><TableCell colSpan={3} align="center">Nenhum item</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" fontWeight="bold">Endereço de Entrega</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedDelivery.endereco?.logradouro || selectedDelivery.enderecoEntrega || '-'}
                {selectedDelivery.endereco?.numero ? `, ${selectedDelivery.endereco.numero}` : ''}
                {selectedDelivery.endereco?.bairro ? ` - ${selectedDelivery.endereco.bairro}` : ''}
                {selectedDelivery.endereco?.cidade ? `, ${selectedDelivery.endereco.cidade}` : ''}
                {selectedDelivery.endereco?.uf ? ` - ${selectedDelivery.endereco.uf}` : ''}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Status da Entrega</Typography>
              <Stepper activeStep={getActiveStep(selectedDelivery.status)} alternativeLabel>
                {getStatusSteps(selectedDelivery.status).map((step) => (
                  <Step key={step}>
                    <StepLabel>{timelineLabels[step] || step}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {selectedDelivery.observacao && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Observação</Typography>
                  <Typography variant="body2">{selectedDelivery.observacao}</Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} startIcon={<Close />}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
