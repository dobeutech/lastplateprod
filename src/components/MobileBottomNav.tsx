import { useWasteAuth } from '@/lib/waste-auth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  FileText, 
  Settings,
  BookOpen
} from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const { userProfile } = useWasteAuth();

  const navItems = [
    { id: 'log', label: 'Log', icon: PlusCircle, roles: ['operator', 'manager', 'admin'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['operator', 'manager', 'admin'] },
    { id: 'knowledge-base', label: 'Help', icon: BookOpen, roles: ['operator', 'manager', 'admin'] },
    { id: 'multi-location', label: 'Locations', icon: Building2, roles: ['manager', 'admin'] },
    { id: 'esg', label: 'Reports', icon: FileText, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => 
    item.roles.includes(userProfile?.role || 'operator')
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}