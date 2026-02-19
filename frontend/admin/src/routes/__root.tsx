import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AuthGuard } from '@/auth/auth-guard';

const PUBLIC_ROUTES = ['/auth/callback', '/login'];

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? '';
  const isPublicRoute = PUBLIC_ROUTES.some((r) => currentPath.startsWith(r));

  if (isPublicRoute) {
    return <Outlet />;
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
            <SidebarTrigger className="-ml-2 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <h1 className="text-lg font-semibold">BTP Admin</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
