'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { ReactNode } from 'react';

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  hideActions?: boolean;
}

export default function ModalForm({
  open,
  onClose,
  onSubmit,
  title,
  children,
  maxWidth = 'md',
  loading = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  hideActions = false,
}: ModalFormProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      {!hideActions && (
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
