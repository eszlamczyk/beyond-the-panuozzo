import { useEffect, useState } from 'react';
import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '@/auth/auth-store';

type CallbackSearch = {
  token?: string;
};

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const { token } = useSearch({ from: '/auth/callback' });
  const setToken = useAuthStore((s) => s.setToken);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (token) {
      setToken(token);
      setSaved(true);
    }
  }, [token, setToken]);

  if (saved) {
    return <Navigate to="/foods" />;
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Authentication failed. Missing token.
        </p>
      </div>
    );
  }

  return null;
}
