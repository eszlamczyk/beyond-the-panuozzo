import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuthStore } from './auth-store';

export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
