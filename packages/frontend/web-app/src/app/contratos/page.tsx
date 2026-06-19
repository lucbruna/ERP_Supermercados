'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  Description, Warning, Cancel, AttachMoney, Add, Refresh, Edit, Delete,
  CheckCircle, PendingActions,
} from '@mui/icons-material';
import { contratosApi } from '@/lib/api';

const CONTRATOS_BASE = '/contratos/contratos';
const ADITIVOS_BASE = '/contratos/aditivos';
const RESCISOES_BASE = '/contratos/rescisoes';

export default function ContratosPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contratos, setContratos] = useState<any[]>([]);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [aditivos, setAditivos] = useState<any[]>([]);
  const [loadingAditivos, setLoadingAditivos] = useState(false);
  const [rescisoes, setRescisoes] = useState<any[]>([]);
  const [loadingRescisoes, setLoadingRescisoes] = useState(false);

  const [openContratoDialog, setOpenContratoDialog] = useState(false);
  const [editContrato, setEditContrato] = useState<any>(null);
  const [contratoForm, setContratoForm] = useState({
    numero: '', funcionarioId: '', tipo: 'CLT', salarioBase: 0,
    dataAdmissao: '', dataExperiencia: '', dataEfetivacao: '',
    jornadaSemanal: 44, cargo: '', departamento: '',
    status: 'ATIVO', observacao: '',
  });

  const [openAditivoDialog, setOpenAditivoDialog] = useState(false);
  const [aditivoForm, setAditivoForm] = useState({
    contratoId: '', tipo: 'REAJUSTE', descricao: '', valorAnterior: 0, valorNovo: 0,
    dataInicio: '', dataFim: '',
  });

  const [openRescisaoDialog, setOpenRescisaoDialog] = useState(false);
  const [rescisaoForm, setRescisaoForm] = useState({
    contratoId: '', tipo: 'SEM_JUSTA_CAUSA', dataRescisao: '', dataAviso: '',
    avisoTrabalhado: false, saldoSalario: 0, ferias: 0, decimoTerceiro: 0,
    multaFGTS: 0, observacao: '',
  });

  useEffect(() => {
    carregarContratos();
    carregarAditivos();
    carregarRescisoes();
  }, []);

  async function carregarContratos() {
    setLoadingContratos(true);
    try { const { data } = await contratosApi.get(CONTRATOS_BASE); setContratos(Array.isArray(data) ? data : []); }
    catch { setContratos([]); }
    finally { setLoadingContratos(false); }
  }

  async function carregarAditivos() {
    setLoadingAditivos(true);
    try { const { data } = await contratosApi.get(ADITIVOS_BASE); setAditivos(Array.isArray(data) ? data : []); }
    catch { setAditivos([]); }
    finally { setLoadingAditivos(false); }
  }

  async function carregarRescisoes() {
    setLoadingRescisoes(true);
    try { const { data } = await contratosApi.get(RESCISOES_BASE); setRescisoes(Array.isArray(data) ? data : []); }
    catch { setRescisoes([]); }
    finally { setLoadingRescisoes(false); }
  }

  async function salvarContrato() {
    try {
      if (editContrato) {
        await contratosApi.patch(`${CONTRATOS_BASE}/${editContrato.id}`, contratoForm);
        setSuccess('Contrato atualizado');
      } else {
        await contratosApi.post(CONTRATOS_BASE, contratoForm);
        setSuccess('Contrato criado');
      }
      setOpenContratoDialog(false);
      setEditContrato(null);
      await carregarContratos();
    } catch { setError('Erro ao salvar contrato'); }
  }

  async function excluirContrato(id: string) {
    if (!confirm('Excluir este contrato?')) return;
    try { await contratosApi.delete(`${CONTRATOS_BASE}/${id}`); setSuccess('Contrato excluído'); await carregarContratos(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarAditivo() {
    try {
      await contratosApi.post(ADITIVOS_BASE, aditivoForm);
      setSuccess('Aditivo registrado');
      setOpenAditivoDialog(false);
      await carregarAditivos();
    } catch { setError('Erro ao salvar aditivo'); }
  }

  async function salvarRescisao() {
    try {
      await contratosApi.post(RESCISOES_BASE, rescisaoForm);
      setSuccess('Rescisão registrada');
      setOpenRescisaoDialog(false);
      await carregarRescisoes();
    } catch { setError('Erro ao registrar rescisão'); }
  }

  function abrirEditarContrato(c: any) {
    setEditContrato(c);
    setContratoForm({
      numero: c.numero, funcionarioId: c.funcionarioId || '', tipo: c.tipo || 'CLT',
      salarioBase: c.salarioBase || 0, dataAdmissao: c.dataAdmissao || '',
      dataExperiencia: c.dataExperiencia || '', dataEfetivacao: c.dataEfetivacao || '',
      jornadaSemanal: c.jornadaSemanal || 44, cargo: c.cargo || '',
      departamento: c.departamento || '', status: c.status || 'ATIVO',
      observacao: c.observacao || '',
    });
    setOpenContratoDialog(true);
  }

  const statusChip = (s: string) => {
    const m: Record<string, any> = {
      ATIVO: <Chip label="Ativo" color="success" size="small" />,
      SUSPENSO: <Chip label="Suspenso" color="warning" size="small" />,
      ENCERRADO: <Chip label="Encerrado" size="small" />,
      CANCELADO: <Chip label="Cancelado" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const contratosAtivos = contratos.filter((c: any) => c.status === 'ATIVO');
  const contratosVencendo = contratos.filter((c: any) => c.dataExperiencia && new Date(c.dataExperiencia) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const rescisoesMes = rescisoes.filter((r: any) => {
    if (!r.dataRescisao) return false;
    const d = new Date(r.dataRescisao);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const salarioMedio = contratos.length > 0
    ? contratos.reduce((acc: number, c: any) => acc + Number(c.salarioBase || 0), 0) / contratos.length
    : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
        Contratos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{contratosAtivos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Contratos Ativos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{contratosVencendo.length}</Typography>
            <Typography variant="body2" color="text.secondary">Vencendo</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h4" fontWeight="bold">{rescisoesMes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Rescisões Mês</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">R$ {salarioMedio.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Salário Médio</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Description />} label="Contratos" />
          <Tab icon={<PendingActions />} label="Aditivos" />
          <Tab icon={<Cancel />} label="Rescisões" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditContrato(null); setContratoForm({ numero: '', funcionarioId: '', tipo: 'CLT', salarioBase: 0, dataAdmissao: '', dataExperiencia: '', dataEfetivacao: '', jornadaSemanal: 44, cargo: '', departamento: '', status: 'ATIVO', observacao: '' }); setOpenContratoDialog(true); }}>Novo Contrato</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarContratos}>Atualizar</Button>
            </Box>
            {loadingContratos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Funcionário</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Salário Base</TableCell>
                      <TableCell>Cargo</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contratos.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell><Chip label={c.numero} color="primary" size="small" /></TableCell>
                        <TableCell>{c.funcionario?.nome || c.funcionarioId || '-'}</TableCell>
                        <TableCell>{c.tipo || '-'}</TableCell>
                        <TableCell>R$ {Number(c.salarioBase || 0).toFixed(2)}</TableCell>
                        <TableCell>{c.cargo || '-'}</TableCell>
                        <TableCell>{c.departamento || '-'}</TableCell>
                        <TableCell>{statusChip(c.status)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarContrato(c)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirContrato(c.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {contratos.length === 0 && <TableRow><TableCell colSpan={8} align="center">Nenhum contrato cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setAditivoForm({ contratoId: '', tipo: 'REAJUSTE', descricao: '', valorAnterior: 0, valorNovo: 0, dataInicio: '', dataFim: '' }); setOpenAditivoDialog(true); }}>Novo Aditivo</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarAditivos}>Atualizar</Button>
            </Box>
            {loadingAditivos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Contrato</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Valor Anterior</TableCell>
                      <TableCell>Valor Novo</TableCell>
                      <TableCell>Início</TableCell>
                      <TableCell>Fim</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aditivos.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.contrato?.numero || a.contratoId}</TableCell>
                        <TableCell>{a.tipo || '-'}</TableCell>
                        <TableCell>{a.descricao || '-'}</TableCell>
                        <TableCell>R$ {Number(a.valorAnterior || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(a.valorNovo || 0).toFixed(2)}</TableCell>
                        <TableCell>{a.dataInicio ? new Date(a.dataInicio).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{a.dataFim ? new Date(a.dataFim).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {aditivos.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nenhum aditivo registrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setRescisaoForm({ contratoId: '', tipo: 'SEM_JUSTA_CAUSA', dataRescisao: '', dataAviso: '', avisoTrabalhado: false, saldoSalario: 0, ferias: 0, decimoTerceiro: 0, multaFGTS: 0, observacao: '' }); setOpenRescisaoDialog(true); }}>Nova Rescisão</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarRescisoes}>Atualizar</Button>
            </Box>
            {loadingRescisoes ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Contrato</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Data Rescisão</TableCell>
                      <TableCell>Saldo Salário</TableCell>
                      <TableCell>Férias</TableCell>
                      <TableCell>13º</TableCell>
                      <TableCell>Multa FGTS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rescisoes.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.contrato?.numero || r.contratoId}</TableCell>
                        <TableCell>{r.tipo?.replace(/_/g, ' ') || '-'}</TableCell>
                        <TableCell>{r.dataRescisao ? new Date(r.dataRescisao).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>R$ {Number(r.saldoSalario || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(r.ferias || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(r.decimoTerceiro || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {Number(r.multaFGTS || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {rescisoes.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nenhuma rescisão registrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openContratoDialog} onClose={() => setOpenContratoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editContrato ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Número" value={contratoForm.numero} sx={{ mt: 1 }} onChange={e => setContratoForm({ ...contratoForm, numero: e.target.value })} />
          <TextField fullWidth label="ID Funcionário" value={contratoForm.funcionarioId} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, funcionarioId: e.target.value })} />
          <TextField select fullWidth label="Tipo" value={contratoForm.tipo} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, tipo: e.target.value })}>
            <MenuItem value="CLT">CLT</MenuItem>
            <MenuItem value="PJ">PJ</MenuItem>
            <MenuItem value="ESTAGIO">Estágio</MenuItem>
            <MenuItem value="TEMPORARIO">Temporário</MenuItem>
            <MenuItem value="APRENDIZ">Aprendiz</MenuItem>
          </TextField>
          <TextField fullWidth label="Salário Base (R$)" type="number" value={contratoForm.salarioBase} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, salarioBase: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Data Admissão" type="date" value={contratoForm.dataAdmissao} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, dataAdmissao: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Experiência" type="date" value={contratoForm.dataExperiencia} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, dataExperiencia: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Efetivação" type="date" value={contratoForm.dataEfetivacao} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, dataEfetivacao: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Jornada Semanal (h)" type="number" value={contratoForm.jornadaSemanal} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, jornadaSemanal: parseInt(e.target.value) || 0 })} />
          <TextField fullWidth label="Cargo" value={contratoForm.cargo} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, cargo: e.target.value })} />
          <TextField fullWidth label="Departamento" value={contratoForm.departamento} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, departamento: e.target.value })} />
          <TextField select fullWidth label="Status" value={contratoForm.status} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, status: e.target.value })}>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="SUSPENSO">Suspenso</MenuItem>
            <MenuItem value="ENCERRADO">Encerrado</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
          </TextField>
          <TextField fullWidth label="Observação" value={contratoForm.observacao} sx={{ mt: 2 }} onChange={e => setContratoForm({ ...contratoForm, observacao: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContratoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarContrato}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAditivoDialog} onClose={() => setOpenAditivoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Aditivo</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ID Contrato" value={aditivoForm.contratoId} sx={{ mt: 1 }} onChange={e => setAditivoForm({ ...aditivoForm, contratoId: e.target.value })} />
          <TextField select fullWidth label="Tipo" value={aditivoForm.tipo} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, tipo: e.target.value })}>
            <MenuItem value="REAJUSTE">Reajuste</MenuItem>
            <MenuItem value="PROMOCAO">Promoção</MenuItem>
            <MenuItem value="MUDANCA_CARGO">Mudança de Cargo</MenuItem>
            <MenuItem value="MUDANCA_DEPARTAMENTO">Mudança de Departamento</MenuItem>
            <MenuItem value="PRORROGACAO">Prorrogação</MenuItem>
          </TextField>
          <TextField fullWidth label="Descrição" value={aditivoForm.descricao} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, descricao: e.target.value })} multiline rows={2} />
          <TextField fullWidth label="Valor Anterior (R$)" type="number" value={aditivoForm.valorAnterior} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, valorAnterior: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Valor Novo (R$)" type="number" value={aditivoForm.valorNovo} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, valorNovo: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Data Início" type="date" value={aditivoForm.dataInicio} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Fim" type="date" value={aditivoForm.dataFim} sx={{ mt: 2 }} onChange={e => setAditivoForm({ ...aditivoForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAditivoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarAditivo}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRescisaoDialog} onClose={() => setOpenRescisaoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Rescisão</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ID Contrato" value={rescisaoForm.contratoId} sx={{ mt: 1 }} onChange={e => setRescisaoForm({ ...rescisaoForm, contratoId: e.target.value })} />
          <TextField select fullWidth label="Tipo" value={rescisaoForm.tipo} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, tipo: e.target.value })}>
            <MenuItem value="SEM_JUSTA_CAUSA">Sem Justa Causa</MenuItem>
            <MenuItem value="COM_JUSTA_CAUSA">Com Justa Causa</MenuItem>
            <MenuItem value="PEDIDO_DEMISSAO">Pedido de Demissão</MenuItem>
            <MenuItem value="ACORDO">Acordo</MenuItem>
            <MenuItem value="FIM_CONTRATO">Fim de Contrato</MenuItem>
          </TextField>
          <TextField fullWidth label="Data Rescisão" type="date" value={rescisaoForm.dataRescisao} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, dataRescisao: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Aviso" type="date" value={rescisaoForm.dataAviso} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, dataAviso: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Saldo Salário (R$)" type="number" value={rescisaoForm.saldoSalario} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, saldoSalario: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Férias (R$)" type="number" value={rescisaoForm.ferias} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, ferias: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="13º (R$)" type="number" value={rescisaoForm.decimoTerceiro} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, decimoTerceiro: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Multa FGTS (R$)" type="number" value={rescisaoForm.multaFGTS} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, multaFGTS: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Observação" value={rescisaoForm.observacao} sx={{ mt: 2 }} onChange={e => setRescisaoForm({ ...rescisaoForm, observacao: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRescisaoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarRescisao}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
