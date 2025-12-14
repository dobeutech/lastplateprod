import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, SignOut } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { Location, Alert } from '@/lib/types';
import { SavePlateLogo } from '@/components/SavePlateLogo';

interface HeaderProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

export function Header({ selectedLocationId, onLocationChange }: HeaderProps) {
  const { user, logout, permissions } = useAuth();
  const [locations] = useKV<Location[]>('locations', []);
  const [alerts] = useKV<Alert[]>('alerts', []);

  const unreadAlerts = alerts?.filter(a => !a.read && a.locationId === selectedLocationId).length || 0;
  const selectedLocation = locations?.find(l => l.id === selectedLocationId);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <SavePlateLogo variant="full" size="md" />
          {permissions?.canViewAllLocations && locations && locations.length > 1 ? (
            <Select value={selectedLocationId} onValueChange={onLocationChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">
              {selectedLocation?.name || 'Location'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                {unreadAlerts}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={logout}>
            <SignOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}