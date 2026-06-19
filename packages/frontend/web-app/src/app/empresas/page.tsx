'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import { Business, Store, Add, Refresh, Edit, ToggleOn, ToggleOff, Delete } from '@mui/icons-material';
import api from '@/lib/api';

export default function EmpresasPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loadingUnid, setLoadingUnid] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const [openEmpDialog, setOpenEmpDialog] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<any>(null);
  const [empForm, setEmpForm] = useState({ cnpj: '', razaoSocial: '', nomeFantasia: '', regimeTributario: 'SIMPLES_NACIONAL', inscricaoEstadual: '', inscricaoMunicipal: '' });

  const [openUnidDialog, setOpenUnidDialog] = useState(false);
  const [unidForm, setUnidForm] = useState({ companyId: '', nome: '', cnpj: '', tipo: 'LOJA' });

  useEffect(() => {
    carregarEmpresas();
  }, []);

  useEffect(() => {
    if (selectedCompany) carregarUnidades(selectedCompany);
  }, [selectedCompany]);

  async function carregarEmpresas() {
    setLoadingEmp(true);
    try { const { data } = await api.get('/auth/empresas'); setEmpresas(Array.isArray(data) ? data : []); }
    catch { setEmpresas([]); }
    finally { setLoadingEmp(false); }
  }

  async function carregarUnidades(companyId: string) {
    setLoadingUnid(true);
    try { const { data } = await api.get(`/auth/unidades?companyId=${companyId}`); setUnidades(Array.isArray(data) ? data : []); }
    catch { setUnidades([]); }
    finally { setLoadingUnid(false); }
  }

  async function salvarEmpresa() {
    try {
      if (editEmpresa) {
        await api.patch(`/auth/empresas/${editEmpresa.id}`, empForm);
        setSuccess('Empresa atualizada');
      } else {
        await api.post('/auth/empresas', empForm);
        setSuccess('Empresa criada');
      }
      setOpenEmpDialog(false);
      setEditEmpresa(null);
      await carregarEmpresas();
    } catch { setError('Erro ao salvar empresa'); }
  }

  async function toggleEmpresa(id: string) {
    try { await api.patch(`/auth/empresas/${id}/toggle-status`); setSuccess('Status alterado'); await carregarEmpresas(); }
    catch { setError('Erro'); }
  }

  async function salvarUnidade() {
    try {
      await api.post('/auth/unidades', unidForm);
      setSuccess('Unidade criada');
      setOpenUnidDialog(false);
      await carregarUnidades(unidForm.companyId);
    } catch { setError('Erro ao salvar unidade'); }
  }

  async function toggleUnidade(id: string) {
    try { await api.patch(`/auth/unidades/${id}/toggle-status`); setSuccess('Status alterado'); await carregarUnidades(selectedCompany); }
    catch { setError('Erro'); }
  }

  function abrirEditarEmpresa(emp: any) {
    setEditEmpresa(emp);
    setEmpForm({
      cnpj: emp.cnpj, razaoSocial: emp.razaoSocial, nomeFantasia: emp.nomeFantasia,
      regimeTributario: emp.regimeTributario, inscricaoEstadual: emp.inscricaoEstadual || '',
      inscricaoMunicipal: emp.inscricaoMunicipal || '',
    });
    setOpenEmpDialog(true);
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
        Multi-empresa
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Business />} label="Empresas" />
          <Tab icon={<Store />} label="Unidades" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditEmpresa(null); setEmpForm({ cnpj: '', razaoSocial: '', nomeFantasia: '', regimeTributario: 'SIMPLES_NACIONAL', inscricaoEstadual: '', inscricaoMunicipal: '' }); setOpenEmpDialog(true); }}>Nova Empresa</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarEmpresas}>Atualizar</Button>
            </Box>
            {loadingEmp ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Razão Social</TableCell>
                      <TableCell>Nome Fantasia</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Regime</TableCell>
                      <TableCell>Unidades</TableCell>
                      <TableCell>Usuários</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresas.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.razaoSocial}</TableCell>
                        <TableCell>{e.nomeFantasia}</TableCell>
                        <TableCell>{e.cnpj}</TableCell>
                        <TableCell><Chip label={e.regimeTributario} size="small" /></TableCell>
                        <TableCell>{e.unidades?.length || 0}</TableCell>
                        <TableCell>{e._count?.usuarios || '-'}</TableCell>
                        <TableCell><Chip label={e.ativo ? 'Ativo' : 'Inativo'} color={e.ativo ? 'success' : 'default'} size="small" /></TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarEmpresa(e)}><Edit /></IconButton>
                          <IconButton size="small" onClick={() => toggleEmpresa(e.id)}>{e.ativo ? <ToggleOff /> : <ToggleOn />}</IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {empresas.length === 0 && <TableRow><TableCell colSpan={8} align="center">Nenhuma empresa cadastrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField select label="Empresa" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} sx={{ minWidth: 300 }}>
                {empresas.map(e => <MenuItem key={e.id} value={e.id}>{e.nomeFantasia}</MenuItem>)}
              </TextField>
              {selectedCompany && <Button variant="contained" startIcon={<Add />} onClick={() => { setUnidForm({ companyId: selectedCompany, nome: '', cnpj: '', tipo: 'LOJA' }); setOpenUnidDialog(true); }}>Nova Unidade</Button>}
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => carregarUnidades(selectedCompany)}>Atualizar</Button>
            </Box>
            {loadingUnid ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Usuários</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unidades.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.nome}</TableCell>
                        <TableCell>{u.cnpj}</TableCell>
                        <TableCell><Chip label={u.tipo} size="small" /></TableCell>
                        <TableCell>{u._count?.usuarios || '-'}</TableCell>
                        <TableCell><Chip label={u.ativo ? 'Ativo' : 'Inativo'} color={u.ativo ? 'success' : 'default'} size="small" /></TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleUnidade(u.id)}>{u.ativo ? <ToggleOff /> : <ToggleOn />}</IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!selectedCompany && <TableRow><TableCell colSpan={6} align="center">Selecione uma empresa</TableCell></TableRow>}
                    {selectedCompany && unidades.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhuma unidade cadastrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openEmpDialog} onClose={() => setOpenEmpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="CNPJ" value={empForm.cnpj} sx={{ mt: 1 }} onChange={e => setEmpForm({ ...empForm, cnpj: e.target.value })} />
          <TextField fullWidth label="Razão Social" value={empForm.razaoSocial} sx={{ mt: 2 }} onChange={e => setEmpForm({ ...empForm, razaoSocial: e.target.value })} />
          <TextField fullWidth label="Nome Fantasia" value={empForm.nomeFantasia} sx={{ mt: 2 }} onChange={e => setEmpForm({ ...empForm, nomeFantasia: e.target.value })} />
          <TextField select fullWidth label="Regime Tributário" value={empForm.regimeTributario} sx={{ mt: 2 }} onChange={e => setEmpForm({ ...empForm, regimeTributario: e.target.value })}>
            <MenuItem value="SIMPLES_NACIONAL">Simples Nacional</MenuItem>
            <MenuItem value="LUCRO_PRESUMIDO">Lucro Presumido</MenuItem>
            <MenuItem value="LUCRO_REAL">Lucro Real</MenuItem>
            <MenuItem value="MEI">MEI</MenuItem>
          </TextField>
          <TextField fullWidth label="Inscrição Estadual" value={empForm.inscricaoEstadual} sx={{ mt: 2 }} onChange={e => setEmpForm({ ...empForm, inscricaoEstadual: e.target.value })} />
          <TextField fullWidth label="Inscrição Municipal" value={empForm.inscricaoMunicipal} sx={{ mt: 2 }} onChange={e => setEmpForm({ ...empForm, inscricaoMunicipal: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmpDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarEmpresa}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUnidDialog} onClose={() => setOpenUnidDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Unidade</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Tipo" value={unidForm.tipo} sx={{ mt: 1 }} onChange={e => setUnidForm({ ...unidForm, tipo: e.target.value })}>
            <MenuItem value="LOJA">Loja</MenuItem>
            <MenuItem value="CENTRO_DISTRIBUICAO">Centro de Distribuição</MenuItem>
            <MenuItem value="ESCRITORIO">Escritório</MenuItem>
            <MenuItem value="DEPOSITO">Depósito</MenuItem>
          </TextField>
          <TextField fullWidth label="Nome" value={unidForm.nome} sx={{ mt: 2 }} onChange={e => setUnidForm({ ...unidForm, nome: e.target.value })} />
          <TextField fullWidth label="CNPJ (filial)" value={unidForm.cnpj} sx={{ mt: 2 }} onChange={e => setUnidForm({ ...unidForm, cnpj: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnidDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarUnidade}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
