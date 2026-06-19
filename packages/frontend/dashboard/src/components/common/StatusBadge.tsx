'use client';

import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary' }> = {
  ativo: { label: 'Ativo', color: 'success' },
  inativo: { label: 'Inativo', color: 'error' },
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
  processando: { label: 'Processando', color: 'info' },
  entregue: { label: 'Entregue', color: 'success' },
  aprovado: { label: 'Aprovado', color: 'success' },
  reprovado: { label: 'Reprovado', color: 'error' },
  pago: { label: 'Pago', color: 'success' },
  vencido: { label: 'Vencido', color: 'error' },
  disponivel: { label: 'Disponível', color: 'success' },
  indisponivel: { label: 'Indisponível', color: 'error' },
  online: { label: 'Online', color: 'success' },
  offline: { label: 'Offline', color: 'error' },
  critico: { label: 'Crítico', color: 'error' },
  alerta: { label: 'Alerta', color: 'warning' },
  normal: { label: 'Normal', color: 'success' },
};

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] ?? { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} variant="filled" sx={{ fontWeight: 500 }} />;
}
