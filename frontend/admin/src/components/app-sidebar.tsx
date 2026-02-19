import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { LogOut, UtensilsCrossed, Users, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/auth/auth-store';
import { apiFetch } from '@/api/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Foods', to: '/foods' as const, icon: UtensilsCrossed },
  { title: 'Users', to: '/users' as const, icon: Users },
  { title: 'Orders', to: '/orders' as const, icon: ShoppingCart },
];

export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const clearToken = useAuthStore((s) => s.clearToken);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await apiFetch('/auth/sign-out', { method: 'POST' });
    } catch {
      // Sign out locally even if the API call fails
    }
    clearToken();
    await navigate({ to: '/login' });
  };

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath.startsWith(item.to)}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => void handleSignOut()}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
