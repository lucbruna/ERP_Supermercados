'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, People } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { rhApi } from '@/lib/api';

const columns = [
  { id: 'nome', label: 'Nome' },
  { id: 'cargo', label: 'Cargo' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'email', label: 'Email' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
  { id: 'admissao', label: 'Admissão' },
];

export default function RHPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [status, setStatus] = useState('ativo');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await rhApi.get('/funcionarios');
      setRows(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingRow(null);
    setNome(''); setEmail(''); setTelefone(''); setCpf('');
    setCargo(''); setDepartamento(''); setAdmissao(''); setStatus('ativo');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setNome(String(row.nome ?? ''));
    setEmail(String(row.email ?? ''));
    setTelefone(String(row.telefone ?? ''));
    setCpf(String(row.cpf ?? ''));
    setCargo(String(row.cargo ?? ''));
    setDepartamento(String(row.departamento ?? ''));
    setAdmissao(String(row.admissao ?? ''));
    setStatus(String(row.status ?? 'ativo'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { nome, email, telefone, cpf, cargo, departamento, admissao, status };
      if (editingRow) {
        await rhApi.patch(`/funcionarios/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Funcionário atualizado com sucesso', severity: 'success' });
      } else {
        await rhApi.post('/funcionarios', payload);
        setSnackbar({ open: true, message: 'Funcionário criado com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar funcionário', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await rhApi.delete(`/funcionarios/${row.id}`);
      setSnackbar({ open: true, message: 'Funcionário removido', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover funcionário', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Gestão de RH
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Funcionários" value={128} icon={<People />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ativos" value={118} icon={<People />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Inativos" value={10} icon={<People />} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Folha Mensal" value="R$ 245 mil" icon={<People />} color="info.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Funcionários"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo Funcionário
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Funcionário' : 'Novo Funcionário'}
        loading={submitting}
        maxWidth="md"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Departamento" select value={departamento} onChange={(e) => setDepartamento(e.target.value)}>
              {['RH', 'Financeiro', 'PDV', 'Estoque', 'Compras', 'CRM', 'Administrativo'].map((dep) => (
                <MenuItem key={dep} value={dep}>{dep}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Data de Admissão" type="date" value={admissao} onChange={(e) => setAdmissao(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Status" select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </ModalForm>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
