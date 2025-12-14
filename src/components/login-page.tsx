import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { SavePlateLogo } from '@/components/SavePlateLogo';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast.success('Login successful');
    } else {
      toast.error('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const demoUsers = [
    { role: 'Owner', username: 'owner', desc: 'Full system access' },
    { role: 'Admin', username: 'admin', desc: 'Approve orders, manage users' },
    { role: 'Regional Manager', username: 'regional', desc: 'Multi-location oversight' },
    { role: 'Manager', username: 'manager', desc: 'Location management' },
    { role: 'Staff', username: 'staff', desc: 'Inventory & order creation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <SavePlateLogo variant="full" size="lg" />
          </div>
          <CardTitle className="text-xl font-semibold text-muted-foreground"></CardTitle>
          <CardDescription>Save Food. Save Money. Save the Planet. Sign in to manage your restaurant operations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-3">Demo Accounts (any password):</p>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => {
                    setUsername(user.username);
                    setPassword('demo');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md bg-muted hover:bg-muted/70 transition-colors"
                >
                  <div className="font-medium text-sm">{user.role}</div>
                  <div className="text-xs text-muted-foreground">@{user.username} - {user.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}