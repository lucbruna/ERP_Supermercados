'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Inventory } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import KpiCard from '@/components/common/KpiCard';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { inventoryApi } from '@/lib/api';

const columns = [
  { id: 'codigo', label: 'Código' },
  { id: 'produto', label: 'Produto' },
  { id: 'categoria', label: 'Categoria' },
  { id: 'quantidade', label: 'Qtd.', format: (v: unknown) => Number(v) < 20 ? <Chip label={String(v)} color="error" size="small" /> : String(v) },
  { id: 'minimo', label: 'Qtd. Mínima' },
  { id: 'unidade', label: 'Unidade' },
  { id: 'precoCusto', label: 'Custo', format: (v: unknown) => `R$ ${Number(v).toFixed(2)}` },
  { id: 'precoVenda', label: 'Venda', format: (v: unknown) => `R$ ${Number(v).toFixed(2)}` },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function EstoquePage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [codigo, setCodigo] = useState('');
  const [produto, setProduto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidade, setUnidade] = useState('unidades');
  const [quantidade, setQuantidade] = useState('');
  const [minimo, setMinimo] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [status, setStatus] = useState('disponivel');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.get('/produtos');
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
    setCodigo(''); setProduto(''); setCategoria(''); setUnidade('unidades');
    setQuantidade(''); setMinimo(''); setPrecoCusto(''); setPrecoVenda('');
    setStatus('disponivel');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setCodigo(String(row.codigo ?? ''));
    setProduto(String(row.produto ?? ''));
    setCategoria(String(row.categoria ?? ''));
    setUnidade(String(row.unidade ?? 'unidades'));
    setQuantidade(String(row.quantidade ?? ''));
    setMinimo(String(row.minimo ?? ''));
    setPrecoCusto(String(row.precoCusto ?? ''));
    setPrecoVenda(String(row.precoVenda ?? ''));
    setStatus(String(row.status ?? 'disponivel'));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        codigo, produto, categoria, unidade,
        quantidade: parseInt(quantidade, 10),
        minimo: parseInt(minimo, 10),
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        status,
      };
      if (editingRow) {
        await inventoryApi.patch(`/produtos/${editingRow.id}`, payload);
        setSnackbar({ open: true, message: 'Produto atualizado com sucesso', severity: 'success' });
      } else {
        await inventoryApi.post('/produtos', payload);
        setSnackbar({ open: true, message: 'Produto criado com sucesso', severity: 'success' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar produto', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    try {
      await inventoryApi.delete(`/produtos/${row.id}`);
      setSnackbar({ open: true, message: 'Produto removido', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao remover produto', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Gestão de Estoque
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Produtos" value="2.847" icon={<Inventory />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Estoque Baixo" value="23" icon={<Inventory />} trend="up" trendValue="+5" color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Valor em Estoque" value="R$ 1,8M" icon={<Inventory />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Giro Mensal" value="8,5%" icon={<Inventory />} trend="up" trendValue="+1,2%" color="success.main" />
        </Grid>
      </Grid>

      <DataTable
        title="Produtos"
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo Produto
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingRow ? 'Editar Produto' : 'Novo Produto'}
        loading={submitting}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Produto" value={produto} onChange={(e) => setProduto(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Categoria" select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {['Grãos', 'Mercearia', 'Laticínios', 'Bebidas', 'Limpeza', 'Hortifrúti', 'Açougue', 'Padaria'].map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Unidade" select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
              {['unidades', 'sacos', 'kg', 'litros', 'caixas', 'pacotes'].map((uni) => (
                <MenuItem key={uni} value={uni}>{uni}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Qtd. Mínima" type="number" value={minimo} onChange={(e) => setMinimo(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Status" select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="disponivel">Disponível</MenuItem>
              <MenuItem value="indisponivel">Indisponível</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Preço de Custo" type="number" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Preço de Venda" type="number" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} />
          </Grid>
        </Grid>
      </ModalForm>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
