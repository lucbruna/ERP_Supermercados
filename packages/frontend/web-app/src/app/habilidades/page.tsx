'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  School, WorkspacePremium, TrendingUp, RateReview, Add, Refresh, Edit, Delete,
} from '@mui/icons-material';
import { habilidadesApi } from '@/lib/api';

const HABILIDADES_BASE = '/habilidades/habilidades';
const CERTIFICACOES_BASE = '/habilidades/certificacoes';
const TREINAMENTOS_BASE = '/habilidades/treinamentos';
const AVALIACOES_BASE = '/habilidades/avaliacoes';

export default function HabilidadesPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [loadingHabilidades, setLoadingHabilidades] = useState(false);
  const [certificacoes, setCertificacoes] = useState<any[]>([]);
  const [loadingCertificacoes, setLoadingCertificacoes] = useState(false);
  const [treinamentos, setTreinamentos] = useState<any[]>([]);
  const [loadingTreinamentos, setLoadingTreinamentos] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

  const [openHabilidadeDialog, setOpenHabilidadeDialog] = useState(false);
  const [editHabilidade, setEditHabilidade] = useState<any>(null);
  const [habilidadeForm, setHabilidadeForm] = useState({
    nome: '', categoria: '', descricao: '', nivel: 'INTERMEDIARIO',
  });

  const [openCertificacaoDialog, setOpenCertificacaoDialog] = useState(false);
  const [editCertificacao, setEditCertificacao] = useState<any>(null);
  const [certificacaoForm, setCertificacaoForm] = useState({
    nome: '', entidade: '', descricao: '', dataObtencao: '', dataValidade: '',
  });

  const [openTreinamentoDialog, setOpenTreinamentoDialog] = useState(false);
  const [editTreinamento, setEditTreinamento] = useState<any>(null);
  const [treinamentoForm, setTreinamentoForm] = useState({
    nome: '', descricao: '', cargaHoraria: 0, dataInicio: '', dataFim: '',
    status: 'AGENDADO',
  });

  const [openAvaliacaoDialog, setOpenAvaliacaoDialog] = useState(false);
  const [editAvaliacao, setEditAvaliacao] = useState<any>(null);
  const [avaliacaoForm, setAvaliacaoForm] = useState({
    funcionarioId: '', tipo: 'DESEMPENHO', nota: 0, dataAvaliacao: '',
    observacao: '',
  });

  useEffect(() => {
    carregarHabilidades();
    carregarCertificacoes();
    carregarTreinamentos();
    carregarAvaliacoes();
  }, []);

  async function carregarHabilidades() {
    setLoadingHabilidades(true);
    try { const { data } = await habilidadesApi.get(HABILIDADES_BASE); setHabilidades(Array.isArray(data) ? data : []); }
    catch { setHabilidades([]); }
    finally { setLoadingHabilidades(false); }
  }

  async function carregarCertificacoes() {
    setLoadingCertificacoes(true);
    try { const { data } = await habilidadesApi.get(CERTIFICACOES_BASE); setCertificacoes(Array.isArray(data) ? data : []); }
    catch { setCertificacoes([]); }
    finally { setLoadingCertificacoes(false); }
  }

  async function carregarTreinamentos() {
    setLoadingTreinamentos(true);
    try { const { data } = await habilidadesApi.get(TREINAMENTOS_BASE); setTreinamentos(Array.isArray(data) ? data : []); }
    catch { setTreinamentos([]); }
    finally { setLoadingTreinamentos(false); }
  }

  async function carregarAvaliacoes() {
    setLoadingAvaliacoes(true);
    try { const { data } = await habilidadesApi.get(AVALIACOES_BASE); setAvaliacoes(Array.isArray(data) ? data : []); }
    catch { setAvaliacoes([]); }
    finally { setLoadingAvaliacoes(false); }
  }

  async function salvarHabilidade() {
    try {
      if (editHabilidade) {
        await habilidadesApi.patch(`${HABILIDADES_BASE}/${editHabilidade.id}`, habilidadeForm);
        setSuccess('Habilidade atualizada');
      } else {
        await habilidadesApi.post(HABILIDADES_BASE, habilidadeForm);
        setSuccess('Habilidade cadastrada');
      }
      setOpenHabilidadeDialog(false);
      setEditHabilidade(null);
      await carregarHabilidades();
    } catch { setError('Erro ao salvar habilidade'); }
  }

  async function excluirHabilidade(id: string) {
    if (!confirm('Excluir esta habilidade?')) return;
    try { await habilidadesApi.delete(`${HABILIDADES_BASE}/${id}`); setSuccess('Habilidade excluída'); await carregarHabilidades(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarCertificacao() {
    try {
      if (editCertificacao) {
        await habilidadesApi.patch(`${CERTIFICACOES_BASE}/${editCertificacao.id}`, certificacaoForm);
        setSuccess('Certificação atualizada');
      } else {
        await habilidadesApi.post(CERTIFICACOES_BASE, certificacaoForm);
        setSuccess('Certificação cadastrada');
      }
      setOpenCertificacaoDialog(false);
      setEditCertificacao(null);
      await carregarCertificacoes();
    } catch { setError('Erro ao salvar certificação'); }
  }

  async function excluirCertificacao(id: string) {
    if (!confirm('Excluir esta certificação?')) return;
    try { await habilidadesApi.delete(`${CERTIFICACOES_BASE}/${id}`); setSuccess('Certificação excluída'); await carregarCertificacoes(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarTreinamento() {
    try {
      if (editTreinamento) {
        await habilidadesApi.patch(`${TREINAMENTOS_BASE}/${editTreinamento.id}`, treinamentoForm);
        setSuccess('Treinamento atualizado');
      } else {
        await habilidadesApi.post(TREINAMENTOS_BASE, treinamentoForm);
        setSuccess('Treinamento cadastrado');
      }
      setOpenTreinamentoDialog(false);
      setEditTreinamento(null);
      await carregarTreinamentos();
    } catch { setError('Erro ao salvar treinamento'); }
  }

  async function excluirTreinamento(id: string) {
    if (!confirm('Excluir este treinamento?')) return;
    try { await habilidadesApi.delete(`${TREINAMENTOS_BASE}/${id}`); setSuccess('Treinamento excluído'); await carregarTreinamentos(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarAvaliacao() {
    try {
      if (editAvaliacao) {
        await habilidadesApi.patch(`${AVALIACOES_BASE}/${editAvaliacao.id}`, avaliacaoForm);
        setSuccess('Avaliação atualizada');
      } else {
        await habilidadesApi.post(AVALIACOES_BASE, avaliacaoForm);
        setSuccess('Avaliação cadastrada');
      }
      setOpenAvaliacaoDialog(false);
      setEditAvaliacao(null);
      await carregarAvaliacoes();
    } catch { setError('Erro ao salvar avaliação'); }
  }

  async function excluirAvaliacao(id: string) {
    if (!confirm('Excluir esta avaliação?')) return;
    try { await habilidadesApi.delete(`${AVALIACOES_BASE}/${id}`); setSuccess('Avaliação excluída'); await carregarAvaliacoes(); }
    catch { setError('Erro ao excluir'); }
  }

  function abrirEditarHabilidade(h: any) {
    setEditHabilidade(h);
    setHabilidadeForm({
      nome: h.nome, categoria: h.categoria || '', descricao: h.descricao || '',
      nivel: h.nivel || 'INTERMEDIARIO',
    });
    setOpenHabilidadeDialog(true);
  }

  function abrirEditarCertificacao(c: any) {
    setEditCertificacao(c);
    setCertificacaoForm({
      nome: c.nome, entidade: c.entidade || '', descricao: c.descricao || '',
      dataObtencao: c.dataObtencao || '', dataValidade: c.dataValidade || '',
    });
    setOpenCertificacaoDialog(true);
  }

  function abrirEditarTreinamento(t: any) {
    setEditTreinamento(t);
    setTreinamentoForm({
      nome: t.nome, descricao: t.descricao || '', cargaHoraria: t.cargaHoraria || 0,
      dataInicio: t.dataInicio || '', dataFim: t.dataFim || '', status: t.status || 'AGENDADO',
    });
    setOpenTreinamentoDialog(true);
  }

  function abrirEditarAvaliacao(a: any) {
    setEditAvaliacao(a);
    setAvaliacaoForm({
      funcionarioId: a.funcionarioId || '', tipo: a.tipo || 'DESEMPENHO',
      nota: a.nota || 0, dataAvaliacao: a.dataAvaliacao || '',
      observacao: a.observacao || '',
    });
    setOpenAvaliacaoDialog(true);
  }

  const nivelChip = (n: string) => {
    const m: Record<string, any> = {
      BASICO: <Chip label="Básico" color="info" size="small" />,
      INTERMEDIARIO: <Chip label="Intermediário" color="primary" size="small" />,
      AVANCADO: <Chip label="Avançado" color="warning" size="small" />,
      EXPERT: <Chip label="Expert" color="success" size="small" />,
    };
    return m[n] || <Chip label={n} size="small" />;
  };

  const statusTreinamentoChip = (s: string) => {
    const m: Record<string, any> = {
      AGENDADO: <Chip label="Agendado" color="info" size="small" />,
      EM_ANDAMENTO: <Chip label="Em Andamento" color="warning" size="small" />,
      CONCLUIDO: <Chip label="Concluído" color="success" size="small" />,
      CANCELADO: <Chip label="Cancelado" color="error" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
        Habilidades
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{habilidades.length}</Typography>
            <Typography variant="body2" color="text.secondary">Habilidades</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{certificacoes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Certificações</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{treinamentos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Treinamentos</Typography>
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
          <Tab icon={<School />} label="Habilidades" />
          <Tab icon={<WorkspacePremium />} label="Certificações" />
          <Tab icon={<TrendingUp />} label="Treinamentos" />
          <Tab icon={<RateReview />} label="Avaliações" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditHabilidade(null); setHabilidadeForm({ nome: '', categoria: '', descricao: '', nivel: 'INTERMEDIARIO' }); setOpenHabilidadeDialog(true); }}>Nova Habilidade</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarHabilidades}>Atualizar</Button>
            </Box>
            {loadingHabilidades ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Nível</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {habilidades.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.nome}</TableCell>
                        <TableCell>{h.categoria || '-'}</TableCell>
                        <TableCell>{h.descricao || '-'}</TableCell>
                        <TableCell>{nivelChip(h.nivel)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarHabilidade(h)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirHabilidade(h.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {habilidades.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma habilidade cadastrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditCertificacao(null); setCertificacaoForm({ nome: '', entidade: '', descricao: '', dataObtencao: '', dataValidade: '' }); setOpenCertificacaoDialog(true); }}>Nova Certificação</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarCertificacoes}>Atualizar</Button>
            </Box>
            {loadingCertificacoes ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Entidade</TableCell>
                      <TableCell>Data Obtenção</TableCell>
                      <TableCell>Data Validade</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certificacoes.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.nome}</TableCell>
                        <TableCell>{c.entidade || '-'}</TableCell>
                        <TableCell>{c.dataObtencao ? new Date(c.dataObtencao).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{c.dataValidade ? new Date(c.dataValidade).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarCertificacao(c)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirCertificacao(c.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {certificacoes.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhuma certificação cadastrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditTreinamento(null); setTreinamentoForm({ nome: '', descricao: '', cargaHoraria: 0, dataInicio: '', dataFim: '', status: 'AGENDADO' }); setOpenTreinamentoDialog(true); }}>Novo Treinamento</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarTreinamentos}>Atualizar</Button>
            </Box>
            {loadingTreinamentos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Carga Horária</TableCell>
                      <TableCell>Início</TableCell>
                      <TableCell>Fim</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treinamentos.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.nome}</TableCell>
                        <TableCell>{t.cargaHoraria || '-'}h</TableCell>
                        <TableCell>{t.dataInicio ? new Date(t.dataInicio).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{t.dataFim ? new Date(t.dataFim).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{statusTreinamentoChip(t.status)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarTreinamento(t)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirTreinamento(t.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {treinamentos.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhum treinamento cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditAvaliacao(null); setAvaliacaoForm({ funcionarioId: '', tipo: 'DESEMPENHO', nota: 0, dataAvaliacao: '', observacao: '' }); setOpenAvaliacaoDialog(true); }}>Nova Avaliação</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarAvaliacoes}>Atualizar</Button>
            </Box>
            {loadingAvaliacoes ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Funcionário</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Nota</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Observação</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {avaliacoes.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.funcionario?.nome || a.funcionarioId || '-'}</TableCell>
                        <TableCell>{a.tipo || '-'}</TableCell>
                        <TableCell>{a.nota != null ? `${a.nota}/10` : '-'}</TableCell>
                        <TableCell>{a.dataAvaliacao ? new Date(a.dataAvaliacao).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{a.observacao || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarAvaliacao(a)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirAvaliacao(a.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {avaliacoes.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhuma avaliação cadastrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openHabilidadeDialog} onClose={() => setOpenHabilidadeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editHabilidade ? 'Editar Habilidade' : 'Nova Habilidade'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={habilidadeForm.nome} sx={{ mt: 1 }} onChange={e => setHabilidadeForm({ ...habilidadeForm, nome: e.target.value })} />
          <TextField fullWidth label="Categoria" value={habilidadeForm.categoria} sx={{ mt: 2 }} onChange={e => setHabilidadeForm({ ...habilidadeForm, categoria: e.target.value })} />
          <TextField fullWidth label="Descrição" value={habilidadeForm.descricao} sx={{ mt: 2 }} onChange={e => setHabilidadeForm({ ...habilidadeForm, descricao: e.target.value })} multiline rows={2} />
          <TextField select fullWidth label="Nível" value={habilidadeForm.nivel} sx={{ mt: 2 }} onChange={e => setHabilidadeForm({ ...habilidadeForm, nivel: e.target.value })}>
            <MenuItem value="BASICO">Básico</MenuItem>
            <MenuItem value="INTERMEDIARIO">Intermediário</MenuItem>
            <MenuItem value="AVANCADO">Avançado</MenuItem>
            <MenuItem value="EXPERT">Expert</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHabilidadeDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarHabilidade}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCertificacaoDialog} onClose={() => setOpenCertificacaoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCertificacao ? 'Editar Certificação' : 'Nova Certificação'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={certificacaoForm.nome} sx={{ mt: 1 }} onChange={e => setCertificacaoForm({ ...certificacaoForm, nome: e.target.value })} />
          <TextField fullWidth label="Entidade" value={certificacaoForm.entidade} sx={{ mt: 2 }} onChange={e => setCertificacaoForm({ ...certificacaoForm, entidade: e.target.value })} />
          <TextField fullWidth label="Descrição" value={certificacaoForm.descricao} sx={{ mt: 2 }} onChange={e => setCertificacaoForm({ ...certificacaoForm, descricao: e.target.value })} multiline rows={2} />
          <TextField fullWidth label="Data Obtenção" type="date" value={certificacaoForm.dataObtencao} sx={{ mt: 2 }} onChange={e => setCertificacaoForm({ ...certificacaoForm, dataObtencao: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Validade" type="date" value={certificacaoForm.dataValidade} sx={{ mt: 2 }} onChange={e => setCertificacaoForm({ ...certificacaoForm, dataValidade: e.target.value })} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCertificacaoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarCertificacao}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTreinamentoDialog} onClose={() => setOpenTreinamentoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTreinamento ? 'Editar Treinamento' : 'Novo Treinamento'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={treinamentoForm.nome} sx={{ mt: 1 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, nome: e.target.value })} />
          <TextField fullWidth label="Descrição" value={treinamentoForm.descricao} sx={{ mt: 2 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, descricao: e.target.value })} multiline rows={2} />
          <TextField fullWidth label="Carga Horária" type="number" value={treinamentoForm.cargaHoraria} sx={{ mt: 2 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, cargaHoraria: parseInt(e.target.value) || 0 })} />
          <TextField fullWidth label="Data Início" type="date" value={treinamentoForm.dataInicio} sx={{ mt: 2 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Data Fim" type="date" value={treinamentoForm.dataFim} sx={{ mt: 2 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField select fullWidth label="Status" value={treinamentoForm.status} sx={{ mt: 2 }} onChange={e => setTreinamentoForm({ ...treinamentoForm, status: e.target.value })}>
            <MenuItem value="AGENDADO">Agendado</MenuItem>
            <MenuItem value="EM_ANDAMENTO">Em Andamento</MenuItem>
            <MenuItem value="CONCLUIDO">Concluído</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTreinamentoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarTreinamento}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAvaliacaoDialog} onClose={() => setOpenAvaliacaoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editAvaliacao ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ID Funcionário" value={avaliacaoForm.funcionarioId} sx={{ mt: 1 }} onChange={e => setAvaliacaoForm({ ...avaliacaoForm, funcionarioId: e.target.value })} />
          <TextField select fullWidth label="Tipo" value={avaliacaoForm.tipo} sx={{ mt: 2 }} onChange={e => setAvaliacaoForm({ ...avaliacaoForm, tipo: e.target.value })}>
            <MenuItem value="DESEMPENHO">Desempenho</MenuItem>
            <MenuItem value="COMPORTAMENTAL">Comportamental</MenuItem>
            <MenuItem value="TECNICA">Técnica</MenuItem>
            <MenuItem value="LIDERANCA">Liderança</MenuItem>
            <MenuItem value="FEEDBACK">Feedback 360</MenuItem>
          </TextField>
          <TextField fullWidth label="Nota (0-10)" type="number" value={avaliacaoForm.nota} sx={{ mt: 2 }} onChange={e => setAvaliacaoForm({ ...avaliacaoForm, nota: parseFloat(e.target.value) || 0 })} inputProps={{ min: 0, max: 10 }} />
          <TextField fullWidth label="Data Avaliação" type="date" value={avaliacaoForm.dataAvaliacao} sx={{ mt: 2 }} onChange={e => setAvaliacaoForm({ ...avaliacaoForm, dataAvaliacao: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Observação" value={avaliacaoForm.observacao} sx={{ mt: 2 }} onChange={e => setAvaliacaoForm({ ...avaliacaoForm, observacao: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvaliacaoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarAvaliacao}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
