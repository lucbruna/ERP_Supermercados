'use client';

import { Box, Grid, Paper, Typography, Chip, IconButton } from '@mui/material';
import {
  Videocam,
  CheckCircle,
  Error as ErrorIcon,
  Visibility,
  Settings,
  SignalCellularAlt,
  Storage,
} from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';
import StatusBadge from '@/components/common/StatusBadge';

const cameras = [
  { id: 'CAM-001', nome: 'Entrada Principal', local: 'Fachada', status: 'online', resolucao: '4K', gravando: true, ultimoMovimento: '2 min atrás' },
  { id: 'CAM-002', nome: 'Estacionamento', local: 'Externo', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '15 min atrás' },
  { id: 'CAM-003', nome: 'Corredor Mercearia', local: 'Interno', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '1 min atrás' },
  { id: 'CAM-004', nome: 'Açougue', local: 'Interno', status: 'online', resolucao: '4K', gravando: true, ultimoMovimento: '5 min atrás' },
  { id: 'CAM-005', nome: 'PDV Caixas', local: 'Interno', status: 'online', resolucao: '4K', gravando: true, ultimoMovimento: '30 seg atrás' },
  { id: 'CAM-006', nome: 'Estoque Interno', local: 'Depósito', status: 'offline', resolucao: '1080p', gravando: false, ultimoMovimento: '2 horas atrás' },
  { id: 'CAM-007', nome: 'Hortifrúti', local: 'Interno', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '3 min atrás' },
  { id: 'CAM-008', nome: 'Carga/Descarga', local: 'Externo', status: 'online', resolucao: '4K', gravando: true, ultimoMovimento: '20 min atrás' },
  { id: 'CAM-009', nome: 'Escritórios', local: 'Admin', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '45 min atrás' },
  { id: 'CAM-010', nome: 'Refeitório', local: 'Interno', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '8 min atrás' },
  { id: 'CAM-011', nome: 'Periferia Sul', local: 'Externo', status: 'offline', resolucao: '4K', gravando: false, ultimoMovimento: '1 dia atrás' },
  { id: 'CAM-012', nome: 'Câmera Cobertura', local: 'Externo', status: 'online', resolucao: '1080p', gravando: true, ultimoMovimento: '12 min atrás' },
];

const systemStats = {
  totalCameras: cameras.length,
  online: cameras.filter((c) => c.status === 'online').length,
  offline: cameras.filter((c) => c.status === 'offline').length,
  recording: cameras.filter((c) => c.gravando).length,
  storageUsed: '6,8 TB',
  storageTotal: '20 TB',
  uptime: '99,8%',
};

export default function CFTVPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard CFTV</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Câmeras" value={systemStats.totalCameras} icon={<Videocam />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Online" value={systemStats.online} icon={<CheckCircle />} trend="up" trendValue={`${((systemStats.online / systemStats.totalCameras) * 100).toFixed(0)}%`} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Offline" value={systemStats.offline} icon={<ErrorIcon />} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Gravando" value={systemStats.recording} icon={<Storage />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Uptime" value={systemStats.uptime} icon={<SignalCellularAlt />} color="success.main" />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage color="primary" /> Armazenamento
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">{systemStats.storageUsed}</Typography>
              <Typography variant="body2" color="text.secondary">de {systemStats.storageTotal}</Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 16,
                bgcolor: 'grey.200',
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: `${(6.8 / 20) * 100}%`,
                  height: '100%',
                  bgcolor: 'warning.main',
                  borderRadius: 8,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {((6.8 / 20) * 100).toFixed(0)}% utilizado - Previsão de reposição em 45 dias
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Videocam color="primary" /> Status Geral do Sistema
            </Typography>
            <Grid container spacing={1}>
              {cameras.map((cam) => (
                <Grid item xs={12} sm={6} md={4} key={cam.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: cam.status === 'online' ? 'success.main' : 'error.main',
                      borderWidth: cam.status === 'online' ? 1 : 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Videocam fontSize="small" color={cam.status === 'online' ? 'success' : 'error'} />
                        <Typography variant="body2" fontWeight={600}>{cam.nome}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small"><Settings fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">{cam.local}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <StatusBadge status={cam.status} size="small" />
                      <Typography variant="caption" color="text.secondary">{cam.resolucao}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {cam.ultimoMovimento}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
