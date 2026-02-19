import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuthStore } from '@/auth/auth-store';
import { API_BASE_URL } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/foods" />;
  }

  const callbackUrl = `${window.location.origin}/auth/callback`;
  const googleAuthUrl = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}&capability=admin`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BTP Admin</CardTitle>
          <CardDescription>
            Sign in to manage Beyond the Panuozzo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href={googleAuthUrl}>
            <Button className="w-full" size="lg">
              Sign in with Google
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
