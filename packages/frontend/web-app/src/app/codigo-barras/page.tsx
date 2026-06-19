'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  QrCode, Inventory, Print, Dashboard, Add, Refresh, Edit, Delete, CheckCircle, Cancel,
} from '@mui/icons-material';
import { codigoBarrasApi } from '@/lib/api';

const CODIGOS_BASE = '/codigo-barras/codigos';
const TEMPLATES_BASE = '/codigo-barras/templates';

export default function CodigoBarrasPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [codigos, setCodigos] = useState<any[]>([]);
  const [loadingCodigos, setLoadingCodigos] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [openCodigoDialog, setOpenCodigoDialog] = useState(false);
  const [codigoForm, setCodigoForm] = useState({
    tipo: 'EAN13', produtoId: '', codigo: '', quantidade: 1,
  });

  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    nome: '', largura: 50, altura: 30, margemSuperior: 5, margemInferior: 5,
    margemEsquerda: 5, margemDireita: 5, formato: 'ETIQUETA',
  });

  useEffect(() => {
    carregarCodigos();
    carregarTemplates();
  }, []);

  async function carregarCodigos() {
    setLoadingCodigos(true);
    try { const { data } = await codigoBarrasApi.get(CODIGOS_BASE); setCodigos(Array.isArray(data) ? data : []); }
    catch { setCodigos([]); }
    finally { setLoadingCodigos(false); }
  }

  async function carregarTemplates() {
    setLoadingTemplates(true);
    try { const { data } = await codigoBarrasApi.get(TEMPLATES_BASE); setTemplates(Array.isArray(data) ? data : []); }
    catch { setTemplates([]); }
    finally { setLoadingTemplates(false); }
  }

  async function gerarCodigo() {
    try {
      await codigoBarrasApi.post(`${CODIGOS_BASE}/gerar`, codigoForm);
      setSuccess('Código gerado com sucesso');
      setOpenCodigoDialog(false);
      await carregarCodigos();
    } catch { setError('Erro ao gerar código'); }
  }

  async function salvarTemplate() {
    try {
      if (editTemplate) {
        await codigoBarrasApi.patch(`${TEMPLATES_BASE}/${editTemplate.id}`, templateForm);
        setSuccess('Template atualizado');
      } else {
        await codigoBarrasApi.post(TEMPLATES_BASE, templateForm);
        setSuccess('Template criado');
      }
      setOpenTemplateDialog(false);
      setEditTemplate(null);
      await carregarTemplates();
    } catch { setError('Erro ao salvar template'); }
  }

  async function excluirTemplate(id: string) {
    if (!confirm('Excluir este template?')) return;
    try { await codigoBarrasApi.delete(`${TEMPLATES_BASE}/${id}`); setSuccess('Template excluído'); await carregarTemplates(); }
    catch { setError('Erro ao excluir'); }
  }

  function abrirEditarTemplate(t: any) {
    setEditTemplate(t);
    setTemplateForm({
      nome: t.nome, largura: t.largura || 50, altura: t.altura || 30,
      margemSuperior: t.margemSuperior || 5, margemInferior: t.margemInferior || 5,
      margemEsquerda: t.margemEsquerda || 5, margemDireita: t.margemDireita || 5,
      formato: t.formato || 'ETIQUETA',
    });
    setOpenTemplateDialog(true);
  }

  const statusCodigoChip = (s: string) => {
    const m: Record<string, any> = {
      ATIVO: <Chip label="Ativo" color="success" size="small" />,
      INATIVO: <Chip label="Inativo" color="error" size="small" />,
      UTILIZADO: <Chip label="Utilizado" color="info" size="small" />,
      EXPIRADO: <Chip label="Expirado" color="warning" size="small" />,
    };
    return m[s] || <Chip label={s} size="small" />;
  };

  const codigosAtivos = codigos.filter((c: any) => c.status === 'ATIVO');
  const produtosSemCodigo = codigos.filter((c: any) => !c.produtoId).length;
  const impressoesHoje = codigos.filter((c: any) => {
    if (!c.createdAt) return false;
    return new Date(c.createdAt).toDateString() === new Date().toDateString();
  }).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
        Código de Barras
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" fontWeight="bold">{codigos.length}</Typography>
            <Typography variant="body2" color="text.secondary">Códigos Gerados</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" fontWeight="bold">{produtosSemCodigo}</Typography>
            <Typography variant="body2" color="text.secondary">Produtos sem Código</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" fontWeight="bold">{impressoesHoje}</Typography>
            <Typography variant="body2" color="text.secondary">Impressões Hoje</Typography>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h4" fontWeight="bold">{templates.length}</Typography>
            <Typography variant="body2" color="text.secondary">Templates</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<QrCode />} label="Códigos" />
          <Tab icon={<Dashboard />} label="Etiquetas" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setCodigoForm({ tipo: 'EAN13', produtoId: '', codigo: '', quantidade: 1 }); setOpenCodigoDialog(true); }}>Gerar Código</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarCodigos}>Atualizar</Button>
            </Box>
            {loadingCodigos ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {codigos.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell><Chip label={c.codigo} color="primary" size="small" /></TableCell>
                        <TableCell>{c.tipo || '-'}</TableCell>
                        <TableCell>{c.produto?.nome || c.produtoId || '-'}</TableCell>
                        <TableCell>{statusCodigoChip(c.status)}</TableCell>
                        <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {codigos.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhum código gerado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setEditTemplate(null); setTemplateForm({ nome: '', largura: 50, altura: 30, margemSuperior: 5, margemInferior: 5, margemEsquerda: 5, margemDireita: 5, formato: 'ETIQUETA' }); setOpenTemplateDialog(true); }}>Novo Template</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={carregarTemplates}>Atualizar</Button>
            </Box>
            {loadingTemplates ? <LinearProgress /> : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Formato</TableCell>
                      <TableCell>Largura (mm)</TableCell>
                      <TableCell>Altura (mm)</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.nome}</TableCell>
                        <TableCell>{t.formato || '-'}</TableCell>
                        <TableCell>{t.largura || '-'}</TableCell>
                        <TableCell>{t.altura || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirEditarTemplate(t)}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => excluirTemplate(t.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {templates.length === 0 && <TableRow><TableCell colSpan={5} align="center">Nenhum template cadastrado</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>

      <Dialog open={openCodigoDialog} onClose={() => setOpenCodigoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gerar Código</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Tipo" value={codigoForm.tipo} sx={{ mt: 1 }} onChange={e => setCodigoForm({ ...codigoForm, tipo: e.target.value })}>
            <MenuItem value="EAN13">EAN-13</MenuItem>
            <MenuItem value="EAN8">EAN-8</MenuItem>
            <MenuItem value="CODE128">Code 128</MenuItem>
            <MenuItem value="QRCODE">QR Code</MenuItem>
            <MenuItem value="DATAMATRIX">Data Matrix</MenuItem>
          </TextField>
          <TextField fullWidth label="ID do Produto" value={codigoForm.produtoId} sx={{ mt: 2 }} onChange={e => setCodigoForm({ ...codigoForm, produtoId: e.target.value })} />
          <TextField fullWidth label="Código" value={codigoForm.codigo} sx={{ mt: 2 }} onChange={e => setCodigoForm({ ...codigoForm, codigo: e.target.value })} />
          <TextField fullWidth label="Quantidade" type="number" value={codigoForm.quantidade} sx={{ mt: 2 }} onChange={e => setCodigoForm({ ...codigoForm, quantidade: parseInt(e.target.value) || 1 })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCodigoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={gerarCodigo}>Gerar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={templateForm.nome} sx={{ mt: 1 }} onChange={e => setTemplateForm({ ...templateForm, nome: e.target.value })} />
          <TextField select fullWidth label="Formato" value={templateForm.formato} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, formato: e.target.value })}>
            <MenuItem value="ETIQUETA">Etiqueta</MenuItem>
            <MenuItem value="CUPOM">Cupom</MenuItem>
            <MenuItem value="CARTA">Carta</MenuItem>
          </TextField>
          <TextField fullWidth label="Largura (mm)" type="number" value={templateForm.largura} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, largura: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Altura (mm)" type="number" value={templateForm.altura} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, altura: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Margem Superior (mm)" type="number" value={templateForm.margemSuperior} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, margemSuperior: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Margem Inferior (mm)" type="number" value={templateForm.margemInferior} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, margemInferior: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Margem Esquerda (mm)" type="number" value={templateForm.margemEsquerda} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, margemEsquerda: parseFloat(e.target.value) || 0 })} />
          <TextField fullWidth label="Margem Direita (mm)" type="number" value={templateForm.margemDireita} sx={{ mt: 2 }} onChange={e => setTemplateForm({ ...templateForm, margemDireita: parseFloat(e.target.value) || 0 })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarTemplate}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
