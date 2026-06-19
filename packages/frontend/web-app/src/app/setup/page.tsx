'use client';

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stepper, Step, StepLabel,
  TextField, MenuItem, Grid, Alert, CircularProgress, Chip, IconButton,
  FormControlLabel, Switch, Divider,
} from '@mui/material';
import {
  Store, Language, Storage, AdminPanelSettings, Business, Extension,
  Settings, CheckCircle, ArrowForward, ArrowBack, TestTube, Save,
  PointOfSale, Inventory, AccountBalance, People, Description,
  Favorite, LocalShipping, Handshake, AutoAwesome, Biotech,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const steps = [
  'Boas-vindas', 'Banco de Dados', 'Administrador', 'Empresa',
  'Módulos', 'Configuração Inicial', 'Concluído',
];

const databaseSchema = z.object({
  host: z.string().min(1, 'Host é obrigatório'),
  port: z.string().min(1, 'Porta é obrigatória'),
  user: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
  dbName: z.string().min(1, 'Nome do banco é obrigatório'),
});

const adminSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmarSenha: z.string(),
}).refine(data => data.senha === data.confirmarSenha, {
  message: 'Senhas não conferem',
  path: ['confirmarSenha'],
});

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  ie: z.string().optional(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
});

type DatabaseData = z.infer<typeof databaseSchema>;
type AdminData = z.infer<typeof adminSchema>;
type EmpresaData = z.infer<typeof empresaSchema>;

const moduleOptions = [
  { key: 'pdv', label: 'PDV + Vendas', icon: <PointOfSale />, color: '#2E7D32' },
  { key: 'estoque', label: 'Estoque + Compras', icon: <Inventory />, color: '#1565C0' },
  { key: 'financeiro', label: 'Financeiro', icon: <AccountBalance />, color: '#6A1B9A' },
  { key: 'rh', label: 'RH + Ponto Eletrônico', icon: <People />, color: '#E65100' },
  { key: 'fiscal', label: 'Fiscal (NF-e/NFC-e)', icon: <Description />, color: '#C62828' },
  { key: 'crm', label: 'CRM + Fidelidade', icon: <Favorite />, color: '#D81B60' },
  { key: 'frota', label: 'Frota', icon: <LocalShipping />, color: '#283593' },
  { key: 'convenios', label: 'Convênios', icon: <Handshake />, color: '#00838F' },
  { key: 'ia', label: 'IA + BI', icon: <AutoAwesome />, color: '#4A148C' },
];

export default function SetupPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useState<'pt-BR' | 'en'>('pt-BR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tested, setTested] = useState(false);

  const [dbData, setDbData] = useState<DatabaseData>({ host: 'localhost', port: '5432', user: 'admin', password: '', dbName: 'crm_supermercado' });
  const [adminData, setAdminData] = useState<AdminData>({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [empresaData, setEmpresaData] = useState<EmpresaData>({ nome: '', cnpj: '', ie: '', endereco: '', telefone: '', email: '' });
  const [logoBase64, setLogoBase64] = useState('');
  const [modulos, setModulos] = useState<string[]>(['pdv', 'estoque', 'financeiro']);
  const [configInicial, setConfigInicial] = useState({
    moeda: 'BRL',
    fusoHorario: 'America/Sao_Paulo',
    formatoData: 'DD/MM/YYYY',
    regimeTributario: 'SIMPLES_NACIONAL',
    ambienteSefaz: 'HOMOLOGACAO',
  });

  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [empresaErrors, setEmpresaErrors] = useState<Record<string, string>>({});
  const [dbErrors, setDbErrors] = useState<Record<string, string>>({});

  const isLastStep = activeStep === steps.length - 1;

  function validateStep(step: number): boolean {
    setError('');
    if (step === 1) {
      const result = databaseSchema.safeParse(dbData);
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach(e => { const field = e.path[0] as string; errs[field] = e.message; });
        setDbErrors(errs);
        return false;
      }
      setDbErrors({});
      return true;
    }
    if (step === 2) {
      const result = adminSchema.safeParse(adminData);
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach(e => { const field = e.path[0] as string; errs[field] = e.message; });
        setAdminErrors(errs);
        return false;
      }
      setAdminErrors({});
      return true;
    }
    if (step === 3) {
      const result = empresaSchema.safeParse(empresaData);
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach(e => { const field = e.path[0] as string; errs[field] = e.message; });
        setEmpresaErrors(errs);
        return false;
      }
      setEmpresaErrors({});
      return true;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(activeStep)) return;
    setActiveStep(prev => prev + 1);
  }

  function handleBack() {
    setActiveStep(prev => prev - 1);
  }

  async function testarConexao() {
    setLoading(true);
    setError('');
    try {
      await new Promise(r => setTimeout(r, 1500));
      setTested(true);
      toast.success('Conexão realizada com sucesso!');
    } catch {
      setError('Falha na conexão');
    } finally {
      setLoading(false);
    }
  }

  async function finalizarSetup() {
    setLoading(true);
    setError('');
    try {
      const payload = {
        language,
        database: dbData,
        admin: { nome: adminData.nome, email: adminData.email, senha: adminData.senha },
        empresa: { ...empresaData, logo: logoBase64 || undefined },
        modulos,
        config: configInicial,
      };
      const res = await fetch('/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Falha ao salvar configuração');
      toast.success('CRM configurado com sucesso!');
      router.push('/');
    } catch {
      setError('Erro ao concluir configuração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function renderStep(step: number) {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Store sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
              CRM Supermercado
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {language === 'pt-BR'
                ? 'Sistema completo de gestão empresarial para supermercados. Configure sua instalação em poucos passos.'
                : 'Complete business management system for supermarkets. Set up your installation in a few steps.'}
            </Typography>
            <TextField
              select
              value={language}
              onChange={e => setLanguage(e.target.value as 'pt-BR' | 'en')}
              sx={{ minWidth: 200, mb: 3 }}
              label="Idioma / Language"
              InputProps={{ startAdornment: <Language sx={{ mr: 1 }} /> }}
            >
              <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </TextField>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
              Configuração do Banco de Dados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Informe os dados de conexão com o banco PostgreSQL.
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Host" value={dbData.host} error={!!dbErrors.host} helperText={dbErrors.host}
                  onChange={e => { setDbData({ ...dbData, host: e.target.value }); setTested(false); }} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Porta" value={dbData.port} error={!!dbErrors.port} helperText={dbErrors.port}
                  onChange={e => { setDbData({ ...dbData, port: e.target.value }); setTested(false); }} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Usuário" value={dbData.user} error={!!dbErrors.user} helperText={dbErrors.user}
                  onChange={e => { setDbData({ ...dbData, user: e.target.value }); setTested(false); }} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Senha" type="password" value={dbData.password} error={!!dbErrors.password} helperText={dbErrors.password}
                  onChange={e => { setDbData({ ...dbData, password: e.target.value }); setTested(false); }} />
              </Grid>
              <Grid xs={12}>
                <TextField fullWidth label="Nome do Banco" value={dbData.dbName} error={!!dbErrors.dbName} helperText={dbErrors.dbName}
                  onChange={e => { setDbData({ ...dbData, dbName: e.target.value }); setTested(false); }} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="outlined" startIcon={<TestTube />} disabled={loading} onClick={testarConexao}>
                {loading ? <CircularProgress size={20} /> : 'Testar Conexão'}
              </Button>
              {tested && <Chip label="Conexão OK" color="success" icon={<CheckCircle />} />}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
              Criar Administrador Master
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crie a conta de administrador principal do sistema.
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField fullWidth label="Nome completo" value={adminData.nome} error={!!adminErrors.nome} helperText={adminErrors.nome}
                  onChange={e => setAdminData({ ...adminData, nome: e.target.value })} />
              </Grid>
              <Grid xs={12}>
                <TextField fullWidth label="Email" type="email" value={adminData.email} error={!!adminErrors.email} helperText={adminErrors.email}
                  onChange={e => setAdminData({ ...adminData, email: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Senha" type="password" value={adminData.senha} error={!!adminErrors.senha} helperText={adminErrors.senha}
                  onChange={e => setAdminData({ ...adminData, senha: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Confirmar Senha" type="password" value={adminData.confirmarSenha} error={!!adminErrors.confirmarSenha} helperText={adminErrors.confirmarSenha}
                  onChange={e => setAdminData({ ...adminData, confirmarSenha: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dados da Empresa
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Informe os dados da empresa que utilizará o sistema.
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Nome / Razão Social" value={empresaData.nome} error={!!empresaErrors.nome} helperText={empresaErrors.nome}
                  onChange={e => setEmpresaData({ ...empresaData, nome: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="CNPJ" value={empresaData.cnpj} error={!!empresaErrors.cnpj} helperText={empresaErrors.cnpj}
                  onChange={e => setEmpresaData({ ...empresaData, cnpj: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Inscrição Estadual" value={empresaData.ie}
                  onChange={e => setEmpresaData({ ...empresaData, ie: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Telefone" value={empresaData.telefone} error={!!empresaErrors.telefone} helperText={empresaErrors.telefone}
                  onChange={e => setEmpresaData({ ...empresaData, telefone: e.target.value })} />
              </Grid>
              <Grid xs={12}>
                <TextField fullWidth label="Endereço" value={empresaData.endereco} error={!!empresaErrors.endereco} helperText={empresaErrors.endereco}
                  onChange={e => setEmpresaData({ ...empresaData, endereco: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" value={empresaData.email} error={!!empresaErrors.email} helperText={empresaErrors.email}
                  onChange={e => setEmpresaData({ ...empresaData, email: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <Button variant="outlined" component="label" sx={{ height: 56, mt: '6px' }}>
                  Upload Logo
                  <input type="file" hidden accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setLogoBase64(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                </Button>
                {logoBase64 && <Chip label="Logo carregada" color="success" size="small" sx={{ ml: 1, mt: 2 }} onDelete={() => setLogoBase64('')} />}
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Extension sx={{ mr: 1, verticalAlign: 'middle' }} />
              Seleção de Módulos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ative os módulos que deseja utilizar no sistema.
            </Typography>
            <Grid container spacing={2}>
              {moduleOptions.map(mod => {
                const selected = modulos.includes(mod.key);
                return (
                  <Grid xs={12} sm={6} md={4} key={mod.key}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selected ? `2px solid ${mod.color}` : '2px solid transparent',
                        bgcolor: selected ? `${mod.color}08` : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                      }}
                      onClick={() => {
                        setModulos(prev =>
                          prev.includes(mod.key) ? prev.filter(k => k !== mod.key) : [...prev, mod.key]
                        );
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box sx={{ color: mod.color, fontSize: 32, mb: 1 }}>{mod.icon}</Box>
                        <Typography variant="body1" fontWeight={600}>{mod.label}</Typography>
                        <Chip
                          size="small"
                          label={selected ? 'Ativo' : 'Inativo'}
                          color={selected ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
              Configuração Inicial
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Defina as configurações regionais e fiscais do sistema.
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField select fullWidth label="Moeda" value={configInicial.moeda}
                  onChange={e => setConfigInicial({ ...configInicial, moeda: e.target.value })}>
                  <MenuItem value="BRL">R$ - Real Brasileiro</MenuItem>
                  <MenuItem value="USD">$ - Dólar Americano</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField select fullWidth label="Fuso Horário" value={configInicial.fusoHorario}
                  onChange={e => setConfigInicial({ ...configInicial, fusoHorario: e.target.value })}>
                  <MenuItem value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</MenuItem>
                  <MenuItem value="America/Manaus">America/Manaus (UTC-4)</MenuItem>
                  <MenuItem value="America/Belem">America/Belem (UTC-3)</MenuItem>
                  <MenuItem value="America/Noronha">America/Noronha (UTC-2)</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField select fullWidth label="Formato de Data" value={configInicial.formatoData}
                  onChange={e => setConfigInicial({ ...configInicial, formatoData: e.target.value })}>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField select fullWidth label="Regime Tributário" value={configInicial.regimeTributario}
                  onChange={e => setConfigInicial({ ...configInicial, regimeTributario: e.target.value })}>
                  <MenuItem value="SIMPLES_NACIONAL">Simples Nacional</MenuItem>
                  <MenuItem value="LUCRO_PRESUMIDO">Lucro Presumido</MenuItem>
                  <MenuItem value="LUCRO_REAL">Lucro Real</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField select fullWidth label="Ambiente SEFAZ" value={configInicial.ambienteSefaz}
                  onChange={e => setConfigInicial({ ...configInicial, ambienteSefaz: e.target.value })}>
                  <MenuItem value="PRODUCAO">Produção</MenuItem>
                  <MenuItem value="HOMOLOGACAO">Homologação</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        );

      case 6:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Configuração Concluída!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Todas as configurações foram salvas com sucesso. Clique abaixo para acessar o sistema.
            </Typography>
            <Card variant="outlined" sx={{ mb: 4, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Resumo da Configuração</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1} sx={{ fontSize: 14 }}>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Idioma:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{language === 'pt-BR' ? 'Português' : 'English'}</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Banco de Dados:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{dbData.host}:{dbData.port}/{dbData.dbName}</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Administrador:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{adminData.nome} ({adminData.email})</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Empresa:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{empresaData.nome} - {empresaData.cnpj}</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Módulos Ativos:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{modulos.length} módulos</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Regime Tributário:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{configInicial.regimeTributario}</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2" color="text.secondary">Ambiente SEFAZ:</Typography></Grid>
                  <Grid xs={6}><Typography variant="body2">{configInicial.ambienteSefaz}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 720, width: '100%', p: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label, i) => (
              <Step key={label} completed={i < activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {renderStep(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Voltar
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isLastStep ? (
                <Button
                  variant="contained"
                  size="large"
                  disabled={loading}
                  onClick={finalizarSetup}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                >
                  Acessar CRM
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  {activeStep === 0 ? 'Começar' : 'Continuar'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
