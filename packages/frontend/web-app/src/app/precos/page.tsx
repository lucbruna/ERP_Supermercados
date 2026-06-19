'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert,
  Snackbar, CircularProgress, TablePagination,
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, PriceCheck,
} from '@mui/icons-material';
import api from '@/lib/api';

interface TabelaPreco {
  id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  createdAt: string;
  _count: { itens: number };
}

export default function PrecosPage() {
  const [tabelas, setTabelas] = useState<TabelaPreco[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [form, setForm] = useState({ nome: '', tipo: 'PADRAO', ativo: true, dataInicio: '', dataFim: '' });

  useEffect(() => { loadTabelas(); }, [page, rowsPerPage]);

  async function loadTabelas() {
    setLoading(true);
    try {
      const { data } = await api.get(`/pdv/tabelas-preco?page=${page + 1}&limit=${rowsPerPage}`);
      if (data.success) {
        setTabelas(data.data);
        setTotal(data.pagination.total);
      }
    } catch { setSnackbar({ open: true, message: 'Erro ao carregar tabelas', severity: 'error' }); }
    finally { setLoading(false); }
  }

  async function salvar() {
    try {
      if (editId) {
        await api.patch(`/pdv/tabelas-preco/${editId}`, form);
        setSnackbar({ open: true, message: 'Tabela atualizada!', severity: 'success' });
      } else {
        await api.post('/pdv/tabelas-preco', { ...form, companyId: 'bfb41389-5e6d-47bf-8765-be14adebe5db' });
        setSnackbar({ open: true, message: 'Tabela criada!', severity: 'success' });
      }
      setOpenDialog(false);
      loadTabelas();
    } catch { setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' }); }
  }

  async function deletar(id: string) {
    if (!confirm('Remover tabela de preço?')) return;
    try {
      await api.delete(`/pdv/tabelas-preco/${id}`);
      setSnackbar({ open: true, message: 'Tabela removida', severity: 'success' });
      loadTabelas();
    } catch { setSnackbar({ open: true, message: 'Erro ao remover', severity: 'error' }); }
  }

  function abrirDialog(tabela?: TabelaPreco) {
    if (tabela) {
      setEditId(tabela.id);
      setForm({ nome: tabela.nome, tipo: tabela.tipo, ativo: tabela.ativo, dataInicio: tabela.dataInicio || '', dataFim: tabela.dataFim || '' });
    } else {
      setEditId(null);
      setForm({ nome: '', tipo: 'PADRAO', ativo: true, dataInicio: '', dataFim: '' });
    }
    setOpenDialog(true);
  }

  const tipoColors: Record<string, string> = {
    PADRAO: '#1976d2', PROMOCIONAL: '#f57c00', CLIENTE: '#388e3c', QUANTIDADE: '#7b1fa2', ATACADO: '#c62828',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Tabelas de Preço</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => abrirDialog()}>
          Nova Tabela
        </Button>
      </Box>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Itens</TableCell>
                <TableCell>Vigência</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
              ) : tabelas.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Nenhuma tabela cadastrada</TableCell></TableRow>
              ) : tabelas.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.nome}</TableCell>
                  <TableCell>
                    <Chip label={t.tipo} size="small" sx={{ bgcolor: tipoColors[t.tipo] || '#666', color: '#fff' }} />
                  </TableCell>
                  <TableCell>{t._count.itens}</TableCell>
                  <TableCell>
                    {t.dataInicio ? new Date(t.dataInicio).toLocaleDateString() : '—'}
                    {' até '}
                    {t.dataFim ? new Date(t.dataFim).toLocaleDateString() : '∞'}
                  </TableCell>
                  <TableCell>
                    <Chip label={t.ativo ? 'Ativo' : 'Inativo'} color={t.ativo ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => abrirDialog(t)}><Edit /></IconButton>
                    <IconButton onClick={() => deletar(t.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }} />
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar' : 'Nova'} Tabela de Preço</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} fullWidth required />
            <TextField select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} fullWidth>
              <MenuItem value="PADRAO">Padrão</MenuItem>
              <MenuItem value="PROMOCIONAL">Promocional</MenuItem>
              <MenuItem value="CLIENTE">Por Cliente</MenuItem>
              <MenuItem value="QUANTIDADE">Por Quantidade</MenuItem>
              <MenuItem value="ATACADO">Atacado</MenuItem>
            </TextField>
            <TextField label="Data Início" type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Data Fim" type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={!form.nome}>
            {editId ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
