import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Users, ChartLine } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { RolePermissions } from '@/lib/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission?: keyof RolePermissions;
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { permissions } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      permission: 'canViewInventory',
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      permission: 'canViewOrders',
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: <Users className="w-5 h-5" />,
      permission: 'canViewVendors',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartLine className="w-5 h-5" />,
      permission: 'canViewAnalytics',
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.permission || permissions?.[item.permission]
  );

  return (
    <aside className="w-64 bg-card border-r border-border">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              activeView === item.id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
