'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import {
  TableRestaurant, DeliveryDining, PointOfSale, Add, Refresh, CheckCircle, Cancel, Logout,
} from '@mui/icons-material';
import { pdvApi } from '@/lib/api';

export default function PdvAvancadoPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [mesas, setMesas] = useState<any[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loadingDel, setLoadingDel] = useState(false);

  const [openMesa, setOpenMesa] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);
  const [newMesa, setNewMesa] = useState({ numero: 1, capacidade: 4, localizacao: '' });
  const [newDelivery, setNewDelivery] = useState({ clienteNome: '', clienteTelefone: '', endereco: '{}', taxaEntrega: 0 });

  const mesaStatusChip = (s: string) => {
    const colors: Record<string, any> = {
      LIVRE: <Chip label="Livre" color="success" size="small" />,
      OCUPADA: <Chip label="Ocupada" color="error" size="small" />,
      RESERVADA: <Chip label="Reservada" color="warning" size="small" />,
      FECHADA: <Chip label="Fechada" size="small" />,
    };
    return colors[s] || <Chip label={s} size="small" />;
  };

  const delStatusChip = (s: string) => {
    const colors: Record<string, any> = {
      PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
      PREPARANDO: <Chip label="Preparando" color="info" size="small" />,
      SAIU_PARA_ENTREGA: <Chip label="Saiu p/ Entrega" color="info" size="small" />,
      ENTREGUE: <Chip label="Entregue" color="success" size="small" />,
      CANCELADO: <Chip label="Cancelado" color="error" size="small" />,
    };
    return colors[s] || <Chip label={s} size="small" />;
  };

  useEffect(() => {
    carregarMesas();
    carregarDeliveries();
  }, []);

  async function carregarMesas() {
    setLoadingMesas(true);
    try { const { data } = await pdvApi.get('/mesas'); setMesas(Array.isArray(data) ? data : []); }
    catch { setMesas([]); }
    finally { setLoadingMesas(false); }
  }

  async function carregarDeliveries() {
    setLoadingDel(true);
    try { const { data } = await pdvApi.get('/delivery?limite=20'); setDeliveries(data.data || []); }
    catch { setDeliveries([]); }
    finally { setLoadingDel(false); }
  }

  async function criarMesa() {
    try {
      await pdvApi.post('/mesas', { ...newMesa, companyId: '1', unidadeId: '1' });
      setSuccess('Mesa criada'); setOpenMesa(false); await carregarMesas();
    } catch { setError('Erro'); }
  }

  async function criarDelivery() {
    try {
      await pdvApi.post('/delivery', {
        ...newDelivery,
        companyId: '1', unidadeId: '1', vendaId: 'temp-' + Date.now(),
        endereco: JSON.parse(newDelivery.endereco),
      });
      setSuccess('Delivery criado'); setOpenDelivery(false); await carregarDeliveries();
    } catch { setError('Erro'); }
  }

  async function liberarMesa(id: string) {
    try { await pdvApi.post(`/mesas/${id}/fechar`); setSuccess('Mesa liberada'); await carregarMesas(); }
    catch { setError('Erro'); }
  }

  async function reservarMesa(id: string) {
    try { await pdvApi.post(`/mesas/${id}/reservar`); setSuccess('Mesa reservada'); await carregarMesas(); }
    catch { setError('Erro'); }
  }

  async function atualizarDelivery(id: string, status: string) {
    try { await pdvApi.put(`/delivery/${id}`, { status }); setSuccess(`Delivery: ${status}`); await carregarDeliveries(); }
    catch { setError('Erro'); }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <PointOfSale sx={{ mr: 1, verticalAlign: 'middle' }} />
        PDV Avançado
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{mesas.length}</Typography>
            <Typography variant="body2" color="text.secondary">Mesas</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h4" fontWeight="bold" color="error">{mesas.filter(m => m.status === 'OCUPADA').length}</Typography>
            <Typography variant="body2" color="text.secondary">Mesas Ocupadas</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{deliveries.filter(d => d.status !== 'ENTREGUE' && d.status !== 'CANCELADO').length}</Typography>
            <Typography variant="body2" color="text.secondary">Deliveries Ativos</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<TableRestaurant />} label="Mesas / Comanda" />
          <Tab icon={<DeliveryDining />} label="Delivery" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenMesa(true)}>Nova Mesa</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarMesas}>Atualizar</Button>
            </Box>
            {loadingMesas ? <LinearProgress /> : (
              <Grid container spacing={2}>
                {mesas.map((m: any) => (
                  <Grid xs={12} sm={6} md={4} lg={3} key={m.id}>
                    <Card sx={{
                      p: 2, textAlign: 'center',
                      bgcolor: m.status === 'OCUPADA' ? '#ffebee' : m.status === 'RESERVADA' ? '#fff3e0' : '#f5f5f5',
                      border: m.status === 'OCUPADA' ? '2px solid #c62828' : m.status === 'RESERVADA' ? '2px solid #f57c00' : '1px solid #e0e0e0',
                    }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {m.numero}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {m.localizacao || 'Sem localização'} · Cap. {m.capacidade}
                      </Typography>
                      {mesaStatusChip(m.status)}
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {m.status === 'LIVRE' && (
                          <Button size="small" variant="outlined" color="warning" onClick={() => reservarMesa(m.id)}>
                            Reservar
                          </Button>
                        )}
                        {m.status === 'OCUPADA' && (
                          <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                            onClick={() => liberarMesa(m.id)}>
                            Liberar
                          </Button>
                        )}
                        {m.status === 'RESERVADA' && (
                          <Button size="small" variant="contained" startIcon={<CheckCircle />}
                            onClick={() => liberarMesa(m.id)}>
                            Ocupar
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
                {mesas.length === 0 && (
                  <Grid xs={12}><Typography textAlign="center" color="text.secondary" py={4}>Nenhuma mesa cadastrada</Typography></Grid>
                )}
              </Grid>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDelivery(true)}>Novo Delivery</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarDeliveries}>Atualizar</Button>
            </Box>
            {loadingDel ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Taxa</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveries.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.clienteNome}</TableCell>
                        <TableCell>{d.clienteTelefone}</TableCell>
                        <TableCell>R$ {Number(d.taxaEntrega).toFixed(2)}</TableCell>
                        <TableCell>{delStatusChip(d.status)}</TableCell>
                        <TableCell>{new Date(d.dataPedido).toLocaleString()}</TableCell>
                        <TableCell>
                          {d.status === 'PENDENTE' && (
                            <IconButton color="info" size="small" onClick={() => atualizarDelivery(d.id, 'PREPARANDO')}><CheckCircle /></IconButton>
                          )}
                          {d.status === 'PREPARANDO' && (
                            <IconButton color="warning" size="small" onClick={() => atualizarDelivery(d.id, 'SAIU_PARA_ENTREGA')}><DeliveryDining /></IconButton>
                          )}
                          {d.status === 'SAIU_PARA_ENTREGA' && (
                            <IconButton color="success" size="small" onClick={() => atualizarDelivery(d.id, 'ENTREGUE')}><CheckCircle /></IconButton>
                          )}
                          {(d.status === 'PENDENTE' || d.status === 'PREPARANDO') && (
                            <IconButton color="error" size="small" onClick={() => atualizarDelivery(d.id, 'CANCELADO')}><Cancel /></IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {deliveries.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhum delivery</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openMesa} onClose={() => setOpenMesa(false)}>
        <DialogTitle>Nova Mesa</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Número" type="number" value={newMesa.numero} sx={{ mt: 1 }}
            onChange={e => setNewMesa({ ...newMesa, numero: parseInt(e.target.value) || 1 })} />
          <TextField fullWidth label="Capacidade" type="number" value={newMesa.capacidade} sx={{ mt: 2 }}
            onChange={e => setNewMesa({ ...newMesa, capacidade: parseInt(e.target.value) || 4 })} />
          <TextField fullWidth label="Localização" value={newMesa.localizacao} sx={{ mt: 2 }}
            onChange={e => setNewMesa({ ...newMesa, localizacao: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMesa(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarMesa}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelivery} onClose={() => setOpenDelivery(false)}>
        <DialogTitle>Novo Delivery</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Cliente" value={newDelivery.clienteNome} sx={{ mt: 1 }}
            onChange={e => setNewDelivery({ ...newDelivery, clienteNome: e.target.value })} />
          <TextField fullWidth label="Telefone" value={newDelivery.clienteTelefone} sx={{ mt: 2 }}
            onChange={e => setNewDelivery({ ...newDelivery, clienteTelefone: e.target.value })} />
          <TextField fullWidth label="Endereço (JSON)" value={newDelivery.endereco} sx={{ mt: 2 }} multiline rows={3}
            onChange={e => setNewDelivery({ ...newDelivery, endereco: e.target.value })} />
          <TextField fullWidth label="Taxa Entrega R$" type="number" value={newDelivery.taxaEntrega} sx={{ mt: 2 }}
            onChange={e => setNewDelivery({ ...newDelivery, taxaEntrega: parseFloat(e.target.value) || 0 })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelivery(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarDelivery}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
