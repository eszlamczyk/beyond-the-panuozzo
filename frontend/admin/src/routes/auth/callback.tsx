import { useEffect } from 'react';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setToken(token);
      void navigate({ to: '/foods', replace: true });
    }
  }, [token, setToken, navigate]);

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
