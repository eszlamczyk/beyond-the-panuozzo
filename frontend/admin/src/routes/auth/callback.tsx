import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '@/auth/auth-store';

type CallbackSearch = {
  token?: string;
  refresh_token?: string;
};

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    refresh_token:
      typeof search.refresh_token === 'string'
        ? search.refresh_token
        : undefined,
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const { token, refresh_token } = useSearch({ from: '/auth/callback' });
  const setTokens = useAuthStore((s) => s.setTokens);

  if (token && refresh_token) {
    setTokens(token, refresh_token);
    return <Navigate to="/foods" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        Authentication failed. Missing token.
      </p>
    </div>
  );
}
