'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import { Api, Scale, QrCodeScanner, Add, Refresh, Delete } from '@mui/icons-material';
import { integrationApi } from '@/lib/api';

export default function IntegracoesPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [integracoes, setIntegracoes] = useState<any[]>([]);
  const [loadingInt, setLoadingInt] = useState(false);
  const [pesos, setPesos] = useState<any[]>([]);
  const [loadingPesos, setLoadingPesos] = useState(false);
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [loadingSess, setLoadingSess] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [newIntegracao, setNewIntegracao] = useState({ plataforma: 'shopify', url: '', apiKey: '' });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    carregarIntegracoes();
    carregarPesos();
    carregarSessoes();
  }, []);

  async function carregarIntegracoes() {
    setLoadingInt(true);
    try { const { data } = await integrationApi.get('/ecommerce?companyId=1'); setIntegracoes(Array.isArray(data) ? data : []); }
    catch { setIntegracoes([]); }
    finally { setLoadingInt(false); }
  }

  async function carregarPesos() {
    setLoadingPesos(true);
    try { const { data } = await integrationApi.get('/balanca/pesos'); setPesos(data.data || []); }
    catch { setPesos([]); }
    finally { setLoadingPesos(false); }
  }

  async function carregarSessoes() {
    setLoadingSess(true);
    try { const { data } = await integrationApi.get('/coletor/sessoes?companyId=1'); setSessoes(Array.isArray(data) ? data : []); }
    catch { setSessoes([]); }
    finally { setLoadingSess(false); }
  }

  async function criarIntegracao() {
    try {
      await integrationApi.post('/ecommerce', { ...newIntegracao, companyId: '1' });
      setSuccess('Integração criada'); setOpenDialog(false); await carregarIntegracoes();
    } catch { setError('Erro'); }
  }

  async function sincronizar(id: string, tipo: string) {
    try { await integrationApi.post(`/ecommerce/${id}/sincronizar`, { tipo }); setSuccess(`Sincronizado: ${tipo}`); }
    catch { setError('Erro'); }
  }

  async function carregarLogs(id: string) {
    try { const { data } = await integrationApi.get(`/ecommerce/${id}/logs`); setLogs(Array.isArray(data) ? data : []); }
    catch { setLogs([]); }
  }

  async function removerIntegracao(id: string) {
    try { await integrationApi.delete(`/ecommerce/${id}`); setSuccess('Removida'); await carregarIntegracoes(); }
    catch { setError('Erro'); }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
        Integrações
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Api />} label="E-commerce" />
          <Tab icon={<Scale />} label="Balança" />
          <Tab icon={<QrCodeScanner />} label="Coletor" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>Nova Integração</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarIntegracoes}>Atualizar</Button>
            </Box>
            {loadingInt ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Plataforma</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Última Sinc</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {integracoes.map((i: any) => (
                      <TableRow key={i.id}>
                        <TableCell><Chip label={i.plataforma} color="primary" size="small" /></TableCell>
                        <TableCell>{i.url}</TableCell>
                        <TableCell><Chip label={i.ativo ? 'Ativo' : 'Inativo'} color={i.ativo ? 'success' : 'default'} size="small" /></TableCell>
                        <TableCell>{i.ultimaSinc ? new Date(i.ultimaSinc).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => sincronizar(i.id, 'PRODUTO')}>Produtos</Button>
                          <Button size="small" onClick={() => sincronizar(i.id, 'ESTOQUE')}>Estoque</Button>
                          <Button size="small" onClick={() => { carregarLogs(i.id); }}>Logs</Button>
                          <IconButton size="small" color="error" onClick={() => removerIntegracao(i.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {integracoes.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma integração configurada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {logs.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>Últimos Logs</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Tipo</TableCell><TableCell>Direção</TableCell><TableCell>Status</TableCell><TableCell>Registros</TableCell><TableCell>Data</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.tipo}</TableCell>
                        <TableCell><Chip label={l.direcao} size="small" /></TableCell>
                        <TableCell><Chip label={l.status} color={l.status === 'SUCESSO' ? 'success' : 'error'} size="small" /></TableCell>
                        <TableCell>{l.registros}</TableCell>
                        <TableCell>{new Date(l.dataInicio).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarPesos}>Atualizar</Button>
            </Box>
            {loadingPesos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Balança</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Peso</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Data/Hora</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pesos.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.balancaId.slice(0, 8)}</TableCell>
                        <TableCell>{p.produtoId?.slice(0, 8) || '-'}</TableCell>
                        <TableCell>{Number(p.peso).toFixed(3)}</TableCell>
                        <TableCell>{p.unidade}</TableCell>
                        <TableCell>{new Date(p.dataHora).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {pesos.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhum peso registrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarSessoes}>Atualizar</Button>
            </Box>
            {loadingSess ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Início</TableCell>
                      <TableCell>Leituras</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessoes.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell><Chip label={s.tipo} size="small" /></TableCell>
                        <TableCell>{s.usuarioId.slice(0, 8)}</TableCell>
                        <TableCell><Chip label={s.status} color={s.status === 'ABERTA' ? 'warning' : 'success'} size="small" /></TableCell>
                        <TableCell>{new Date(s.inicio).toLocaleString()}</TableCell>
                        <TableCell>{s.totalLidos}</TableCell>
                      </TableRow>
                    ))}
                    {sessoes.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma sessão de coleta</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nova Integração E-commerce</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Plataforma" value={newIntegracao.plataforma} sx={{ mt: 1 }}
            onChange={e => setNewIntegracao({ ...newIntegracao, plataforma: e.target.value })}>
            <MenuItem value="shopify">Shopify</MenuItem>
            <MenuItem value="woocommerce">WooCommerce</MenuItem>
            <MenuItem value="magento">Magento</MenuItem>
            <MenuItem value="custom">API Customizada</MenuItem>
          </TextField>
          <TextField fullWidth label="URL da Loja" value={newIntegracao.url} sx={{ mt: 2 }}
            onChange={e => setNewIntegracao({ ...newIntegracao, url: e.target.value })} />
          <TextField fullWidth label="API Key" value={newIntegracao.apiKey} sx={{ mt: 2 }}
            onChange={e => setNewIntegracao({ ...newIntegracao, apiKey: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarIntegracao}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
