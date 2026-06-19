'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  LocalShipping, CheckCircle, Build, Warning, Add, Refresh, Edit, Delete, Person, Speed,
} from '@mui/icons-material';
import { frotaApi } from '@/lib/api';

const VEICULOS_BASE = '/frota/veiculos';
const MOTORISTAS_BASE = '/frota/motoristas';
const ABASTECIMENTOS_BASE = '/frota/abastecimentos';
const MANUTENCOES_BASE = '/frota/manutencoes';

export default function FrotaPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [loadingAbastecimentos, setLoadingAbastecimentos] = useState(false);
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [loadingManutencoes, setLoadingManutencoes] = useState(false);

  const [openVeiculoDialog, setOpenVeiculoDialog] = useState(false);
  const [editVeiculo, setEditVeiculo] = useState<any>(null);
  const [veiculoForm, setVeiculoForm] = useState({
    placa: '', modelo: '', marca: '', ano: new Date().getFullYear(),
    situacao: 'ATIVO', kmAtual: 0, tipoCombustivel: 'GASOLINA', renavam: '', chassi: '',
  });

  const [openMotoristaDialog, setOpenMotoristaDialog] = useState(false);
  const [editMotorista, setEditMotorista] = useState<any>(null);
  const [motoristaForm, setMotoristaForm] = useState({
    nome: '', cpf: '', cnh: '', categoriaCnh: 'B', validadeCnh: '', situacao: 'ATIVO',
    telefone: '', email: '',
  });

  useEffect(() => {
    carregarVeiculos();
    carregarMotoristas();
    carregarAbastecimentos();
    carregarManutencoes();
  }, []);

  async function carregarVeiculos() {
    setLoadingVeiculos(true);
    try { const { data } = await frotaApi.get(VEICULOS_BASE); setVeiculos(Array.isArray(data) ? data : []); }
    catch { setVeiculos([]); }
    finally { setLoadingVeiculos(false); }
  }

  async function carregarMotoristas() {
    setLoadingMotoristas(true);
    try { const { data } = await frotaApi.get(MOTORISTAS_BASE); setMotoristas(Array.isArray(data) ? data : []); }
    catch { setMotoristas([]); }
    finally { setLoadingMotoristas(false); }
  }

  async function carregarAbastecimentos() {
    setLoadingAbastecimentos(true);
    try { const { data } = await frotaApi.get(ABASTECIMENTOS_BASE); setAbastecimentos(Array.isArray(data) ? data : []); }
    catch { setAbastecimentos([]); }
    finally { setLoadingAbastecimentos(false); }
  }

  async function carregarManutencoes() {
    setLoadingManutencoes(true);
    try { const { data } = await frotaApi.get(MANUTENCOES_BASE); setManutencoes(Array.isArray(data) ? data : []); }
    catch { setManutencoes([]); }
    finally { setLoadingManutencoes(false); }
  }

  async function salvarVeiculo() {
    try {
      if (editVeiculo) {
        await frotaApi.patch(`${VEICULOS_BASE}/${editVeiculo.id}`, veiculoForm);
        setSuccess('Veículo atualizado');
      } else {
        await frotaApi.post(VEICULOS_BASE, veiculoForm);
        setSuccess('Veículo cadastrado');
      }
      setOpenVeiculoDialog(false);
      setEditVeiculo(null);
      await carregarVeiculos();
    } catch { setError('Erro ao salvar veículo'); }
  }

  async function excluirVeiculo(id: string) {
    if (!confirm('Excluir este veículo?')) return;
    try { await frotaApi.delete(`${VEICULOS_BASE}/${id}`); setSuccess('Veículo excluído'); await carregarVeiculos(); }
    catch { setError('Erro ao excluir'); }
  }

  async function salvarMotorista() {
    try {
      if (editMotorista) {
        await frotaApi.patch(`${MOTORISTAS_BASE}/${editMotorista.id}`, motoristaForm);
        setSuccess('Motorista atualizado');
      } else {
        await frotaApi.post(MOTORISTAS_BASE, motoristaForm);
        setSuccess('Motorista cadastrado');
      }
      setOpenMotoristaDialog(false);
      setEditMotorista(null);
      await carregarMotoristas();
    } catch { setError('Erro ao salvar motorista'); }
  }

  async function excluirMotorista(id: string) {
    if (!confirm('Excluir este motorista?')) return;
    try { await frotaApi.delete(`${MOTORISTAS_BASE}/${id}`); setSuccess('Motorista excluído'); await carregarMotoristas(); }
    catch { setError('Erro ao excluir'); }
  }

  function abrirEditarVeiculo(v: any) {
    setEditVeiculo(v);
    setVeiculoForm({
      placa: v.placa, modelo: v.modelo, marca: v.marca, ano: v.ano || new Date().getFullYear(),
      situacao: v.situacao || 'ATIVO', kmAtual: v.kmAtual || 0,
      tipoCombustivel: v.tipoCombustivel || 'GASOLINA', renavam: v.renavam || '', chassi: v.chassi || '',
    });
    setOpenVeiculoDialog(true);
  }

  function abrirEditarMotorista(m: any) {
    setEditMotorista(m);
    setMotoristaForm({
      nome: m.nome, cpf: m.cpf, cnh: m.cnh, categoriaCnh: m.categoriaCnh || 'B',
      validadeCnh: m.validadeCnh || '', situacao: m.situacao || 'ATIVO',
      telefone: m.telefone || '', email: m.email || '',
    });
    setOpenMotoristaDialog(true);
  }

  const situacaoChip = (s: string) => {
    const m: Record<string, any> = {
      ATIVO: <Chip label="Ativo" color="success" size="small" />,
      INATIVO: <Chip label="Inativo" color="error" size="small" />,
      MANUTENCAO: <Chip label="Em Manutenção" color="warning" size="small" />,
      ALOCADO: <Chip label="Alocado" color="info" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const veiculosAtivos = veiculos.filter((v: any) => v.situacao === 'ATIVO');
  const manutencoesPendentes = manutencoes.filter((m: any) => m.status === 'PENDENTE' || m.status === 'EM_ANDAMENTO');
  const totalMultas = manutencoes.filter((m: any) => m.tipo === 'MULTA').length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
        Frota
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{veiculos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Veículos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{veiculosAtivos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Ativos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{manutencoesPendentes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Manutenções Pendentes</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{totalMultas}</Typography>
            <Typography variant="body2" color="text.secondary">Multas</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<LocalShipping />} label="Veículos" />
          <Tab icon={<Person />} label="Motoristas" />
          <Tab icon={<Speed />} label="Abastecimentos" />
          <Tab icon={<Build />} label="Manutenções" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditVeiculo(null); setVeiculoForm({ placa: '', modelo: '', marca: '', ano: new Date().getFullYear(), situacao: 'ATIVO', kmAtual: 0, tipoCombustivel: 'GASOLINA', renavam: '', chassi: '' }); setOpenVeiculoDialog(true); }}>Novo Veículo</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarVeiculos}>Atualizar</Button>
            </Box>
            {loadingVeiculos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Placa</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Marca</TableCell>
                      <TableCell>Ano</TableCell>
                      <TableCell>Situação</TableCell>
                      <TableCell>KM Atual</TableCell>
                      <TableCell>Combustível</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {veiculos.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell><Chip label={v.placa} color="primary" size="small" /></TableCell>
                        <TableCell>{v.modelo}</TableCell>
                        <TableCell>{v.marca}</TableCell>
                        <TableCell>{v.ano || '-'}</TableCell>
                        <TableCell>{situacaoChip(v.situacao)}</TableCell>
                        <TableCell>{Number(v.kmAtual || 0).toLocaleString()} km</TableCell>
                        <TableCell>{v.tipoCombustivel || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarVeiculo(v)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirVeiculo(v.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {veiculos.length === 0 && <TableRow><TableCell colSpan={8} align="center">Nenhum veículo cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditMotorista(null); setMotoristaForm({ nome: '', cpf: '', cnh: '', categoriaCnh: 'B', validadeCnh: '', situacao: 'ATIVO', telefone: '', email: '' }); setOpenMotoristaDialog(true); }}>Novo Motorista</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarMotoristas}>Atualizar</Button>
            </Box>
            {loadingMotoristas ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>CPF</TableCell>
                      <TableCell>CNH</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Validade CNH</TableCell>
                      <TableCell>Situação</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {motoristas.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.nome}</TableCell>
                        <TableCell>{m.cpf}</TableCell>
                        <TableCell>{m.cnh}</TableCell>
                        <TableCell>{m.categoriaCnh || '-'}</TableCell>
                        <TableCell>{m.validadeCnh ? new Date(m.validadeCnh).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{situacaoChip(m.situacao)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarMotorista(m)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirMotorista(m.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {motoristas.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nenhum motorista cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarAbastecimentos}>Atualizar</Button>
            </Box>
            {loadingAbastecimentos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Veículo</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Litros</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Combustível</TableCell>
                      <TableCell>Km</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {abastecimentos.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.veiculo?.placa || a.veiculoId}</TableCell>
                        <TableCell>{a.data ? new Date(a.data).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{Number(a.litros || 0).toFixed(1)} L</TableCell>
                        <TableCell>R$ {Number(a.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{a.tipoCombustivel || '-'}</TableCell>
                        <TableCell>{Number(a.kmAtual || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {abastecimentos.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhum abastecimento registrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarManutencoes}>Atualizar</Button>
            </Box>
            {loadingManutencoes ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Veículo</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manutencoes.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.veiculo?.placa || m.veiculoId}</TableCell>
                        <TableCell>{m.tipo || '-'}</TableCell>
                        <TableCell>{m.descricao || '-'}</TableCell>
                        <TableCell>{m.data ? new Date(m.data).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>R$ {Number(m.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{situacaoChip(m.status)}</TableCell>
                      </TableRow>
                    ))}
                    {manutencoes.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhuma manutenção registrada</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openVeiculoDialog} onClose={() => setOpenVeiculoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Placa" value={veiculoForm.placa} sx={{ mt: 1 }} onChange={e => setVeiculoForm({ ...veiculoForm, placa: e.target.value })} />
          <TextField fullWidth label="Modelo" value={veiculoForm.modelo} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })} />
          <TextField fullWidth label="Marca" value={veiculoForm.marca} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, marca: e.target.value })} />
          <TextField fullWidth label="Ano" type="number" value={veiculoForm.ano} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, ano: parseInt(e.target.value) || new Date().getFullYear() })} />
          <TextField select fullWidth label="Situação" value={veiculoForm.situacao} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, situacao: e.target.value })}>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="INATIVO">Inativo</MenuItem>
            <MenuItem value="MANUTENCAO">Em Manutenção</MenuItem>
            <MenuItem value="ALOCADO">Alocado</MenuItem>
          </TextField>
          <TextField fullWidth label="KM Atual" type="number" value={veiculoForm.kmAtual} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, kmAtual: parseInt(e.target.value) || 0 })} />
          <TextField select fullWidth label="Tipo Combustível" value={veiculoForm.tipoCombustivel} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, tipoCombustivel: e.target.value })}>
            <MenuItem value="GASOLINA">Gasolina</MenuItem>
            <MenuItem value="ETANOL">Etanol</MenuItem>
            <MenuItem value="DIESEL">Diesel</MenuItem>
            <MenuItem value="FLEX">Flex</MenuItem>
            <MenuItem value="GNV">GNV</MenuItem>
            <MenuItem value="ELETRICO">Elétrico</MenuItem>
          </TextField>
          <TextField fullWidth label="Renavam" value={veiculoForm.renavam} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, renavam: e.target.value })} />
          <TextField fullWidth label="Chassi" value={veiculoForm.chassi} sx={{ mt: 2 }} onChange={e => setVeiculoForm({ ...veiculoForm, chassi: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVeiculoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarVeiculo}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMotoristaDialog} onClose={() => setOpenMotoristaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMotorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={motoristaForm.nome} sx={{ mt: 1 }} onChange={e => setMotoristaForm({ ...motoristaForm, nome: e.target.value })} />
          <TextField fullWidth label="CPF" value={motoristaForm.cpf} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, cpf: e.target.value })} />
          <TextField fullWidth label="CNH" value={motoristaForm.cnh} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, cnh: e.target.value })} />
          <TextField select fullWidth label="Categoria CNH" value={motoristaForm.categoriaCnh} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, categoriaCnh: e.target.value })}>
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
            <MenuItem value="E">E</MenuItem>
            <MenuItem value="AB">AB</MenuItem>
            <MenuItem value="AC">AC</MenuItem>
            <MenuItem value="AD">AD</MenuItem>
          </TextField>
          <TextField fullWidth label="Validade CNH" type="date" value={motoristaForm.validadeCnh} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, validadeCnh: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField select fullWidth label="Situação" value={motoristaForm.situacao} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, situacao: e.target.value })}>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="INATIVO">Inativo</MenuItem>
            <MenuItem value="FERIAS">Férias</MenuItem>
            <MenuItem value="AFASTADO">Afastado</MenuItem>
          </TextField>
          <TextField fullWidth label="Telefone" value={motoristaForm.telefone} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, telefone: e.target.value })} />
          <TextField fullWidth label="Email" value={motoristaForm.email} sx={{ mt: 2 }} onChange={e => setMotoristaForm({ ...motoristaForm, email: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMotoristaDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarMotorista}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
