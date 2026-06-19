'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import {
  Inventory, TransferWithinAStation, Assignment, TrendingUp, Add, Refresh, CheckCircle, Cancel, Send,
} from '@mui/icons-material';
import { inventoryApi } from '@/lib/api';

export default function EstoquePage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [inventarios, setInventarios] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [loadingTransf, setLoadingTransf] = useState(false);
  const [curvaAbc, setCurvaAbc] = useState<any[]>([]);
  const [loadingAbc, setLoadingAbc] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loadingProd, setLoadingProd] = useState(false);

  const [openInvDialog, setOpenInvDialog] = useState(false);
  const [openTransfDialog, setOpenTransfDialog] = useState(false);
  const [newInv, setNewInv] = useState({ tipo: 'COMPLETO', setor: '', responsavelId: '1' });
  const [newTransf, setNewTransf] = useState({ origemUnidadeId: '1', destinoUnidadeId: '2', itens: '[]' });

  const statusInvChip = (s: string) => {
    const m: Record<string, any> = {
      ABERTO: <Chip label="Aberto" color="info" size="small" />,
      EM_ANDAMENTO: <Chip label="Em Andamento" color="warning" size="small" />,
      FECHADO: <Chip label="Fechado" color="success" size="small" />,
      AJUSTADO: <Chip label="Ajustado" color="default" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const statusTransfChip = (s: string) => {
    const m: Record<string, any> = {
      PENDENTE: <Chip label="Pendente" color="warning" size="small" />,
      EXPEDIDA: <Chip label="Expedida" color="info" size="small" />,
      EM_TRANSITO: <Chip label="Em Trânsito" color="info" size="small" />,
      RECEBIDA: <Chip label="Recebida" color="success" size="small" />,
      CANCELADA: <Chip label="Cancelada" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const abcChip = (c: string) => {
    const colors: Record<string, any> = { A: 'error', B: 'warning', C: 'success' };
    return <Chip label={c} color={colors[c] || 'default'} size="small" />;
  };

  useEffect(() => {
    carregarInventarios();
    carregarTransferencias();
    carregarCurvaAbc();
    carregarProdutos();
  }, []);

  async function carregarInventarios() {
    setLoadingInv(true);
    try { const { data } = await inventoryApi.get('/inventarios?limit=20'); setInventarios(data.data || data || []); }
    catch { setInventarios([]); }
    finally { setLoadingInv(false); }
  }

  async function carregarTransferencias() {
    setLoadingTransf(true);
    try { const { data } = await inventoryApi.get('/transferencias?limit=20'); setTransferencias(data.data || data || []); }
    catch { setTransferencias([]); }
    finally { setLoadingTransf(false); }
  }

  async function carregarCurvaAbc() {
    setLoadingAbc(true);
    try { const { data } = await inventoryApi.get('/curva-abc?limit=30'); setCurvaAbc(data.data || data || []); }
    catch { setCurvaAbc([]); }
    finally { setLoadingAbc(false); }
  }

  async function carregarProdutos() {
    setLoadingProd(true);
    try {
      const { data } = await inventoryApi.get('/produtos?limite=10&estoqueBaixo=true');
      setProdutos(data.data || []);
    } catch { setProdutos([]); }
    finally { setLoadingProd(false); }
  }

  async function criarInventario() {
    try {
      await inventoryApi.post('/inventarios', { ...newInv, companyId: '1', unidadeId: '1' });
      setSuccess('Inventário criado');
      setOpenInvDialog(false);
      await carregarInventarios();
    } catch { setError('Erro ao criar inventário'); }
  }

  async function criarTransferencia() {
    try {
      await inventoryApi.post('/transferencias', {
        ...newTransf, companyId: '1', responsavelOrigemId: '1',
        itens: JSON.parse(newTransf.itens),
      });
      setSuccess('Transferência criada');
      setOpenTransfDialog(false);
      await carregarTransferencias();
    } catch { setError('Erro ao criar transferência'); }
  }

  async function expedirTransferencia(id: string) {
    try { await inventoryApi.patch(`/transferencias/${id}/expedir`, {}); setSuccess('Expedida'); await carregarTransferencias(); }
    catch { setError('Erro'); }
  }

  async function receberTransferencia(id: string) {
    try { await inventoryApi.patch(`/transferencias/${id}/receber`, {}); setSuccess('Recebida'); await carregarTransferencias(); }
    catch { setError('Erro'); }
  }

  async function calcularAbc() {
    try {
      await inventoryApi.post('/curva-abc/calcular', { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), unidadeId: '1' });
      setSuccess('Curva ABC calculada');
      await carregarCurvaAbc();
    } catch { setError('Erro ao calcular'); }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
        Estoque Avançado
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{inventarios.length}</Typography>
            <Typography variant="body2" color="text.secondary">Inventários</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{transferencias.filter(t => t.status !== 'RECEBIDA' && t.status !== 'CANCELADA').length}</Typography>
            <Typography variant="body2" color="text.secondary">Transferências Ativas</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{curvaAbc.filter(c => c.classificacao === 'A').length}</Typography>
            <Typography variant="body2" color="text.secondary">Produtos Classe A</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h4" fontWeight="bold" color="error">{produtos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Estoque Baixo</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
          <Tab icon={<Assignment />} label="Inventários" />
          <Tab icon={<TransferWithinAStation />} label="Transferências" />
          <Tab icon={<TrendingUp />} label="Curva ABC" />
        </Tabs>

        {tabIndex === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenInvDialog(true)}>
                Novo Inventário
              </Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarInventarios}>
                Atualizar
              </Button>
            </Box>
            {loadingInv ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Setor</TableCell>
                      <TableCell>Data Início</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Divergências</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventarios.map((i: any) => (
                      <TableRow key={i.id}>
                        <TableCell><Chip label={i.tipo} size="small" /></TableCell>
                        <TableCell>{i.setor || '-'}</TableCell>
                        <TableCell>{i.dataInicio ? new Date(i.dataInicio).toLocaleString() : '-'}</TableCell>
                        <TableCell>{statusInvChip(i.status)}</TableCell>
                        <TableCell>
                          <Chip label={i.divergencias || 0} color={i.divergencias > 0 ? 'warning' : 'success'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {inventarios.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">Nenhum inventário encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenTransfDialog(true)}>
                Nova Transferência
              </Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarTransferencias}>
                Atualizar
              </Button>
            </Box>
            {loadingTransf ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Origem</TableCell>
                      <TableCell>Destino</TableCell>
                      <TableCell>Criação</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferencias.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.origemUnidadeId}</TableCell>
                        <TableCell>{t.destinoUnidadeId}</TableCell>
                        <TableCell>{t.dataCriacao ? new Date(t.dataCriacao).toLocaleString() : '-'}</TableCell>
                        <TableCell>{statusTransfChip(t.status)}</TableCell>
                        <TableCell>
                          {t.status === 'PENDENTE' && (
                            <IconButton color="primary" size="small" onClick={() => expedirTransferencia(t.id)}>
                              <Send />
                            </IconButton>
                          )}
                          {t.status === 'EXPEDIDA' && (
                            <IconButton color="success" size="small" onClick={() => receberTransferencia(t.id)}>
                              <CheckCircle />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transferencias.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">Nenhuma transferência encontrada</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tabIndex === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<TrendingUp />} onClick={calcularAbc}>
                Calcular Curva ABC
              </Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarCurvaAbc}>
                Atualizar
              </Button>
            </Box>
            {loadingAbc ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Qtd Vendida</TableCell>
                      <TableCell>Valor Vendido</TableCell>
                      <TableCell>% Faturamento</TableCell>
                      <TableCell>% Acumulado</TableCell>
                      <TableCell>Classificação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {curvaAbc.sort((a, b) => (a.percentualAcumulado || 0) - (b.percentualAcumulado || 0)).map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.produto?.descricao || c.produtoId || '-'}</TableCell>
                        <TableCell>{Number(c.quantidadeVendida || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(c.valorVendido || 0).toFixed(2)}</TableCell>
                        <TableCell>{Number(c.percentualFaturamento || 0).toFixed(1)}%</TableCell>
                        <TableCell>{Number(c.percentualAcumulado || 0).toFixed(1)}%</TableCell>
                        <TableCell>{abcChip(c.classificacao)}</TableCell>
                      </TableRow>
                    ))}
                    {curvaAbc.length === 0 && (
                      <TableRow><TableCell colSpan={6} align="center">Nenhum dado. Clique em Calcular Curva ABC</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openInvDialog} onClose={() => setOpenInvDialog(false)}>
        <DialogTitle>Novo Inventário</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Tipo" value={newInv.tipo} sx={{ mt: 1 }}
            onChange={e => setNewInv({ ...newInv, tipo: e.target.value })}>
            <MenuItem value="COMPLETO">Completo</MenuItem>
            <MenuItem value="PARCIAL">Parcial</MenuItem>
            <MenuItem value="ROTATIVO">Rotativo</MenuItem>
            <MenuItem value="SETOR">Setor</MenuItem>
          </TextField>
          <TextField fullWidth label="Setor" value={newInv.setor} sx={{ mt: 2 }}
            onChange={e => setNewInv({ ...newInv, setor: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarInventario}>Criar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTransfDialog} onClose={() => setOpenTransfDialog(false)}>
        <DialogTitle>Nova Transferência</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Unidade Origem ID" value={newTransf.origemUnidadeId} sx={{ mt: 1 }}
            onChange={e => setNewTransf({ ...newTransf, origemUnidadeId: e.target.value })} />
          <TextField fullWidth label="Unidade Destino ID" value={newTransf.destinoUnidadeId} sx={{ mt: 2 }}
            onChange={e => setNewTransf({ ...newTransf, destinoUnidadeId: e.target.value })} />
          <TextField fullWidth label="Itens (JSON)" value={newTransf.itens} sx={{ mt: 2 }}
            onChange={e => setNewTransf({ ...newTransf, itens: e.target.value })} multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransfDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarTransferencia}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
