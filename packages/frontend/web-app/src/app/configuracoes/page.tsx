'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Accordion, AccordionSummary, AccordionDetails,
  Button, TextField, Switch, FormControlLabel, MenuItem, Grid, Alert, LinearProgress,
  Divider, Chip,
} from '@mui/material';
import {
  Settings, ExpandMore, Business, PointOfSale, Inventory, Notifications,
  Description, Security, Save, Store,
} from '@mui/icons-material';
import api from '@/lib/api';

export default function ConfiguracoesPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>('geral');

  const [geral, setGeral] = useState({ nome: '', cnpj: '', telefone: '', email: '', logo: '' });
  const [pdv, setPdv] = useState({ caixaPadrao: '', formasPagamento: [] as string[], prazoPadrao: 30 });
  const [estoque, setEstoque] = useState({ alertaMinimo: 10, lotePadrao: 1, validadePadrao: 90 });
  const [notificacoes, setNotificacoes] = useState({
    emailAtivo: false, smsAtivo: false, whatsAppAtivo: false,
    emailSmtp: '', emailPorta: '', emailUsuario: '', emailSenha: '',
    smsApiKey: '', smsRemetente: '',
    whatsAppToken: '', whatsAppNumero: '',
  });
  const [fiscal, setFiscal] = useState({ ambienteSefaz: 'HOMOLOGACAO', cfopPadrao: '', serieNfce: '1' });
  const [seguranca, setSeguranca] = useState({
    senhaMinLength: 8, senhaRequerMaiuscula: true, senhaRequerEspecial: true,
    doisFatoresAtivo: false, bloqueioTentativas: 5,
  });

  const formasPagamentoOptions = [
    'DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'CONVENIO', 'CREDIARIO',
  ];

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    setLoading(true);
    try {
      const { data } = await api.get('/configuracoes?companyId=1');
      if (data) {
        if (data.geral) setGeral(prev => ({ ...prev, ...data.geral }));
        if (data.pdv) setPdv(prev => ({ ...prev, ...data.pdv }));
        if (data.estoque) setEstoque(prev => ({ ...prev, ...data.estoque }));
        if (data.notificacoes) setNotificacoes(prev => ({ ...prev, ...data.notificacoes }));
        if (data.fiscal) setFiscal(prev => ({ ...prev, ...data.fiscal }));
        if (data.seguranca) setSeguranca(prev => ({ ...prev, ...data.seguranca }));
      }
    } catch { /* usa valores padrão */ }
    finally { setLoading(false); }
  }

  async function salvarSecao(secao: string, payload: any) {
    try {
      await api.patch(`/configuracoes?companyId=1`, { [secao]: payload });
      setSuccess(`Configurações de ${secao} salvas`);
    } catch { setError(`Erro ao salvar ${secao}`); }
  }

  const handleAccordionChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (loading) return <Container maxWidth="xl" sx={{ py: 3 }}><LinearProgress /></Container>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
        Configurações
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>Seções</Typography>
            {[
              { key: 'geral', label: 'Geral', icon: <Business /> },
              { key: 'pdv', label: 'PDV', icon: <PointOfSale /> },
              { key: 'estoque', label: 'Estoque', icon: <Inventory /> },
              { key: 'notificacoes', label: 'Notificações', icon: <Notifications /> },
              { key: 'fiscal', label: 'Fiscal', icon: <Description /> },
              { key: 'seguranca', label: 'Segurança', icon: <Security /> },
            ].map(sec => (
              <Button
                key={sec.key}
                fullWidth
                startIcon={sec.icon}
                onClick={() => setExpanded(sec.key)}
                variant={expanded === sec.key ? 'contained' : 'text'}
                sx={{ justifyContent: 'flex-start', mb: 0.5, textTransform: 'none' }}
              >
                {sec.label}
              </Button>
            ))}
          </Card>
        </Grid>

        <Grid xs={12} md={9}>
          <Accordion expanded={expanded === 'geral'} onChange={handleAccordionChange('geral')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" />
                <Typography variant="h6">Geral</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Nome da Empresa" value={geral.nome}
                    onChange={e => setGeral({ ...geral, nome: e.target.value })} />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="CNPJ" value={geral.cnpj}
                    onChange={e => setGeral({ ...geral, cnpj: e.target.value })} />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Telefone" value={geral.telefone}
                    onChange={e => setGeral({ ...geral, telefone: e.target.value })} />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Email" value={geral.email}
                    onChange={e => setGeral({ ...geral, email: e.target.value })} />
                </Grid>
                <Grid xs={12}>
                  <Button variant="outlined" component="label">
                    Upload Logo
                    <input type="file" hidden accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setGeral({ ...geral, logo: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                  </Button>
                  {geral.logo && <Chip label="Logo carregada" color="success" size="small" sx={{ ml: 1 }} />}
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('geral', geral)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'pdv'} onChange={handleAccordionChange('pdv')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PointOfSale color="primary" />
                <Typography variant="h6">PDV</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Caixa Padrão" value={pdv.caixaPadrao}
                    onChange={e => setPdv({ ...pdv, caixaPadrao: e.target.value })} />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Prazo Padrão (dias)" type="number" value={pdv.prazoPadrao}
                    onChange={e => setPdv({ ...pdv, prazoPadrao: parseInt(e.target.value) || 30 })} />
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Formas de Pagamento Padrão</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formasPagamentoOptions.map(fp => (
                      <Chip key={fp}
                        label={fp.replace(/_/g, ' ')}
                        color={pdv.formasPagamento.includes(fp) ? 'primary' : 'default'}
                        variant={pdv.formasPagamento.includes(fp) ? 'filled' : 'outlined'}
                        onClick={() => {
                          setPdv(prev => ({
                            ...prev,
                            formasPagamento: prev.formasPagamento.includes(fp)
                              ? prev.formasPagamento.filter(f => f !== fp)
                              : [...prev.formasPagamento, fp],
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('pdv', pdv)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'estoque'} onChange={handleAccordionChange('estoque')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory color="primary" />
                <Typography variant="h6">Estoque</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Alerta Estoque Mínimo" type="number" value={estoque.alertaMinimo}
                    onChange={e => setEstoque({ ...estoque, alertaMinimo: parseInt(e.target.value) || 10 })} />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Lote Padrão" type="number" value={estoque.lotePadrao}
                    onChange={e => setEstoque({ ...estoque, lotePadrao: parseInt(e.target.value) || 1 })} />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Validade Padrão (dias)" type="number" value={estoque.validadePadrao}
                    onChange={e => setEstoque({ ...estoque, validadePadrao: parseInt(e.target.value) || 90 })} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('estoque', estoque)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'notificacoes'} onChange={handleAccordionChange('notificacoes')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications color="primary" />
                <Typography variant="h6">Notificações</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <FormControlLabel control={<Switch checked={notificacoes.emailAtivo}
                    onChange={e => setNotificacoes({ ...notificacoes, emailAtivo: e.target.checked })} />}
                    label="Email Ativo" />
                </Grid>
                {notificacoes.emailAtivo && (
                  <>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="SMTP" value={notificacoes.emailSmtp}
                        onChange={e => setNotificacoes({ ...notificacoes, emailSmtp: e.target.value })} />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <TextField fullWidth label="Porta" value={notificacoes.emailPorta}
                        onChange={e => setNotificacoes({ ...notificacoes, emailPorta: e.target.value })} />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <TextField fullWidth label="Usuário" value={notificacoes.emailUsuario}
                        onChange={e => setNotificacoes({ ...notificacoes, emailUsuario: e.target.value })} />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="Senha" type="password" value={notificacoes.emailSenha}
                        onChange={e => setNotificacoes({ ...notificacoes, emailSenha: e.target.value })} />
                    </Grid>
                  </>
                )}
                <Grid xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid xs={12}>
                  <FormControlLabel control={<Switch checked={notificacoes.smsAtivo}
                    onChange={e => setNotificacoes({ ...notificacoes, smsAtivo: e.target.checked })} />}
                    label="SMS Ativo" />
                </Grid>
                {notificacoes.smsAtivo && (
                  <>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="API Key" value={notificacoes.smsApiKey}
                        onChange={e => setNotificacoes({ ...notificacoes, smsApiKey: e.target.value })} />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="Remetente" value={notificacoes.smsRemetente}
                        onChange={e => setNotificacoes({ ...notificacoes, smsRemetente: e.target.value })} />
                    </Grid>
                  </>
                )}
                <Grid xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid xs={12}>
                  <FormControlLabel control={<Switch checked={notificacoes.whatsAppAtivo}
                    onChange={e => setNotificacoes({ ...notificacoes, whatsAppAtivo: e.target.checked })} />}
                    label="WhatsApp Ativo" />
                </Grid>
                {notificacoes.whatsAppAtivo && (
                  <>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="Token" value={notificacoes.whatsAppToken}
                        onChange={e => setNotificacoes({ ...notificacoes, whatsAppToken: e.target.value })} />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField fullWidth label="Número" value={notificacoes.whatsAppNumero}
                        onChange={e => setNotificacoes({ ...notificacoes, whatsAppNumero: e.target.value })} />
                    </Grid>
                  </>
                )}
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('notificacoes', notificacoes)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'fiscal'} onChange={handleAccordionChange('fiscal')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Typography variant="h6">Fiscal</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField select fullWidth label="Ambiente SEFAZ" value={fiscal.ambienteSefaz}
                    onChange={e => setFiscal({ ...fiscal, ambienteSefaz: e.target.value })}>
                    <MenuItem value="PRODUCAO">Produção</MenuItem>
                    <MenuItem value="HOMOLOGACAO">Homologação</MenuItem>
                  </TextField>
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="CFOP Padrão" value={fiscal.cfopPadrao}
                    onChange={e => setFiscal({ ...fiscal, cfopPadrao: e.target.value })} />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Série NFC-e" value={fiscal.serieNfce}
                    onChange={e => setFiscal({ ...fiscal, serieNfce: e.target.value })} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('fiscal', fiscal)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'seguranca'} onChange={handleAccordionChange('seguranca')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                <Typography variant="h6">Segurança</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Tamanho mínimo de senha" type="number" value={seguranca.senhaMinLength}
                    onChange={e => setSeguranca({ ...seguranca, senhaMinLength: parseInt(e.target.value) || 8 })} />
                </Grid>
                <Grid xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={seguranca.senhaRequerMaiuscula}
                    onChange={e => setSeguranca({ ...seguranca, senhaRequerMaiuscula: e.target.checked })} />}
                    label="Exigir maiúscula" />
                </Grid>
                <Grid xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={seguranca.senhaRequerEspecial}
                    onChange={e => setSeguranca({ ...seguranca, senhaRequerEspecial: e.target.checked })} />}
                    label="Exigir caractere especial" />
                </Grid>
                <Grid xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={seguranca.doisFatoresAtivo}
                    onChange={e => setSeguranca({ ...seguranca, doisFatoresAtivo: e.target.checked })} />}
                    label="Autenticação 2 Fatores (2FA)" />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField fullWidth label="Tentativas antes de bloquear" type="number" value={seguranca.bloqueioTentativas}
                    onChange={e => setSeguranca({ ...seguranca, bloqueioTentativas: parseInt(e.target.value) || 5 })} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={() => salvarSecao('seguranca', seguranca)}>Salvar</Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Container>
  );
}
