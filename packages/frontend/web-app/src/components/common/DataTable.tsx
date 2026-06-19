'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Edit, Delete, Visibility, Search } from '@mui/icons-material';
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
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  loading?: boolean;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onView?: (row: Record<string, unknown>) => void;
  onSearch?: (value: string) => void;
  title?: string;
  actions?: ReactNode;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  rows,
  total,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onSearch,
  title,
  actions,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchValue, setSearchValue] = useState('');

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      {(title || onSearch || actions) && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {title && (
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {onSearch && (
              <TextField
                size="small"
                placeholder="Pesquisar..."
                value={searchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            {actions}
          </Box>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: 600 }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell align="center" sx={{ minWidth: 120, fontWeight: 600 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
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
                  {(onEdit || onDelete || onView) && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="Visualizar">
                            <IconButton size="small" onClick={() => onView(row)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Excluir">
                            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          component="div"
          count={total ?? sortedRows.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Paper>
  );
}
