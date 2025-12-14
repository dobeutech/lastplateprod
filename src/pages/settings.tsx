import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Location, User } from '@/lib/waste-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Target, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [locationsRes, usersRes] = await Promise.all([
      supabase.from('locations').select('*').order('location_name'),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
    ]);

    if (locationsRes.data) setLocations(locationsRes.data);
    if (usersRes.data) setUsers(usersRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInviteUser = () => {
    toast.success('User invitation sent!');
    // Placeholder for actual user invitation
  };

  const handleUpdateTarget = (_locationId: string) => {
    toast.success('Waste reduction target updated!');
    // Placeholder for updating location target
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8" />
            Settings & Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage locations, users, and waste reduction targets
          </p>
        </div>

        <Tabs defaultValue="locations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="locations">
              <Building2 className="mr-2 h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="targets">
              <Target className="mr-2 h-4 w-4" />
              Targets
            </TabsTrigger>
          </TabsList>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Manage Locations</CardTitle>
                  <Button>
                    <Building2 className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{location.location_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {location.address || 'No address set'}
                        </p>
                        {location.monthly_target_waste_percentage && (
                          <p className="text-sm text-primary mt-1">
                            Target: {location.monthly_target_waste_percentage}% waste reduction
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No locations yet. Add your first location to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button onClick={handleInviteUser}>
                    <Users className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Location</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const userLocation = locations.find((l) => l.id === user.location_id);
                        return (
                          <tr key={user.id} className="border-b">
                            <td className="py-3 px-4">{user.full_name || 'N/A'}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {user.email || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin'
                                    ? 'bg-primary/10 text-primary'
                                    : user.role === 'manager'
                                    ? 'bg-accent/10 text-accent'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {userLocation?.location_name || 'All locations'}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found. Invite team members to collaborate.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Targets Tab */}
          <TabsContent value="targets">
            <Card>
              <CardHeader>
                <CardTitle>Waste Reduction Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {locations.map((location) => (
                    <div key={location.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-4">{location.location_name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`target-${location.id}`}>
                            Monthly Waste Reduction Target (%)
                          </Label>
                          <Input
                            id={`target-${location.id}`}
                            type="number"
                            step="0.1"
                            defaultValue={location.monthly_target_waste_percentage || ''}
                            placeholder="e.g., 5.0"
                            className="mt-2"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={() => handleUpdateTarget(location.id)}>
                            Update Target
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Add locations first to set waste reduction targets.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}