'use client';

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  comparisonText?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  color = 'primary.main',
  comparisonText = 'vs. período anterior',
}: KpiCardProps) {
  const trendColors = { up: 'success', down: 'error', neutral: 'default' } as const;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>{value}</Typography>
        {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
        {trend && trendValue && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label={trendValue} size="small" color={trendColors[trend]} variant="outlined" sx={{ fontWeight: 500 }} />
            <Typography variant="caption" color="text.secondary">{comparisonText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
