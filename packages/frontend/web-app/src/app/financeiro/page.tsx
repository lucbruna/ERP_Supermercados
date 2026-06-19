'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, TextField, MenuItem,
  LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Snackbar,
} from '@mui/material';
import {
  AttachMoney, AccountBalance, ArrowUpward, ArrowDownward, Add, Refresh,
  TrendingUp, Receipt, Payment,
} from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import ModalForm from '@/components/common/ModalForm';
import StatusBadge from '@/components/common/StatusBadge';
import { financialApi } from '@/lib/api';

const colsPagar = [
  { id: 'fornecedor', label: 'Fornecedor' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'vencimento', label: 'Vencimento' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsReceber = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'vencimento', label: 'Vencimento' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsLancamentos = [
  { id: 'data', label: 'Data' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'categoria', label: 'Categoria' },
  { id: 'tipo', label: 'Tipo', format: (v: unknown) => <StatusBadge status={String(v)} /> },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

const colsConciliacao = [
  { id: 'data', label: 'Data' },
  { id: 'transacao', label: 'Transação' },
  { id: 'valor', label: 'Valor', format: (v: unknown) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  { id: 'conta', label: 'Conta' },
  { id: 'status', label: 'Status', format: (v: unknown) => <StatusBadge status={String(v)} /> },
];

export default function FinanceiroPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [loadingPagar, setLoadingPagar] = useState(false);
  const [contasReceber, setContasReceber] = useState<any[]>([]);
  const [loadingReceber, setLoadingReceber] = useState(false);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [loadingLanc, setLoadingLanc] = useState(false);
  const [conciliacoes, setConciliacoes] = useState<any[]>([]);
  const [loadingConc, setLoadingConc] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formFornecedor, setFormFornecedor] = useState('');
  const [formCliente, setFormCliente] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formVencimento, setFormVencimento] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formTipo, setFormTipo] = useState('Receita');
  const [formStatus, setFormStatus] = useState('pendente');
  const [formConta, setFormConta] = useState('');

  const endpoints = ['/contas-pagar', '/contas-receber', '/lancamentos', '/conciliacao'];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    await Promise.all([
      carregarContasPagar(),
      carregarContasReceber(),
      carregarLancamentos(),
      carregarConciliacao(),
    ]);
  }

  async function carregarContasPagar() {
    setLoadingPagar(true);
    try { const { data } = await financialApi.get(endpoints[0]); setContasPagar(Array.isArray(data) ? data : data.content ?? []); }
    catch { setContasPagar([]); }
    finally { setLoadingPagar(false); }
  }

  async function carregarContasReceber() {
    setLoadingReceber(true);
    try { const { data } = await financialApi.get(endpoints[1]); setContasReceber(Array.isArray(data) ? data : data.content ?? []); }
    catch { setContasReceber([]); }
    finally { setLoadingReceber(false); }
  }

  async function carregarLancamentos() {
    setLoadingLanc(true);
    try { const { data } = await financialApi.get(endpoints[2]); setLancamentos(Array.isArray(data) ? data : data.content ?? []); }
    catch { setLancamentos([]); }
    finally { setLoadingLanc(false); }
  }

  async function carregarConciliacao() {
    setLoadingConc(true);
    try { const { data } = await financialApi.get(endpoints[3]); setConciliacoes(Array.isArray(data) ? data : data.content ?? []); }
    catch { setConciliacoes([]); }
    finally { setLoadingConc(false); }
  }

  const totalPagar = contasPagar
    .filter((c: any) => c.status === 'pendente' || c.status === 'PENDENTE')
    .reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);

  const totalReceber = contasReceber
    .filter((c: any) => c.status === 'pendente' || c.status === 'PENDENTE')
    .reduce((acc: number, c: any) => acc + Number(c.valor || 0), 0);

  const saldoAtual = lancamentos
    .filter((l: any) => l.status !== 'cancelado' && l.status !== 'CANCELADO')
    .reduce((acc: number, l: any) => {
      const v = Number(l.valor || 0);
      return l.tipo === 'Receita' || l.tipo === 'receita' ? acc + v : acc - v;
    }, 0);

  const fluxoMes = lancamentos
    .filter((l: any) => {
      if (l.status === 'cancelado' || l.status === 'CANCELADO') return false;
      if (!l.data) return true;
      const d = new Date(l.data);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc: number, l: any) => {
      const v = Number(l.valor || 0);
      return l.tipo === 'Receita' || l.tipo === 'receita' ? acc + v : acc - v;
    }, 0);

  function abrirCriar() {
    setEditRow(null);
    setFormFornecedor(''); setFormCliente(''); setFormDescricao(''); setFormValor('');
    setFormVencimento(''); setFormCategoria(''); setFormTipo('Receita'); setFormStatus('pendente'); setFormConta('');
    setModalOpen(true);
  }

  function abrirEditar(row: any) {
    setEditRow(row);
    setFormFornecedor(String(row.fornecedor ?? '')); setFormCliente(String(row.cliente ?? ''));
    setFormDescricao(String(row.descricao ?? '')); setFormValor(String(row.valor ?? ''));
    setFormVencimento(String(row.vencimento ?? '')); setFormCategoria(String(row.categoria ?? ''));
    setFormTipo(String(row.tipo ?? 'Receita')); setFormStatus(String(row.status ?? 'pendente'));
    setFormConta(String(row.conta ?? ''));
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const endpoint = tab === 0 ? endpoints[0] : tab === 1 ? endpoints[1] : tab === 2 ? endpoints[2] : endpoints[3];
      const payload: any = { descricao: formDescricao, valor: parseFloat(formValor), status: formStatus };
      if (tab === 0) { payload.fornecedor = formFornecedor; payload.vencimento = formVencimento; }
      if (tab === 1) { payload.cliente = formCliente; payload.vencimento = formVencimento; }
      if (tab === 2) { payload.categoria = formCategoria; payload.tipo = formTipo; payload.data = formVencimento; }
      if (tab === 3) { payload.conta = formConta; payload.data = formVencimento; }

      if (editRow) {
        await financialApi.patch(`${endpoint}/${editRow.id}`, payload);
        setSuccess('Registro atualizado');
      } else {
        await financialApi.post(endpoint, payload);
        setSuccess('Registro criado');
      }
      setModalOpen(false);
      carregarDados();
    } catch {
      setError('Erro ao salvar registro');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: any) {
    const endpoint = tab === 0 ? endpoints[0] : tab === 1 ? endpoints[1] : tab === 2 ? endpoints[2] : endpoints[3];
    try {
      await financialApi.delete(`${endpoint}/${row.id}`);
      setSuccess('Registro removido');
      carregarDados();
    } catch {
      setError('Erro ao remover');
    }
  }

  const currentRows = tab === 0 ? contasPagar : tab === 1 ? contasReceber : tab === 2 ? lancamentos : conciliacoes;
  const currentLoading = tab === 0 ? loadingPagar : tab === 1 ? loadingReceber : tab === 2 ? loadingLanc : loadingConc;
  const currentColumns = tab === 0 ? colsPagar : tab === 1 ? colsReceber : tab === 2 ? colsLancamentos : colsConciliacao;
  const currentTitle = tab === 0 ? 'Contas a Pagar' : tab === 1 ? 'Contas a Receber' : tab === 2 ? 'Lançamentos' : 'Conciliação';

  function renderModalFields() {
    return (
      <Grid container spacing={2}>
        {tab === 0 && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fornecedor" value={formFornecedor} onChange={e => setFormFornecedor(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Vencimento" type="date" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} InputLabelProps={{ shrink: true }} required />
            </Grid>
          </>
        )}
        {tab === 1 && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Cliente" value={formCliente} onChange={e => setFormCliente(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Vencimento" type="date" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} InputLabelProps={{ shrink: true }} required />
            </Grid>
          </>
        )}
        {tab === 2 && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Data" type="date" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Categoria" select value={formCategoria} onChange={e => setFormCategoria(e.target.value)}>
                {['Vendas', 'Compras', 'RH', 'Operacional', 'Impostos', 'Investimento'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo" select value={formTipo} onChange={e => setFormTipo(e.target.value)}>
                <MenuItem value="Receita">Receita</MenuItem>
                <MenuItem value="Despesa">Despesa</MenuItem>
              </TextField>
            </Grid>
          </>
        )}
        {tab === 3 && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Conta" value={formConta} onChange={e => setFormConta(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Data" type="date" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} InputLabelProps={{ shrink: true }} required />
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Descrição" value={formDescricao} onChange={e => setFormDescricao(e.target.value)} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Valor (R$)" type="number" value={formValor} onChange={e => setFormValor(e.target.value)} required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Status" select value={formStatus} onChange={e => setFormStatus(e.target.value)}>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="pago">Pago</MenuItem>
            <MenuItem value="concluido">Concluído</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
        Financeiro
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">R$ {saldoAtual.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Saldo Atual</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalPagar.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Contas a Pagar</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">R$ {totalReceber.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Contas a Receber</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">R$ {fluxoMes.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Fluxo Mês</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<ArrowUpward />} label="Contas a Pagar" />
          <Tab icon={<ArrowDownward />} label="Contas a Receber" />
          <Tab icon={<Receipt />} label="Lançamentos" />
          <Tab icon={<Payment />} label="Conciliação" />
        </Tabs>

        <DataTable
          title={currentTitle}
          columns={currentColumns}
          rows={currentRows}
          loading={currentLoading}
          onEdit={abrirEditar}
          onDelete={handleDelete}
          actions={
            <Button variant="contained" startIcon={<Add />} onClick={abrirCriar}>
              {tab === 0 ? 'Nova Conta' : tab === 1 ? 'Nova Conta' : tab === 2 ? 'Novo Lançamento' : 'Nova Conciliação'}
            </Button>
          }
        />
      </Card>

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editRow ? `Editar ${currentTitle}` : `Nov${tab === 2 ? 'o' : 'a'} ${currentTitle}`}
        loading={submitting}
      >
        {renderModalFields()}
      </ModalForm>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
