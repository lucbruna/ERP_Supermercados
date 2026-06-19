'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Box,
  Typography,
  Skeleton,
} from '@mui/material';
import { useState, useMemo, ReactNode } from 'react';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  rows,
  loading = false,
  title,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedRows = useMemo(() => {
    if (!orderBy) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, orderBy, order]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </Box>
      )}
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, fontWeight: 600 }}>
                  {column.sortable !== false ? (
                    <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : 'asc'} onClick={() => handleSort(column.id)}>
                      {column.label}
                    </TableSortLabel>
                  ) : column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.id}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ py: 4 }}><Typography variant="body1" color="text.secondary">{emptyMessage}</Typography></Box>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row, idx) => (
                <TableRow hover key={idx}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : String(value ?? '')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
