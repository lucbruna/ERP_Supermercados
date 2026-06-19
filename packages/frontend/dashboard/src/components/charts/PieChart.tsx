'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

export default function PieChart({ data, title, height = 300, innerRadius = 60, outerRadius = 100, colors }: PieChartProps) {
  const theme = useTheme();
  const defaultColors = ['#2E7D32', '#1565C0', '#ED6C02', '#9C27B0', '#00897B', '#D32F2F', '#546e7a', '#558B2F'];

  return (
    <Box>
      {title && <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{title}</Typography>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, idx) => <Cell key={`cell-${idx}`} fill={(colors || defaultColors)[idx % defaultColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
}
