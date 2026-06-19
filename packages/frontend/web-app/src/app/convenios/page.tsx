'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  Handshake, Description, Receipt, Add, Refresh, Edit, Delete, CheckCircle, Cancel,
  PendingActions, AttachMoney,
} from '@mui/icons-material';
import api from '@/lib/api';

const CONVENIOS_BASE = '/convenios/convenios';

export default function ConveniosPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [convenios, setConvenios] = useState<any[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loadingFaturas, setLoadingFaturas] = useState(false);

  const [openConvDialog, setOpenConvDialog] = useState(false);
  const [editConv, setEditConv] = useState<any>(null);
  const [convForm, setConvForm] = useState({
    codigo: '', nome: '', cnpj: '', contato: '', telefone: '', email: '',
    limiteGlobal: 0, descontoPadrao: 0, prazoPagamento: 30, tipoFaturamento: 'MENSAL',
  });

  const [selectedConvenio, setSelectedConvenio] = useState('');

  const [openContratoDialog, setOpenContratoDialog] = useState(false);
  const [contratoForm, setContratoForm] = useState({
    convenioId: '', numero: '', dataInicio: '', dataFim: '', valor: 0, descricao: '',
  });

  const [openFaturaDialog, setOpenFaturaDialog] = useState(false);
  const [faturaForm, setFaturaForm] = useState({
    convenioId: '', numero: '', valor: 0, dataVencimento: '', dataPagamento: '', observacao: '',
  });
  const [pagamentoForm, setPagamentoForm] = useState({ dataPagamento: '', valorPago: 0 });

  useEffect(() => {
    carregarConvenios();
  }, []);

  useEffect(() => {
    if (selectedConvenio && tab === 1) carregarContratos(selectedConvenio);
    if (selectedConvenio && tab === 2) carregarFaturas(selectedConvenio);
  }, [selectedConvenio, tab]);

  async function carregarConvenios() {
    setLoadingConv(true);
    try { const { data } = await api.get(CONVENIOS_BASE); setConvenios(Array.isArray(data) ? data : []); }
    catch { setConvenios([]); }
    finally { setLoadingConv(false); }
  }

  async function carregarContratos(convenioId: string) {
    setLoadingContratos(true);
    try { const { data } = await api.get(`/convenios/contratos?convenioId=${convenioId}`); setContratos(Array.isArray(data) ? data : []); }
    catch { setContratos([]); }
    finally { setLoadingContratos(false); }
  }

  async function carregarFaturas(convenioId: string) {
    setLoadingFaturas(true);
    try { const { data } = await api.get(`/convenios/faturas?convenioId=${convenioId}`); setFaturas(Array.isArray(data) ? data : []); }
    catch { setFaturas([]); }
    finally { setLoadingFaturas(false); }
  }

  async function salvarConvenio() {
    try {
      if (editConv) {
        await api.patch(`${CONVENIOS_BASE}/${editConv.id}`, convForm);
        setSuccess('Convênio atualizado');
      } else {
        await api.post(CONVENIOS_BASE, convForm);
        setSuccess('Convênio criado');
      }
      setOpenConvDialog(false);
      setEditConv(null);
      await carregarConvenios();
    } catch { setError('Erro ao salvar convênio'); }
  }

  async function excluirConvenio(id: string) {
    if (!confirm('Excluir este convênio?')) return;
    try { await api.delete(`${CONVENIOS_BASE}/${id}`); setSuccess('Convênio excluído'); await carregarConvenios(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarContrato() {
    try {
      await api.post('/convenios/contratos', contratoForm);
      setSuccess('Contrato criado');
      setOpenContratoDialog(false);
      await carregarContratos(contratoForm.convenioId);
    } catch { setError('Erro ao salvar contrato'); }
  }

  async function salvarFatura() {
    try {
      await api.post('/convenios/faturas', faturaForm);
      setSuccess('Fatura registrada');
      setOpenFaturaDialog(false);
      await carregarFaturas(faturaForm.convenioId);
    } catch { setError('Erro ao registrar fatura'); }
  }

  async function pagarFatura(id: string, convenioId: string) {
    try {
      await api.patch(`/convenios/faturas/${id}/pagar`, pagamentoForm);
      setSuccess('Fatura paga');
      await carregarFaturas(convenioId);
    } catch { setError('Erro ao pagar fatura'); }
  }

  function abrirEditarConv(conv: any) {
    setEditConv(conv);
    setConvForm({
      codigo: conv.codigo, nome: conv.nome, cnpj: conv.cnpj, contato: conv.contato || '',
      telefone: conv.telefone || '', email: conv.email || '', limiteGlobal: conv.limiteGlobal || 0,
      descontoPadrao: conv.descontoPadrao || 0, prazoPagamento: conv.prazoPagamento || 30,
      tipoFaturamento: conv.tipoFaturamento || 'MENSAL',
    });
    setOpenConvDialog(true);
  }

  const statusFaturaChip = (s: string) => {
    const m: Record<string, any> = {
      PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
      PAGA: <Chip label="Paga" color="success" size="small" />,
      CANCELADA: <Chip label="Cancelada" size="small" />,
      VENCIDA: <Chip label="Vencida" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const statusContratoChip = (s: string) => {
    const m: Record<string, any> = {
      ATIVO: <Chip label="Ativo" color="success" size="small" />,
      ENCERRADO: <Chip label="Encerrado" size="small" />,
      SUSPENSO: <Chip label="Suspenso" color="warning" size="small" />,
      CANCELADO: <Chip label="Cancelado" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const totalFaturamento = faturas
    .filter((f: any) => f.status === 'PAGA')
    .reduce((acc: number, f: any) => acc + Number(f.valor || 0), 0);

  const faturasPendentes = faturas.filter((f: any) => f.status === 'PENDENTE' || f.status === 'VENCIDA');
  const contratosAtivos = contratos.filter((c: any) => c.status === 'ATIVO');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Handshake sx={{ mr: 1, verticalAlign: 'middle' }} />
        Convênios
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{convenios.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Convênios</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{contratosAtivos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Contratos Ativos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{faturasPendentes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Faturas Pendentes</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalFaturamento.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Faturamento Total</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Handshake />} label="Convênios" />
          <Tab icon={<Description />} label="Contratos" />
          <Tab icon={<Receipt />} label="Faturas" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditConv(null); setConvForm({ codigo: '', nome: '', cnpj: '', contato: '', telefone: '', email: '', limiteGlobal: 0, descontoPadrao: 0, prazoPagamento: 30, tipoFaturamento: 'MENSAL' }); setOpenConvDialog(true); }}>Novo Convênio</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarConvenios}>Atualizar</Button>
            </Box>
            {loadingConv ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Contato</TableCell>
                      <TableCell>Limite Global</TableCell>
                      <TableCell>Desconto</TableCell>
                      <TableCell>Prazo Pag.</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {convenios.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell><Chip label={c.codigo} color="primary" size="small" /></TableCell>
                        <TableCell>{c.nome}</TableCell>
                        <TableCell>{c.cnpj}</TableCell>
                        <TableCell>{c.contato || '-'}</TableCell>
                        <TableCell>R$ {Number(c.limiteGlobal || 0).toFixed(2)}</TableCell>
                        <TableCell>{Number(c.descontoPadrao || 0).toFixed(2)}%</TableCell>
                        <TableCell>{c.prazoPagamento || '-'} dias</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarConv(c)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirConvenio(c.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {convenios.length === 0 && <TableRow><TableCell colSpan={8} align="center">Nenhum convênio cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField select label="Convênio" value={selectedConvenio} onChange={e => setSelectedConvenio(e.target.value)} sx={{ minWidth: 300 }}>
                {convenios.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
              </TextField>
              {selectedConvenio && (
                <Button variant="contained" startIcon={<Add />} onClick={() => { setContratoForm({ convenioId: selectedConvenio, numero: '', dataInicio: '', dataFim: '', valor: 0, descricao: '' }); setOpenContratoDialog(true); }}>Novo Contrato</Button>
              )}
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => carregarContratos(selectedConvenio)}>Atualizar</Button>
            </Box>
            {loadingContratos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Início</TableCell>
                      <TableCell>Fim</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contratos.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.numero}</TableCell>
                        <TableCell>{c.descricao || '-'}</TableCell>
                        <TableCell>R$ {Number(c.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{c.dataInicio ? new Date(c.dataInicio).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{c.dataFim ? new Date(c.dataFim).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{statusContratoChip(c.status)}</TableCell>
                      </TableRow>
                    ))}
                    {!selectedConvenio && <TableRow><TableCell colSpan={6} align="center">Selecione um convênio</TableCell></TableRow>}
                    {selectedConvenio && contratos.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhum contrato cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField select label="Convênio" value={selectedConvenio} onChange={e => setSelectedConvenio(e.target.value)} sx={{ minWidth: 300 }}>
                {convenios.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
              </TextField>
              {selectedConvenio && (
                <Button variant="contained" startIcon={<Add />} onClick={() => { setFaturaForm({ convenioId: selectedConvenio, numero: '', valor: 0, dataVencimento: '', dataPagamento: '', observacao: '' }); setOpenFaturaDialog(true); }}>Nova Fatura</Button>
              )}
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => carregarFaturas(selectedConvenio)}>Atualizar</Button>
            </Box>
            {loadingFaturas ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell>Pagamento</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faturas.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell>{f.numero}</TableCell>
                        <TableCell>R$ {Number(f.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{f.dataVencimento ? new Date(f.dataVencimento).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{f.dataPagamento ? new Date(f.dataPagamento).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{statusFaturaChip(f.status)}</TableCell>
                        <TableCell>
                          {(f.status === 'PENDENTE' || f.status === 'VENCIDA') && (
                            <Button size="small" color="success" startIcon={<AttachMoney />}
                              onClick={() => { setPagamentoForm({ dataPagamento: new Date().toISOString().split('T')[0], valorPago: Number(f.valor) }); pagarFatura(f.id, selectedConvenio); }}>
                            Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!selectedConvenio && <TableRow><TableCell colSpan={6} align="center">Selecione um convênio</TableCell></TableRow>}
                    {selectedConvenio && faturas.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhuma fatura registrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openConvDialog} onClose={() => setOpenConvDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editConv ? 'Editar Convênio' : 'Novo Convênio'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Código" value={convForm.codigo} sx={{ mt: 1 }} onChange={e => setConvForm({ ...convForm, codigo: e.target.value })} />
          <TextField fullWidth label="Nome" value={convForm.nome} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, nome: e.target.value })} />
          <TextField fullWidth label="CNPJ" value={convForm.cnpj} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, cnpj: e.target.value })} />
          <TextField fullWidth label="Contato" value={convForm.contato} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, contato: e.target.value })} />
          <TextField fullWidth label="Telefone" value={convForm.telefone} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, telefone: e.target.value })} />
          <TextField fullWidth label="Email" value={convForm.email} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, email: e.target.value })} />
          <TextField fullWidth label="Limite Global (R$)" type="number" value={convForm.limiteGlobal} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, limiteGlobal: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Desconto Padrão (%)" type="number" value={convForm.descontoPadrao} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, descontoPadrao: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Prazo Pagamento (dias)" type="number" value={convForm.prazoPagamento} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, prazoPagamento: parseInt(e.target.value) || 0 })} />
          <TextField select fullWidth label="Tipo Faturamento" value={convForm.tipoFaturamento} sx={{ mt: 2 }} onChange={e => setConvForm({ ...convForm, tipoFaturamento: e.target.value })}>
            <MenuItem value="MENSAL">Mensal</MenuItem>
            <MenuItem value="QUINZENAL">Quinzenal</MenuItem>
            <MenuItem value="SEMANAL">Semanal</MenuItem>
            <MenuItem value="POR_CONSUMO">Por Consumo</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConvDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarConvenio}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openContratoDialog} onClose={() => setOpenContratoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Contrato</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Número" value={contratoForm.numero} sx={{ mt: 1 }} onChange={e => setContratoForm({ ...contratoForm, numero: e.target.value })} />
          <TextField fullWidth label="Data Início" type="date" value={contratoForm.dataInicio} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Fim" type="date" value={contratoForm.dataFim} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Valor (R$)" type="number" value={contratoForm.valor} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, valor: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Descrição" value={contratoForm.descricao} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, descricao: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContratoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarContrato}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFaturaDialog} onClose={() => setOpenFaturaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Fatura</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Número" value={faturaForm.numero} sx={{ mt: 1 }} onChange={e => setFaturaForm({ ...faturaForm, numero: e.target.value })} />
          <TextField fullWidth label="Valor (R$)" type="number" value={faturaForm.valor} sx={{ mt: 2 }} onChange={e => setFaturaForm({ ...faturaForm, valor: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Data Vencimento" type="date" value={faturaForm.dataVencimento} sx={{ mt: 2 }} onChange={e => setFaturaForm({ ...faturaForm, dataVencimento: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Observação" value={faturaForm.observacao} sx={{ mt: 2 }} onChange={e => setFaturaForm({ ...faturaForm, observacao: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFaturaDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarFatura}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
