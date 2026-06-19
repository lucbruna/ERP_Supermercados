'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Grid, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import {
  Receipt, Description, AccountTree, Assessment, Add, Refresh, Cancel, CheckCircle,
} from '@mui/icons-material';
import { fiscalApi } from '@/lib/api';

export default function FiscalPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cfops, setCfops] = useState<any[]>([]);
  const [loadingCfop, setLoadingCfop] = useState(false);
  const [nfes, setNfes] = useState<any[]>([]);
  const [loadingNfe, setLoadingNfe] = useState(false);
  const [nfces, setNfces] = useState<any[]>([]);
  const [loadingNfce, setLoadingNfce] = useState(false);
  const [spedFiscal, setSpedFiscal] = useState<any[]>([]);
  const [spedPis, setSpedPis] = useState<any[]>([]);
  const [loadingSped, setLoadingSped] = useState(false);

  const [openCfop, setOpenCfop] = useState(false);
  const [openNfe, setOpenNfe] = useState(false);
  const [openSped, setOpenSped] = useState(false);
  const [newCfop, setNewCfop] = useState({ codigo: '', descricao: '', tipo: 'ENTRADA' });
  const [newNfe, setNewNfe] = useState({ numero: 0, chaveAcesso: '', dataEmissao: '', fornecedorCpfCnpj: '', fornecedorNome: '', cfopId: '', valorNota: 0 });
  const [spedPeriodo, setSpedPeriodo] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });

  const statusNfeChip = (s: string) => {
    const m: Record<string, any> = {
      AUTORIZADA: <Chip label="Autorizada" color="success" size="small" />,
      DENEGADA: <Chip label="Denegada" color="error" size="small" />,
      CANCELADA: <Chip label="Cancelada" size="small" />,
      EM_DIGITACAO: <Chip label="Em Digitação" color="info" size="small" />,
      REJEITADA: <Chip label="Rejeitada" color="warning" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const statusSpedChip = (s: string) => {
    const m: Record<string, any> = {
      EM_GERACAO: <Chip label="Gerando..." color="info" size="small" />,
      GERADO: <Chip label="Gerado" color="success" size="small" />,
      ENTREGUE: <Chip label="Entregue" color="default" size="small" />,
      ERRO: <Chip label="Erro" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  useEffect(() => {
    carregarCfops();
    carregarNfes();
    carregarNfces();
    carregarSped();
  }, []);

  async function carregarCfops() {
    setLoadingCfop(true);
    try { const { data } = await fiscalApi.get('/cfop'); setCfops(Array.isArray(data) ? data : []); }
    catch { setCfops([]); }
    finally { setLoadingCfop(false); }
  }

  async function carregarNfes() {
    setLoadingNfe(true);
    try { const { data } = await fiscalApi.get('/nfe/entrada?limite=20'); setNfes(data.data || []); }
    catch { setNfes([]); }
    finally { setLoadingNfe(false); }
  }

  async function carregarNfces() {
    setLoadingNfce(true);
    try { const { data } = await fiscalApi.get('/nfce?limite=20'); setNfces(data.data || []); }
    catch { setNfces([]); }
    finally { setLoadingNfce(false); }
  }

  async function carregarSped() {
    setLoadingSped(true);
    try {
      const [f, p] = await Promise.all([
        fiscalApi.get('/sped/fiscal?companyId=1'),
        fiscalApi.get('/sped/pis-cofins?companyId=1'),
      ]);
      setSpedFiscal(Array.isArray(f.data) ? f.data : []);
      setSpedPis(Array.isArray(p.data) ? p.data : []);
    } catch { setSpedFiscal([]); setSpedPis([]); }
    finally { setLoadingSped(false); }
  }

  async function criarCfop() {
    try { await fiscalApi.post('/cfop', newCfop); setSuccess('CFOP criado'); setOpenCfop(false); await carregarCfops(); }
    catch { setError('Erro'); }
  }

  async function criarNfe() {
    try {
      await fiscalApi.post('/nfe/entrada', { ...newNfe, companyId: '1', unidadeId: '1' });
      setSuccess('NF-e registrada'); setOpenNfe(false); await carregarNfes();
    } catch { setError('Erro'); }
  }

  async function cancelarNfe(id: string) {
    try { await fiscalApi.post(`/nfe/entrada/${id}/cancelar`); setSuccess('Cancelada'); await carregarNfes(); }
    catch { setError('Erro'); }
  }

  async function gerarSped(tipo: string) {
    try {
      await fiscalApi.post(`/sped/${tipo}/gerar`, { companyId: '1', unidadeId: '1', ...spedPeriodo });
      setSuccess(`SPED ${tipo} gerado`); setOpenSped(false); await carregarSped();
    } catch { setError('Erro'); }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
        Fiscal
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{cfops.length}</Typography>
            <Typography variant="body2" color="text.secondary">CFOPs</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{nfes.filter(n => n.status === 'AUTORIZADA').length}</Typography>
            <Typography variant="body2" color="text.secondary">NF-e Autorizadas</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{nfces.length}</Typography>
            <Typography variant="body2" color="text.secondary">NFC-e Emitidas</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{spedFiscal.length + spedPis.length}</Typography>
            <Typography variant="body2" color="text.secondary">SPEDs Gerados</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<AccountTree />} label="CFOP" />
          <Tab icon={<Description />} label="NF-e Entrada" />
          <Tab icon={<Receipt />} label="NFC-e Saída" />
          <Tab icon={<Assessment />} label="SPED" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCfop(true)}>Novo CFOP</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarCfops}>Atualizar</Button>
            </Box>
            {loadingCfop ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Código</TableCell><TableCell>Descrição</TableCell><TableCell>Tipo</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {cfops.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell><Chip label={c.codigo} color="primary" size="small" /></TableCell>
                        <TableCell>{c.descricao}</TableCell>
                        <TableCell>{c.tipo}</TableCell>
                      </TableRow>
                    ))}
                    {cfops.length === 0 && <TableRow><TableCell colSpan={3} align="center">Nenhum CFOP</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenNfe(true)}>Registrar NF-e</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarNfes}>Atualizar</Button>
            </Box>
            {loadingNfe ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Chave Acesso</TableCell>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>CFOP</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nfes.map((n: any) => (
                      <TableRow key={n.id}>
                        <TableCell>{n.chaveAcesso?.slice(-8)}</TableCell>
                        <TableCell>{n.fornecedorNome}</TableCell>
                        <TableCell>R$ {Number(n.valorNota).toFixed(2)}</TableCell>
                        <TableCell>{new Date(n.dataEntrada).toLocaleDateString()}</TableCell>
                        <TableCell>{n.cfop?.codigo || '-'}</TableCell>
                        <TableCell>{statusNfeChip(n.status)}</TableCell>
                        <TableCell>
                          {n.status === 'AUTORIZADA' && (
                            <Button size="small" color="error" startIcon={<Cancel />} onClick={() => cancelarNfe(n.id)}>Cancelar</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {nfes.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nenhuma NF-e</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarNfces}>Atualizar</Button>
            </Box>
            {loadingNfce ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Chave Acesso</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Emissão</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nfces.map((n: any) => (
                      <TableRow key={n.id}>
                        <TableCell>{n.numero}</TableCell>
                        <TableCell>{n.chaveAcesso?.slice(-8)}</TableCell>
                        <TableCell>R$ {Number(n.valorNota).toFixed(2)}</TableCell>
                        <TableCell>{new Date(n.dataEmissao).toLocaleString()}</TableCell>
                        <TableCell>{statusNfeChip(n.status)}</TableCell>
                      </TableRow>
                    ))}
                    {nfces.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma NFC-e</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Assessment />} onClick={() => setOpenSped(true)}>
                Gerar SPED
              </Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarSped}>Atualizar</Button>
            </Box>
            {loadingSped ? <LinearProgress /> : (
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>SPED Fiscal</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Período</TableCell><TableCell>Status</TableCell><TableCell>Geração</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        {spedFiscal.map((s: any) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.mes}/{s.ano}</TableCell>
                            <TableCell>{statusSpedChip(s.status)}</TableCell>
                            <TableCell>{s.dataGeracao ? new Date(s.dataGeracao).toLocaleString() : '-'}</TableCell>
                          </TableRow>
                        ))}
                        {spedFiscal.length === 0 && <TableRow><TableCell colSpan={3} align="center">Nenhum SPED Fiscal</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>SPED PIS/COFINS</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Período</TableCell><TableCell>Status</TableCell><TableCell>Geração</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        {spedPis.map((s: any) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.mes}/{s.ano}</TableCell>
                            <TableCell>{statusSpedChip(s.status)}</TableCell>
                            <TableCell>{s.dataGeracao ? new Date(s.dataGeracao).toLocaleString() : '-'}</TableCell>
                          </TableRow>
                        ))}
                        {spedPis.length === 0 && <TableRow><TableCell colSpan={3} align="center">Nenhum SPED PIS/COFINS</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openCfop} onClose={() => setOpenCfop(false)}>
        <DialogTitle>Novo CFOP</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Código" value={newCfop.codigo} sx={{ mt: 1 }}
            onChange={e => setNewCfop({ ...newCfop, codigo: e.target.value })} />
          <TextField fullWidth label="Descrição" value={newCfop.descricao} sx={{ mt: 2 }}
            onChange={e => setNewCfop({ ...newCfop, descricao: e.target.value })} />
          <TextField select fullWidth label="Tipo" value={newCfop.tipo} sx={{ mt: 2 }}
            onChange={e => setNewCfop({ ...newCfop, tipo: e.target.value })}>
            <MenuItem value="ENTRADA">Entrada</MenuItem>
            <MenuItem value="SAIDA">Saída</MenuItem>
            <MenuItem value="ENTRADA_SAIDA">Entrada/Saída</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCfop(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarCfop}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNfe} onClose={() => setOpenNfe(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar NF-e de Entrada</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Número" type="number" value={newNfe.numero} sx={{ mt: 1 }}
            onChange={e => setNewNfe({ ...newNfe, numero: parseInt(e.target.value) || 0 })} />
          <TextField fullWidth label="Chave de Acesso" value={newNfe.chaveAcesso} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, chaveAcesso: e.target.value })} />
          <TextField fullWidth label="Data Emissão" type="date" value={newNfe.dataEmissao} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, dataEmissao: e.target.value })}
            InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Fornecedor CNPJ" value={newNfe.fornecedorCpfCnpj} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, fornecedorCpfCnpj: e.target.value })} />
          <TextField fullWidth label="Fornecedor Nome" value={newNfe.fornecedorNome} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, fornecedorNome: e.target.value })} />
          <TextField select fullWidth label="CFOP" value={newNfe.cfopId} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, cfopId: e.target.value })}>
            {cfops.map(c => <MenuItem key={c.id} value={c.id}>{c.codigo} - {c.descricao}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Valor R$" type="number" value={newNfe.valorNota} sx={{ mt: 2 }}
            onChange={e => setNewNfe({ ...newNfe, valorNota: parseFloat(e.target.value) || 0 })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNfe(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarNfe}>Registrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSped} onClose={() => setOpenSped(false)}>
        <DialogTitle>Gerar SPED</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Mês" type="number" value={spedPeriodo.mes} sx={{ mt: 1 }}
            onChange={e => setSpedPeriodo({ ...spedPeriodo, mes: parseInt(e.target.value) || 1 })} />
          <TextField fullWidth label="Ano" type="number" value={spedPeriodo.ano} sx={{ mt: 2 }}
            onChange={e => setSpedPeriodo({ ...spedPeriodo, ano: parseInt(e.target.value) || 2026 })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSped(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => gerarSped('fiscal')} sx={{ mr: 1 }}>Gerar SPED Fiscal</Button>
          <Button variant="contained" onClick={() => gerarSped('pis-cofins')}>Gerar SPED PIS/COFINS</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
