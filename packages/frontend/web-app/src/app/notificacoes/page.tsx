'use client';

import { useState, useEffect } from 'react';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { parseCookies } from 'nookies';
import {
  Box, Container, Typography, Card, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid,
} from '@mui/material';
import {
  Notifications, Email, Sms, WhatsApp, PhoneAndroid, CheckCircle, PendingActions,
  ErrorOutline, Refresh, Delete, Info, Add,
} from '@mui/icons-material';

const NOTIF_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3014';

const notifApi = axios.create({ baseURL: NOTIF_BASE, timeout: 30000 });

notifApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default function NotificacoesPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTmpl, setLoadingTmpl] = useState(false);
  const [filaStats, setFilaStats] = useState<any>(null);

  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [sendForm, setSendForm] = useState({ titulo: '', mensagem: '', tipo: 'SISTEMA', destinatario: '' });

  useEffect(() => {
    carregarNotificacoes();
    carregarTemplates();
    carregarFilaStats();
  }, []);

  async function carregarNotificacoes() {
    setLoadingNotif(true);
    try { const { data } = await notifApi.get('/notificacoes?companyId=1'); setNotificacoes(Array.isArray(data) ? data : []); }
    catch { setNotificacoes([]); }
    finally { setLoadingNotif(false); }
  }

  async function carregarTemplates() {
    setLoadingTmpl(true);
    try { const { data } = await notifApi.get('/templates?companyId=1'); setTemplates(Array.isArray(data) ? data : []); }
    catch { setTemplates([]); }
    finally { setLoadingTmpl(false); }
  }

  async function carregarFilaStats() {
    try { const { data } = await notifApi.get('/fila-envio/stats'); setFilaStats(data); }
    catch { setFilaStats(null); }
  }

  async function enviarNotificacao() {
    try {
      await notifApi.post('/notificacoes/send', { ...sendForm, companyId: '1' });
      setSuccess('Notificação enviada');
      setOpenSendDialog(false);
      await carregarNotificacoes();
      await carregarFilaStats();
    } catch { setError('Erro ao enviar'); }
  }

  async function marcarLida(id: string) {
    try { await notifApi.patch(`/notificacoes/${id}/read`); await carregarNotificacoes(); }
    catch { setError('Erro'); }
  }

  async function processarFila() {
    try { await notifApi.post('/fila-envio/process'); setSuccess('Fila processada'); await carregarFilaStats(); }
    catch { setError('Erro'); }
  }

  async function removerNotif(id: string) {
    try { await notifApi.delete(`/notificacoes/${id}`); await carregarNotificacoes(); }
    catch { setError('Erro'); }
  }

  const tipoIcon: Record<string, any> = {
    EMAIL: <Email />, SMS: <Sms />, WHATSAPP: <WhatsApp />, PUSH: <PhoneAndroid />, SISTEMA: <Notifications />,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
        Notificações & Alertas
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} mb={3}>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" color="primary">{filaStats?.pendentes || 0}</Typography>
            <Typography variant="body2" color="text.secondary"><PendingActions sx={{ verticalAlign: 'middle', mr: 0.5 }} />Pendentes</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" color="success.main">{filaStats?.enviados || 0}</Typography>
            <Typography variant="body2" color="text.secondary"><CheckCircle sx={{ verticalAlign: 'middle', mr: 0.5 }} />Enviados</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" color="error.main">{filaStats?.erros || 0}</Typography>
            <Typography variant="body2" color="text.secondary"><ErrorOutline sx={{ verticalAlign: 'middle', mr: 0.5 }} />Erros</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{notificacoes.filter(n => !n.lida).length}</Typography>
            <Typography variant="body2" color="text.secondary"><Info sx={{ verticalAlign: 'middle', mr: 0.5 }} />Não Lidas</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenSendDialog(true)}>Nova Notificação</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { carregarNotificacoes(); carregarFilaStats(); }}>Atualizar</Button>
          <Button variant="outlined" color="warning" onClick={processarFila}>Processar Fila</Button>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Notifications />} label="Notificações" />
          <Tab icon={<Info />} label="Templates" />
        </Tabs>

        {tab === 0 && (
          loadingNotif ? <LinearProgress /> : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Mensagem</TableCell>
                    <TableCell>Lida</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notificacoes.map((n: any) => (
                    <TableRow key={n.id} sx={{ opacity: n.lida ? 0.6 : 1 }}>
                      <TableCell><Chip icon={tipoIcon[n.tipo]} label={n.tipo} size="small" /></TableCell>
                      <TableCell>{n.titulo}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.mensagem}</TableCell>
                      <TableCell><Chip label={n.lida ? 'Sim' : 'Não'} color={n.lida ? 'success' : 'warning'} size="small" /></TableCell>
                      <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {!n.lida && <Button size="small" onClick={() => marcarLida(n.id)}>Ler</Button>}
                        <IconButton size="small" color="error" onClick={() => removerNotif(n.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notificacoes.length === 0 && <TableRow><TableCell colSpan={6} align="center">Nenhuma notificação</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {tab === 1 && (
          loadingTmpl ? <LinearProgress /> : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Assunto</TableCell>
                    <TableCell>Variáveis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.nome}</TableCell>
                      <TableCell><Chip label={t.tipo} size="small" /></TableCell>
                      <TableCell>{t.assunto || '-'}</TableCell>
                      <TableCell>{(t.variaveis || []).join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {templates.length === 0 && <TableRow><TableCell colSpan={4} align="center">Nenhum template</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </Card>

      <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Notificação</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Tipo" value={sendForm.tipo} sx={{ mt: 1 }} onChange={e => setSendForm({ ...sendForm, tipo: e.target.value })}>
            <MenuItem value="SISTEMA">Sistema</MenuItem>
            <MenuItem value="EMAIL">E-mail</MenuItem>
            <MenuItem value="SMS">SMS</MenuItem>
            <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
            <MenuItem value="PUSH">Push</MenuItem>
          </TextField>
          <TextField fullWidth label="Destinatário" value={sendForm.destinatario} sx={{ mt: 2 }} onChange={e => setSendForm({ ...sendForm, destinatario: e.target.value })} />
          <TextField fullWidth label="Título" value={sendForm.titulo} sx={{ mt: 2 }} onChange={e => setSendForm({ ...sendForm, titulo: e.target.value })} />
          <TextField fullWidth label="Mensagem" value={sendForm.mensagem} multiline rows={3} sx={{ mt: 2 }} onChange={e => setSendForm({ ...sendForm, mensagem: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={enviarNotificacao}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
