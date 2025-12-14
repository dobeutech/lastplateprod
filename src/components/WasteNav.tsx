import { useWasteAuth } from '@/lib/waste-auth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  FileText, 
  Settings, 
  LogOut,
  ShoppingCart,
  Users,
  BookOpen
} from 'lucide-react';
import { SavePlateLogo } from '@/components/SavePlateLogo';

interface WasteNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function WasteNav({ currentPage, onNavigate }: WasteNavProps) {
  const { signOut, userProfile } = useWasteAuth();

  const navItems = [
    { id: 'log', label: 'Log Waste', icon: PlusCircle },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'knowledge-base', label: 'Help', icon: BookOpen },
  ];

  // Add multi-location for managers/admins
  if (userProfile?.role === 'manager' || userProfile?.role === 'admin') {
    navItems.push({ id: 'multi-location', label: 'All Locations', icon: Building2 });
    navItems.push({ id: 'vendors', label: 'Vendors', icon: Users });
    navItems.push({ id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart });
  }

  // Add ESG Reports and Settings for admins
  if (userProfile?.role === 'admin') {
    navItems.push(
      { id: 'esg', label: 'ESG Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings }
    );
  }

  return (
    <nav className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* SavePlate Logo */}
          <div className="flex items-center space-x-2">
            <SavePlateLogo variant="full" size="md" />
            <div>
              <p className="text-xs text-muted-foreground">SavePlate tagline</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            <Button variant="ghost" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                onClick={() => onNavigate(item.id)}
                className="w-full justify-start"
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}