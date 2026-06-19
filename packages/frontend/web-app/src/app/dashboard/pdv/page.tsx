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
import { Add, PointOfSale } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { pdvApi } from '@/lib/api';

const columns = [
  { id: 'id', label: 'Nº Venda' },
  { id: 'data', label: 'Data' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'itens', label: 'Itens' },
  { id: 'total', label: 'Total', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'formaPagamento', label: 'Pagamento' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function PDVPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState('');
  const [total, setTotal] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [status, setStatus] = useState('concluido');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await pdvApi.get('/vendas');
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
    setCliente(''); setItens(''); setTotal(''); setFormaPagamento(''); setStatus('concluido');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setCliente(String(row.cliente ?? ''));
    setItens(String(row.itens ?? ''));
    setTotal(String(row.total ?? ''));
    setFormaPagamento(String(row.formaPagamento ?? ''));
    setStatus(String(row.status ?? 'concluido'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { cliente, itens: parseInt(itens, 10) || 0, total: parseFloat(total), formaPagamento, status };
      if (editingRow) {
        await pdvApi.patch(`/vendas/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Venda atualizada com sucesso', severity: 'success' });
      } else {
        await pdvApi.post('/vendas', payload);
        setSnackbar({ open: true, message: 'Venda criada com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar venda', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await pdvApi.delete(`/vendas/${row.id}`);
      setSnackbar({ open: true, message: 'Venda removida', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover venda', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        PDV - Vendas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Vendas Hoje" value="R$ 45,2K" icon={<PointOfSale />} trend="up" trendValue="+12%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Qtd. Vendas" value="187" icon={<PointOfSale />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Ticket Médio" value="R$ 89,50" icon={<PointOfSale />} trend="up" trendValue="+5%" color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Itens Vendidos" value="1.452" icon={<PointOfSale />} color="warning.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Histórico de Vendas"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nova Venda
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Venda' : 'Nova Venda'}
        loading={submitting}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Itens" type="number" value={itens} onChange={(e) => setItens(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Valor Total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Forma de Pagamento" select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
              <MenuItem value="Cartão Débito">Cartão Débito</MenuItem>
              <MenuItem value="Cartão Crédito">Cartão Crédito</MenuItem>
              <MenuItem value="PIX">PIX</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Status" select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="concluido">Concluído</MenuItem>
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
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
