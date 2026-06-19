'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Rating,
} from '@mui/material';
import {
  ShoppingCart, Assessment, Group, Star, Add, Refresh, CheckCircle, Cancel, Send, ThumbUp, ThumbDown,
} from '@mui/icons-material';
import { comprasApi, inventoryApi } from '@/lib/api';

export default function ComprasPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [loadingCotacoes, setLoadingCotacoes] = useState(false);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loadingForn, setLoadingForn] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loadingAv, setLoadingAv] = useState(false);
  const [curvaAbc, setCurvaAbc] = useState<any[]>([]);

  const [openPedido, setOpenPedido] = useState(false);
  const [openCotacao, setOpenCotacao] = useState(false);
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [newFornecedor, setNewFornecedor] = useState({ nome: '', cnpj: '', email: '', telefone: '' });

  const statusPedidoChip = (s: string) => {
    const m: Record<string, any> = {
      RASCUNHO: <Chip label="Rascunho" size="small" />,
      EM_APROVACAO: <Chip label="Em Aprovação" color="warning" size="small" />,
      APROVADO: <Chip label="Aprovado" color="success" size="small" />,
      REJEITADO: <Chip label="Rejeitado" color="error" size="small" />,
      ENVIADO: <Chip label="Enviado" color="info" size="small" />,
      PARCIAL: <Chip label="Parcial" color="secondary" size="small" />,
      RECEBIDO: <Chip label="Recebido" color="success" size="small" />,
      CANCELADO: <Chip label="Cancelado" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const statusCotacaoChip = (s: string) => {
    const m: Record<string, any> = {
      RASCUNHO: <Chip label="Rascunho" size="small" />,
      ABERTA: <Chip label="Aberta" color="info" size="small" />,
      FECHADA: <Chip label="Fechada" color="warning" size="small" />,
      VENCEDOR_SELECIONADO: <Chip label="Vencedor" color="success" size="small" />,
      CANCELADA: <Chip label="Cancelada" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  useEffect(() => {
    carregarPedidos();
    carregarCotacoes();
    carregarFornecedores();
    carregarAvaliacoes();
    carregarCurvaAbc();
  }, []);

  async function carregarPedidos() {
    setLoadingPedidos(true);
    try { const { data } = await comprasApi.get('/pedidos-compra?limite=20'); setPedidos(data.data || []); }
    catch { setPedidos([]); }
    finally { setLoadingPedidos(false); }
  }

  async function carregarCotacoes() {
    setLoadingCotacoes(true);
    try { const { data } = await comprasApi.get('/cotacoes?limite=20'); setCotacoes(data.data || []); }
    catch { setCotacoes([]); }
    finally { setLoadingCotacoes(false); }
  }

  async function carregarFornecedores() {
    setLoadingForn(true);
    try { const { data } = await comprasApi.get('/fornecedores?limite=20'); setFornecedores(data.data || []); }
    catch { setFornecedores([]); }
    finally { setLoadingForn(false); }
  }

  async function carregarAvaliacoes() {
    setLoadingAv(true);
    try { const { data } = await comprasApi.get('/avaliacoes?limite=20'); setAvaliacoes(data.data || []); }
    catch { setAvaliacoes([]); }
    finally { setLoadingAv(false); }
  }

  async function carregarCurvaAbc() {
    try { const { data } = await inventoryApi.get('/curva-abc?limit=10'); setCurvaAbc(data.data || data || []); }
    catch { setCurvaAbc([]); }
  }

  async function criarFornecedor() {
    try {
      await comprasApi.post('/fornecedores', { ...newFornecedor, companyId: '1' });
      setSuccess('Fornecedor criado');
      setOpenFornecedor(false);
      setNewFornecedor({ nome: '', cnpj: '', email: '', telefone: '' });
      await carregarFornecedores();
    } catch { setError('Erro ao criar fornecedor'); }
  }

  async function aprovarPedido(id: string) {
    try { await comprasApi.post(`/pedidos-compra/${id}/aprovar`, {}); setSuccess('Aprovado'); await carregarPedidos(); }
    catch { setError('Erro'); }
  }

  async function rejeitarPedido(id: string) {
    try { await comprasApi.post(`/pedidos-compra/${id}/rejeitar`, { motivo: 'Rejeitado' }); setSuccess('Rejeitado'); await carregarPedidos(); }
    catch { setError('Erro'); }
  }

  async function enviarPedido(id: string) {
    try { await comprasApi.post(`/pedidos-compra/${id}/enviar-fornecedor`, {}); setSuccess('Enviado'); await carregarPedidos(); }
    catch { setError('Erro'); }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
        Compras Avançado
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{pedidos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Pedidos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{cotacoes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Cotações</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{fornecedores.length}</Typography>
            <Typography variant="body2" color="text.secondary">Fornecedores</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{avaliacoes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Avaliações</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<ShoppingCart />} label="Pedidos" />
          <Tab icon={<Assessment />} label="Cotações" />
          <Tab icon={<Group />} label="Fornecedores" />
          <Tab icon={<Star />} label="Ranking" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />}>Novo Pedido</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarPedidos}>Atualizar</Button>
            </Box>
            {loadingPedidos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidos.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.numero || p.id.slice(0, 8)}</TableCell>
                        <TableCell>{p.fornecedor?.nome || p.fornecedorId}</TableCell>
                        <TableCell>R$ {Number(p.total || 0).toFixed(2)}</TableCell>
                        <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{statusPedidoChip(p.status)}</TableCell>
                        <TableCell>
                          {p.status === 'EM_APROVACAO' && (
                            <>
                              <IconButton color="success" size="small" onClick={() => aprovarPedido(p.id)}><ThumbUp /></IconButton>
                              <IconButton color="error" size="small" onClick={() => rejeitarPedido(p.id)}><ThumbDown /></IconButton>
                            </>
                          )}
                          {p.status === 'APROVADO' && (
                            <IconButton color="info" size="small" onClick={() => enviarPedido(p.id)}><Send /></IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {pedidos.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhum pedido</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />}>Nova Cotação</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarCotacoes}>Atualizar</Button>
            </Box>
            {loadingCotacoes ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Data Abertura</TableCell>
                      <TableCell>Data Fechamento</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cotacoes.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.descricao || c.id.slice(0, 8)}</TableCell>
                        <TableCell>{c.dataAbertura ? new Date(c.dataAbertura).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{c.dataFechamento ? new Date(c.dataFechamento).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{statusCotacaoChip(c.status)}</TableCell>
                      </TableRow>
                    ))}
                    {cotacoes.length === 0 && <TableRow><TableCell colSpan={4} align="center">Nenhuma cotação</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenFornecedor(true)}>Novo Fornecedor</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarFornecedores}>Atualizar</Button>
            </Box>
            {loadingForn ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Prazo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fornecedores.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell>{f.nome}</TableCell>
                        <TableCell>{f.cnpj}</TableCell>
                        <TableCell>{f.email}</TableCell>
                        <TableCell>{f.telefone}</TableCell>
                        <TableCell>{f.prazoEntrega ? `${f.prazoEntrega}d` : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {fornecedores.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhum fornecedor</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarAvaliacoes}>Atualizar</Button>
            </Box>
            {loadingAv ? <LinearProgress /> : (
              <Grid container spacing={2}>
                <Grid xs={12} md={8}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Fornecedor</TableCell>
                          <TableCell>Prazo</TableCell>
                          <TableCell>Qualidade</TableCell>
                          <TableCell>Preço</TableCell>
                          <TableCell>Nota Global</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...avaliacoes].sort((a, b) => (b.notaGlobal || 0) - (a.notaGlobal || 0)).map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.fornecedor?.nome || a.fornecedorId}</TableCell>
                            <TableCell><Rating value={a.notaPrazo || 0} readOnly size="small" max={5} /></TableCell>
                            <TableCell><Rating value={a.notaQualidade || 0} readOnly size="small" max={5} /></TableCell>
                            <TableCell><Rating value={a.notaPreco || 0} readOnly size="small" max={5} /></TableCell>
                            <TableCell>
                              <Chip label={Number(a.notaGlobal || 0).toFixed(1)} color={
                                a.notaGlobal >= 4 ? 'success' : a.notaGlobal >= 3 ? 'warning' : 'error'
                              } size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                        {avaliacoes.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma avaliação</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card sx={{ p: 2, bgcolor: '#fff3e0' }}>
                    <Typography variant="h6" fontWeight="bold" mb={1}>Curva ABC (Top 10)</Typography>
                    {curvaAbc.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Produto</TableCell>
                            <TableCell>Classe</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {curvaAbc.slice(0, 10).map((c: any) => (
                            <TableRow key={c.id}>
                              <TableCell>{c.produto?.descricao || c.produtoId?.slice(0, 8)}</TableCell>
                              <TableCell>
                                <Chip label={c.classificacao} size="small" color={
                                  c.classificacao === 'A' ? 'error' : c.classificacao === 'B' ? 'warning' : 'success'
                                } />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Calcule no módulo de Estoque</Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openFornecedor} onClose={() => setOpenFornecedor(false)}>
        <DialogTitle>Novo Fornecedor</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={newFornecedor.nome} sx={{ mt: 1 }}
            onChange={e => setNewFornecedor({ ...newFornecedor, nome: e.target.value })} />
          <TextField fullWidth label="CNPJ" value={newFornecedor.cnpj} sx={{ mt: 2 }}
            onChange={e => setNewFornecedor({ ...newFornecedor, cnpj: e.target.value })} />
          <TextField fullWidth label="Email" value={newFornecedor.email} sx={{ mt: 2 }}
            onChange={e => setNewFornecedor({ ...newFornecedor, email: e.target.value })} />
          <TextField fullWidth label="Telefone" value={newFornecedor.telefone} sx={{ mt: 2 }}
            onChange={e => setNewFornecedor({ ...newFornecedor, telefone: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFornecedor(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarFornecedor}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
