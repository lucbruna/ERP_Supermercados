'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: { dataKey: string; color?: string; name: string }[];
  xAxisKey: string;
  title?: string;
  height?: number;
}

export default function LineChart({
  data,
  lines,
  xAxisKey,
  title,
  height = 300,
}: LineChartProps) {
  const theme = useTheme();
  const colors = ['#2E7D32', '#1565C0', '#ED6C02', '#9C27B0', '#00897B', '#D32F2F'];

  return (
    <Box>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data as Record<string, string | number>[]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
          {lines.map((line, idx) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || colors[idx % colors.length]}
              name={line.name}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
}
