'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, TextField, MenuItem,
  LinearProgress, Alert, Grid, Snackbar,
} from '@mui/material';
import {
  People, AttachMoney, BeachAccess, AccessTime, CardGiftcard, Add, Refresh,
  Group, TrendingUp,
} from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { rhApi } from '@/lib/api';

const colsFuncionarios = [
  { id: 'nome', label: 'Nome' },
  { id: 'cpf', label: 'CPF' },
  { id: 'cargo', label: 'Cargo' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'salario', label: 'Salário', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'admissao', label: 'Admissão' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsFolha = [
  { id: 'competencia', label: 'Competência' },
  { id: 'funcionario', label: 'Funcionário' },
  { id: 'salarioBase', label: 'Salário Base', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'descontos', label: 'Descontos', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'liquido', label: 'Líquido', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsFerias = [
  { id: 'funcionario', label: 'Funcionário' },
  { id: 'inicio', label: 'Início' },
  { id: 'fim', label: 'Fim' },
  { id: 'dias', label: 'Dias' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsPonto = [
  { id: 'funcionario', label: 'Funcionário' },
  { id: 'data', label: 'Data' },
  { id: 'entrada', label: 'Entrada' },
  { id: 'saidaAlmoco', label: 'Saída Almoço' },
  { id: 'retornoAlmoco', label: 'Retorno Almoço' },
  { id: 'saida', label: 'Saída' },
  { id: 'horasTrabalhadas', label: 'Horas Trab.' },
];

const colsBeneficios = [
  { id: 'funcionario', label: 'Funcionário' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'inicio', label: 'Início' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function RHPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loadingFunc, setLoadingFunc] = useState(false);
  const [folhas, setFolhas] = useState<any[]>([]);
  const [loadingFolha, setLoadingFolha] = useState(false);
  const [ferias, setFerias] = useState<any[]>([]);
  const [loadingFerias, setLoadingFerias] = useState(false);
  const [registrosPonto, setRegistrosPonto] = useState<any[]>([]);
  const [loadingPonto, setLoadingPonto] = useState(false);
  const [beneficios, setBeneficios] = useState<any[]>([]);
  const [loadingBene, setLoadingBene] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formCargo, setFormCargo] = useState('');
  const [formDepartamento, setFormDepartamento] = useState('');
  const [formSalario, setFormSalario] = useState('');
  const [formAdmissao, setFormAdmissao] = useState('');
  const [formStatus, setFormStatus] = useState('ativo');

  useEffect(() => {
    carregarTodos();
  }, []);

  async function carregarTodos() {
    await Promise.all([
      carregarFuncionarios(),
      carregarFolhas(),
      carregarFerias(),
      carregarPonto(),
      carregarBeneficios(),
    ]);
  }

  async function carregarFuncionarios() {
    setLoadingFunc(true);
    try { const { data } = await rhApi.get('/funcionarios'); setFuncionarios(Array.isArray(data) ? data : data.content ?? []); }
    catch { setFuncionarios([]); }
    finally { setLoadingFunc(false); }
  }

  async function carregarFolhas() {
    setLoadingFolha(true);
    try { const { data } = await rhApi.get('/folhas-pagamento'); setFolhas(Array.isArray(data) ? data : data.content ?? []); }
    catch { setFolhas([]); }
    finally { setLoadingFolha(false); }
  }

  async function carregarFerias() {
    setLoadingFerias(true);
    try { const { data } = await rhApi.get('/ferias'); setFerias(Array.isArray(data) ? data : data.content ?? []); }
    catch { setFerias([]); }
    finally { setLoadingFerias(false); }
  }

  async function carregarPonto() {
    setLoadingPonto(true);
    try { const { data } = await rhApi.get('/registros-ponto'); setRegistrosPonto(Array.isArray(data) ? data : data.content ?? []); }
    catch { setRegistrosPonto([]); }
    finally { setLoadingPonto(false); }
  }

  async function carregarBeneficios() {
    setLoadingBene(true);
    try { const { data } = await rhApi.get('/beneficios'); setBeneficios(Array.isArray(data) ? data : data.content ?? []); }
    catch { setBeneficios([]); }
    finally { setLoadingBene(false); }
  }

  const funcionariosAtivos = funcionarios.filter((f: any) => f.status === 'ativo' || f.status === 'ATIVO');
  const feriasPendentes = ferias.filter((f: any) => f.status === 'pendente' || f.status === 'agendado' || f.status === 'AGENDADO');
  const totalFolhaMes = folhas
    .filter((f: any) => f.status !== 'cancelado')
    .reduce((acc: number, f: any) => acc + Number(f.liquido || f.valorLiquido || 0), 0);

  function abrirCriar() {
    setEditRow(null);
    setFormNome(''); setFormCpf(''); setFormEmail(''); setFormTelefone('');
    setFormCargo(''); setFormDepartamento(''); setFormSalario(''); setFormAdmissao(''); setFormStatus('ativo');
    setModalOpen(true);
  }

  function abrirEditar(row: any) {
    setEditRow(row);
    setFormNome(String(row.nome ?? '')); setFormCpf(String(row.cpf ?? ''));
    setFormEmail(String(row.email ?? '')); setFormTelefone(String(row.telefone ?? ''));
    setFormCargo(String(row.cargo ?? '')); setFormDepartamento(String(row.departamento ?? ''));
    setFormSalario(String(row.salario ?? '')); setFormAdmissao(String(row.admissao ?? ''));
    setFormStatus(String(row.status ?? 'ativo'));
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = { nome: formNome, cpf: formCpf, email: formEmail, telefone: formTelefone, cargo: formCargo, departamento: formDepartamento, salario: parseFloat(formSalario) || 0, admissao: formAdmissao, status: formStatus };
      if (editRow) {
        await rhApi.patch(`/funcionarios/${editRow.id}`, payload);
        setSuccess('Funcionário atualizado');
      } else {
        await rhApi.post('/funcionarios', payload);
        setSuccess('Funcionário cadastrado');
      }
      setModalOpen(false);
      carregarFuncionarios();
    } catch {
      setError('Erro ao salvar funcionário');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: any) {
    try {
      await rhApi.delete(`/funcionarios/${row.id}`);
      setSuccess('Funcionário removido');
      carregarFuncionarios();
    } catch {
      setError('Erro ao remover funcionário');
    }
  }

  const currentData = tab === 0 ? { rows: funcionarios, loading: loadingFunc, cols: colsFuncionarios, title: 'Funcionários', showActions: true }
    : tab === 1 ? { rows: folhas, loading: loadingFolha, cols: colsFolha, title: 'Folha de Pagamento', showActions: false }
    : tab === 2 ? { rows: ferias, loading: loadingFerias, cols: colsFerias, title: 'Férias', showActions: false }
    : tab === 3 ? { rows: registrosPonto, loading: loadingPonto, cols: colsPonto, title: 'Ponto Eletrônico', showActions: false }
    : { rows: beneficios, loading: loadingBene, cols: colsBeneficios, title: 'Benefícios', showActions: false };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <People sx={{ mr: 1, verticalAlign: 'middle' }} />
        RH
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{funcionariosAtivos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Funcionários Ativos</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalFolhaMes.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Folha Mês</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{feriasPendentes.length}</Typography>
            <Typography variant="body2" color="text.secondary">Férias Pendentes</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{registrosPonto.filter((r: any) => {
              const hoje = new Date().toISOString().split('T')[0];
              return r.data?.startsWith(hoje) || r.createdAt?.startsWith(hoje);
            }).length}</Typography>
            <Typography variant="body2" color="text.secondary">Ponto Hoje</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Group />} label="Funcionários" />
          <Tab icon={<AttachMoney />} label="Folha Pagamento" />
          <Tab icon={<BeachAccess />} label="Férias" />
          <Tab icon={<AccessTime />} label="Ponto Eletrônico" />
          <Tab icon={<CardGiftcard />} label="Benefícios" />
        </Tabs>

        <DataTable
          title={currentData.title}
          columns={currentData.cols}
          rows={currentData.rows}
          loading={currentData.loading}
          onEdit={currentData.showActions ? abrirEditar : undefined}
          onDelete={currentData.showActions ? handleDelete : undefined}
          actions={currentData.showActions ? (
            <Button variant="contained" startIcon={<Add />} onClick={abrirCriar}>
              Novo Funcionário
            </Button>
          ) : undefined}
        />
      </Card>

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editRow ? 'Editar Funcionário' : 'Novo Funcionário'}
        loading={submitting}
        maxWidth="md"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome" value={formNome} onChange={e => setFormNome(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="CPF" value={formCpf} onChange={e => setFormCpf(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telefone" value={formTelefone} onChange={e => setFormTelefone(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Cargo" value={formCargo} onChange={e => setFormCargo(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Departamento" select value={formDepartamento} onChange={e => setFormDepartamento(e.target.value)}>
              {['RH', 'Financeiro', 'PDV', 'Estoque', 'Compras', 'CRM', 'Administrativo'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Salário (R$)" type="number" value={formSalario} onChange={e => setFormSalario(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Data Admissão" type="date" value={formAdmissao} onChange={e => setFormAdmissao(e.target.value)} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Status" select value={formStatus} onChange={e => setFormStatus(e.target.value)}>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
              <MenuItem value="ferias">Férias</MenuItem>
              <MenuItem value="afastado">Afastado</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </ModalForm>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
