'use client';

import { ReactNode, useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} title={title} />
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
