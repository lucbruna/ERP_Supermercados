'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Store,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  mfaCode: z.string().length(6, 'Código MFA deve ter 6 dígitos').optional().or(z.literal('')),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      await signIn(data.email, data.password);
      toast.success(t('loginSuccess'));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { mfaRequired?: boolean; message?: string } } };
        if (axiosErr.response?.data?.mfaRequired) {
          setRequireMfa(true);
        }
        setError(axiosErr.response?.data?.message || t('loginError'));
      } else {
        setError(t('loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          p: 2,
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Store sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {t('crmTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('makeLogin')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label={t('email')}
              placeholder="seu@email.com"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('email')}
            />

            <TextField
              fullWidth
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password')}
            />

            {requireMfa && (
              <TextField
                fullWidth
                label={t('mfaCode')}
                placeholder="000000"
                margin="normal"
                error={!!errors.mfaCode}
                helperText={errors.mfaCode?.message}
                inputProps={{ maxLength: 6, style: { letterSpacing: 8, textAlign: 'center' } }}
                {...register('mfaCode')}
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">{t('rememberMe')}</Typography>}
              />
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                {t('forgotPassword')}
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, py: 1.5, fontSize: 16 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('login')}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t('version')}
            </Typography>
          </Divider>
        </CardContent>
      </Card>
    </Box>
  );
}
