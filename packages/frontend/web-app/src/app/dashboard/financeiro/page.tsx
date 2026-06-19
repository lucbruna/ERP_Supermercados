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
import { Add, AttachMoney } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { financialApi } from '@/lib/api';

const columns = [
  { id: 'data', label: 'Data' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'categoria', label: 'Categoria' },
  { id: 'tipo', label: 'Tipo', format: (v: unknown) => <StatusBadge status={String(v)} /> },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function FinanceiroPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState('pendente');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await financialApi.get('/movimentacoes');
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
    setData(''); setDescricao(''); setCategoria(''); setTipo('');
    setValor(''); setStatus('pendente');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setData(String(row.data ?? ''));
    setDescricao(String(row.descricao ?? ''));
    setCategoria(String(row.categoria ?? ''));
    setTipo(String(row.tipo ?? ''));
    setValor(String(row.valor ?? ''));
    setStatus(String(row.status ?? 'pendente'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { data, descricao, categoria, tipo, valor: parseFloat(valor), status };
      if (editingRow) {
        await financialApi.patch(`/movimentacoes/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Movimentação atualizada com sucesso', severity: 'success' });
      } else {
        await financialApi.post('/movimentacoes', payload);
        setSnackbar({ open: true, message: 'Movimentação criada com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar movimentação', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await financialApi.delete(`/movimentacoes/${row.id}`);
      setSnackbar({ open: true, message: 'Movimentação removida', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover movimentação', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Financeiro
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Receita do Mês" value="R$ 1,2M" icon={<AttachMoney />} trend="up" trendValue="+15%" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Despesas do Mês" value="R$ 890K" icon={<AttachMoney />} trend="up" trendValue="+8%" color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Saldo Atual" value="R$ 310K" icon={<AttachMoney />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Contas a Pagar" value="R$ 45K" icon={<AttachMoney />} color="error.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Movimentações Financeiras"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nova Movimentação
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Movimentação' : 'Nova Movimentação'}
        loading={submitting}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Categoria" select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {['Vendas', 'Compras', 'RH', 'Operacional', 'Impostos', 'Investimento'].map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Tipo" select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <MenuItem value="Receita">Receita</MenuItem>
              <MenuItem value="Despesa">Despesa</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Status" select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="pago">Pago</MenuItem>
              <MenuItem value="concluido">Concluído</MenuItem>
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
