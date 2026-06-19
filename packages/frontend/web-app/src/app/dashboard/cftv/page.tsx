'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Videocam,
  FiberManualRecord,
  PlayArrow,
  Pause,
  Fullscreen,
  CameraAlt,
} from '@mui/icons-material';
import KpiCard from '@/components/common/KpiCard';

const cameras = [
  { id: 1, nome: 'Entrada Principal', local: 'Portaria', status: 'online', resolucao: '1080p' },
  { id: 2, nome: 'Corredor 1 - Mercearia', local: 'Setor A', status: 'online', resolucao: '1080p' },
  { id: 3, nome: 'Corredor 2 - Laticínios', local: 'Setor A', status: 'online', resolucao: '1080p' },
  { id: 4, nome: 'Caixas PDV', local: 'Frente de Loja', status: 'online', resolucao: '4K' },
  { id: 5, nome: 'Açougue', local: 'Setor B', status: 'online', resolucao: '1080p' },
  { id: 6, nome: 'Hortifrúti', local: 'Setor C', status: 'offline', resolucao: '720p' },
  { id: 7, nome: 'Estacionamento', local: 'Externo', status: 'online', resolucao: '4K' },
  { id: 8, nome: 'Depósito', local: 'Retaguarda', status: 'online', resolucao: '1080p' },
];

export default function CFTVPage() {
  const [camerasList] = useState(cameras);
  const theme = useTheme();
  const [playingCameras, setPlayingCameras] = useState<number[]>([1, 4, 7]);

  const togglePlay = (id: number) => {
    setPlayingCameras((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        CFTV - Monitoramento
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Câmeras" value="8" icon={<Videocam />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Online" value="7" icon={<FiberManualRecord />} trend="up" trendValue="Online" color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Offline" value="1" icon={<FiberManualRecord />} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Gravações" value="48h" icon={<CameraAlt />} color="info.main" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {camerasList.map((camera) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={camera.id}>
            <Card
              sx={{
                bgcolor: camera.status === 'online' ? 'background.paper' : 'action.disabledBackground',
                opacity: camera.status === 'online' ? 1 : 0.7,
              }}
            >
              <CardMedia
                sx={{
                  height: 180,
                  bgcolor: theme.palette.mode === 'dark' ? '#111' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <Videocam sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
                {camera.status === 'online' && playingCameras.includes(camera.id) && (
                  <FiberManualRecord
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      color: 'error.main',
                      fontSize: 16,
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                )}
                <Chip
                  label={camera.resolucao}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: 10,
                  }}
                />
              </CardMedia>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {camera.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {camera.local}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={camera.status === 'online' ? 'Online' : 'Offline'}
                    size="small"
                    color={camera.status === 'online' ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontWeight: 500, fontSize: 11 }}
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                <IconButton
                  size="small"
                  color={playingCameras.includes(camera.id) ? 'primary' : 'default'}
                  onClick={() => togglePlay(camera.id)}
                  disabled={camera.status !== 'online'}
                >
                  {playingCameras.includes(camera.id) ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton size="small" disabled={camera.status !== 'online'}>
                  <Fullscreen />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
