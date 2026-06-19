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
import { Add, Group } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { crmApi } from '@/lib/api';

const columns = [
  { id: 'nome', label: 'Nome' },
  { id: 'email', label: 'Email' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'compras', label: 'Compras' },
  { id: 'gastoTotal', label: 'Gasto Total', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'ultimaCompra', label: 'Última Compra' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function CRMPage() {
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
  const [endereco, setEndereco] = useState('');
  const [status, setStatus] = useState('ativo');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await crmApi.get('/clientes');
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
    setEndereco(''); setStatus('ativo');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setNome(String(row.nome ?? ''));
    setEmail(String(row.email ?? ''));
    setTelefone(String(row.telefone ?? ''));
    setCpf(String(row.cpf ?? ''));
    setEndereco(String(row.endereco ?? ''));
    setStatus(String(row.status ?? 'ativo'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { nome, email, telefone, cpf, endereco, status };
      if (editingRow) {
        await crmApi.patch(`/clientes/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Cliente atualizado com sucesso', severity: 'success' });
      } else {
        await crmApi.post('/clientes', payload);
        setSnackbar({ open: true, message: 'Cliente criado com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar cliente', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await crmApi.delete(`/clientes/${row.id}`);
      setSnackbar({ open: true, message: 'Cliente removido', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover cliente', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        CRM - Clientes
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Clientes" value="1.847" icon={<Group />} trend="up" trendValue="+8%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Clientes Ativos" value="1.623" icon={<Group />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ticket Médio" value="R$ 89,50" icon={<Group />} trend="up" trendValue="+5%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Fidelidade" value="78%" icon={<Group />} color="warning.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Clientes"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo Cliente
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Cliente' : 'Novo Cliente'}
        loading={submitting}
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
            <TextField fullWidth label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
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
