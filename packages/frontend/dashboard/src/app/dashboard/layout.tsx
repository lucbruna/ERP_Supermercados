'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Layout({ children }: { children: ReactNode }) {
  const t = useTranslations('dashboard');
  return (
    <AuthGuard>
      <DashboardLayout title={t('title')}>{children}</DashboardLayout>
    </AuthGuard>
  );
}
