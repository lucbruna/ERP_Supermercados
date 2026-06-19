'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, LinearProgress,
} from '@mui/material';
import {
  Search, Person, ShoppingCart, CreditCard, Receipt, History, Lock, Block,
  CheckCircle, Warning, MoneyOff,
} from '@mui/icons-material';
import api, { crmApi } from '@/lib/api';

interface Cliente {
  id: string; nome: string; cpfCnpj: string; email: string; celular: string;
  segmento: string; totalCompras: number; ultimaCompra: string; ativo: boolean;
}

export default function CrmPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [compras, setCompras] = useState<any[]>([]);
  const [comprasLoading, setComprasLoading] = useState(false);
  const [credito, setCredito] = useState<any>(null);
  const [creditoLoading, setCreditoLoading] = useState(false);
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [cobrancasLoading, setCobrancasLoading] = useState(false);
  const [resumo, setResumo] = useState<any>(null);
  const [openLimiteDialog, setOpenLimiteDialog] = useState(false);
  const [novoLimite, setNovoLimite] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function buscarClientes() {
    setLoading(true);
    try {
      const { data } = await crmApi.get(`/clientes?nome=${searchTerm}&limite=20`);
      setClientes(data.data || []);
    } catch { setError('Erro ao buscar clientes'); }
    finally { setLoading(false); }
  }

  async function selecionarCliente(c: Cliente) {
    setSelectedCliente(c);
    setError(''); setSuccess('');
    await Promise.all([carregarCompras(c.id), carregarCredito(c.id), carregarCobrancas(c.id)]);
  }

  async function carregarCompras(clienteId: string) {
    setComprasLoading(true);
    try {
      const { data } = await crmApi.get(`/clientes/${clienteId}/compras`);
      setCompras(data.data || []);
          const r = await crmApi.get(`/clientes/${clienteId}/compras/resumo`);
      setResumo(r.data);
    } catch { setCompras([]); }
    finally { setComprasLoading(false); }
  }

  async function carregarCredito(clienteId: string) {
    setCreditoLoading(true);
    try {
      const { data } = await crmApi.get(`/clientes/${clienteId}/credito`);
      setCredito(data);
    } catch { setCredito(null); }
    finally { setCreditoLoading(false); }
  }

  async function carregarCobrancas(clienteId: string) {
    setCobrancasLoading(true);
    try {
      const { data } = await crmApi.get(`/clientes/${clienteId}/cobrancas`);
      setCobrancas(data || []);
    } catch { setCobrancas([]); }
    finally { setCobrancasLoading(false); }
  }

  async function definirLimite() {
    if (!selectedCliente || !novoLimite) return;
    try {
      await crmApi.post('/credito/definir-limite', {
        clienteId: selectedCliente.id,
        companyId: '1',
        limite: parseFloat(novoLimite),
      });
      setSuccess('Limite definido com sucesso');
      setOpenLimiteDialog(false);
      await carregarCredito(selectedCliente.id);
    } catch { setError('Erro ao definir limite'); }
  }

  async function bloquearCredito() {
    if (!selectedCliente) return;
    try {
      await crmApi.post(`/credito/bloquear/${selectedCliente.id}`);
      setSuccess('Crédito bloqueado');
      await carregarCredito(selectedCliente.id);
    } catch { setError('Erro ao bloquear crédito'); }
  }

  const segmentoColor: Record<string, string> = {
    VIP: '#7b1fa2', FREQUENTE: '#1976d2', REGULAR: '#388e3c',
    POTENCIAL: '#f57c00', INATIVO: '#757575', PERDIDO: '#c62828',
  };

  const statusChip = (s: string) => {
    const colors: Record<string, any> = {
      PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
      VENCIDA: <Chip label="Vencida" color="error" size="small" />,
      PAGA: <Chip label="Paga" color="success" size="small" />,
      RENEGOCIADA: <Chip label="Renegociada" color="info" size="small" />,
      CANCELADA: <Chip label="Cancelada" size="small" />,
      ATIVO: <Chip label="Ativo" color="success" size="small" />,
      BLOQUEADO: <Chip label="Bloqueado" color="error" size="small" />,
    };
    return colors[s] || <Chip label={s} size="small" />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>CRM</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
              Buscar Cliente
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField size="small" fullWidth placeholder="Nome, CPF ou email..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarClientes()} />
              <Button variant="contained" onClick={buscarClientes}><Search /></Button>
            </Box>
            {loading ? <CircularProgress size={24} sx={{ display: 'block', mx: 'auto' }} /> : (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Segmento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientes.map(c => (
                      <TableRow key={c.id} hover selected={selectedCliente?.id === c.id}
                        onClick={() => selecionarCliente(c)} sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{c.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.cpfCnpj}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={c.segmento} size="small"
                            sx={{ bgcolor: segmentoColor[c.segmento], color: '#fff' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {clientes.length === 0 && (
                      <TableRow><TableCell colSpan={2} align="center">Nenhum cliente encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {selectedCliente && (
            <Card sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                {selectedCliente.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CPF: {selectedCliente.cpfCnpj}<br />
                Email: {selectedCliente.email}<br />
                Celular: {selectedCliente.celular}<br />
                Total compras: R$ {Number(selectedCliente.totalCompras).toFixed(2)}<br />
                Última compra: {selectedCliente.ultimaCompra ? new Date(selectedCliente.ultimaCompra).toLocaleDateString() : '-'}
              </Typography>
            </Card>
          )}
        </Grid>

        <Grid xs={12} md={8}>
          {!selectedCliente ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Selecione um cliente para visualizar os detalhes</Typography>
            </Card>
          ) : (
            <Card sx={{ p: 2 }}>
              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab icon={<ShoppingCart />} label="Compras" />
                <Tab icon={<CreditCard />} label="Crédito" />
                <Tab icon={<Receipt />} label="Cobranças" />
              </Tabs>

              {tabIndex === 0 && (
                <Box>
                  {resumo && (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid xs={4}>
                        <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                          <Typography variant="h5" fontWeight="bold">
                            R$ {resumo.totalGasto.toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Total Gasto</Typography>
                        </Card>
                      </Grid>
                      <Grid xs={4}>
                        <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                          <Typography variant="h5" fontWeight="bold">{resumo.totalCompras}</Typography>
                          <Typography variant="caption">Compras</Typography>
                        </Card>
                      </Grid>
                      <Grid xs={4}>
                        <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fff3e0' }}>
                          <Typography variant="h5" fontWeight="bold">
                            R$ {resumo.ticketMedio.toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Ticket Médio</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  )}

                  {comprasLoading ? <LinearProgress /> : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {compras.map((c: any) => (
                            <TableRow key={c.id}>
                              <TableCell>{c.numero}</TableCell>
                              <TableCell>{new Date(c.dataHora).toLocaleString()}</TableCell>
                              <TableCell>R$ {Number(c.total).toFixed(2)}</TableCell>
                              <TableCell>{c.tipo}</TableCell>
                              <TableCell>{statusChip(c.status)}</TableCell>
                            </TableRow>
                          ))}
                          {compras.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center">Nenhuma compra encontrada</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {tabIndex === 1 && (
                <Box>
                  {creditoLoading ? <LinearProgress /> : credito ? (
                    <Grid container spacing={2}>
                      <Grid xs={4}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                          <Typography variant="h6" fontWeight="bold">R$ {Number(credito.limite).toFixed(2)}</Typography>
                          <Typography variant="caption">Limite</Typography>
                        </Card>
                      </Grid>
                      <Grid xs={4}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                          <Typography variant="h6" fontWeight="bold" color="error">
                            R$ {Number(credito.saldoDevedor).toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Saldo Devedor</Typography>
                        </Card>
                      </Grid>
                      <Grid xs={4}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            R$ {Number(credito.saldoDisponivel || credito.limite - credito.saldoDevedor).toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Disponível</Typography>
                        </Card>
                      </Grid>
                      <Grid xs={12}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="contained" onClick={() => setOpenLimiteDialog(true)}>
                            <CreditCard sx={{ mr: 1 }} /> Definir Limite
                          </Button>
                          <Button variant="outlined" color="error" onClick={bloquearCredito}>
                            <Block sx={{ mr: 1 }} /> Bloquear
                          </Button>
                        </Box>
                      </Grid>
                      <Grid xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Status: {statusChip(credito.status)}
                          {credito.dataConcessao && ` | Desde: ${new Date(credito.dataConcessao).toLocaleDateString()}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                      <Typography>Cliente não possui crédito cadastrado</Typography>
                      <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenLimiteDialog(true)}>
                        <CreditCard sx={{ mr: 1 }} /> Definir Limite
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {tabIndex === 2 && (
                <Box>
                  {cobrancasLoading ? <LinearProgress /> : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Documento</TableCell>
                            <TableCell>Valor</TableCell>
                            <TableCell>Vencimento</TableCell>
                            <TableCell>Dias</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cobrancas.map((c: any) => {
                            const atraso = Math.floor(
                              (new Date().getTime() - new Date(c.dataVencimento).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return (
                              <TableRow key={c.id} sx={{ bgcolor: atraso > 30 ? '#fff3e0' : atraso > 0 ? '#ffebee' : 'inherit' }}>
                                <TableCell>{c.documento}</TableCell>
                                <TableCell>R$ {Number(c.valorAtual).toFixed(2)}</TableCell>
                                <TableCell>{new Date(c.dataVencimento).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Chip label={`${atraso > 0 ? atraso : 0}d`}
                                    color={atraso > 30 ? 'error' : atraso > 0 ? 'warning' : 'success'} size="small" />
                                </TableCell>
                                <TableCell>{statusChip(c.status)}</TableCell>
                              </TableRow>
                            );
                          })}
                          {cobrancas.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center">Nenhuma cobrança pendente</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={openLimiteDialog} onClose={() => setOpenLimiteDialog(false)}>
        <DialogTitle>Definir Limite de Crédito</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Limite (R$)" type="number"
            value={novoLimite} onChange={e => setNovoLimite(e.target.value)}
            sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLimiteDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={definirLimite}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
