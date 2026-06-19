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
import { Add, ShoppingCart } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { comprasApi } from '@/lib/api';

const columns = [
  { id: 'pedido', label: 'Pedido' },
  { id: 'fornecedor', label: 'Fornecedor' },
  { id: 'data', label: 'Data' },
  { id: 'previsao', label: 'Previsão Entrega' },
  { id: 'itens', label: 'Itens' },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function ComprasPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [fornecedor, setFornecedor] = useState('');
  const [data, setData] = useState('');
  const [previsao, setPrevisao] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('pendente');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await comprasApi.get('/pedidos');
      setRows(Array.isArray(res) ? res : res.content ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingRow(null);
    setFornecedor(''); setData(''); setPrevisao('');
    setValor(''); setObservacoes(''); setStatus('pendente');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setFornecedor(String(row.fornecedor ?? ''));
    setData(String(row.data ?? ''));
    setPrevisao(String(row.previsao ?? ''));
    setValor(String(row.valor ?? ''));
    setObservacoes(String(row.observacoes ?? ''));
    setStatus(String(row.status ?? 'pendente'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { fornecedor, data, previsao, valor: parseFloat(valor), observacoes, status };
      if (editingRow) {
        await comprasApi.patch(`/pedidos/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Pedido atualizado com sucesso', severity: 'success' });
      } else {
        await comprasApi.post('/pedidos', payload);
        setSnackbar({ open: true, message: 'Pedido criado com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar pedido', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await comprasApi.delete(`/pedidos/${row.id}`);
      setSnackbar({ open: true, message: 'Pedido removido', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover pedido', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Compras
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pedidos Abertos" value="12" icon={<ShoppingCart />} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Compras do Mês" value="R$ 485K" icon={<ShoppingCart />} trend="up" trendValue="+8%" color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Fornecedores Ativos" value="34" icon={<ShoppingCart />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Prazo Médio" value="12 dias" icon={<ShoppingCart />} color="success.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Pedidos de Compra"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo Pedido
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Pedido' : 'Novo Pedido'}
        loading={submitting}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Fornecedor" select value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} required>
              {['Distribuidora A Ltda', 'Alimentos B S/A', 'Bebidas C Distribuidora', 'Limpeza D Ltda', 'Hortifrúti E'].map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Data do Pedido" type="date" value={data} onChange={(e) => setData(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Previsão Entrega" type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Valor Total" type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Status" select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="processando">Processando</MenuItem>
              <MenuItem value="entregue">Entregue</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Observações" multiline rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </Grid>
        </Grid>
      </ModalForm>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
