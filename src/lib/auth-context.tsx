import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RolePermissions } from '@/lib/types';
import { getRolePermissions } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';
import { config } from '@/lib/config';
import { loginRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  permissions: RolePermissions | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setPermissions(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If user doesn't exist in users table, create a basic profile
        if (error.code === 'PGRST116') {
          const newUser: User = {
            id: supabaseUser.id,
            username: supabaseUser.email?.split('@')[0] || 'user',
            name: supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
            email: supabaseUser.email || '',
            role: 'staff',
            locationId: 'default',
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
          };

          const { error: insertError } = await supabase
            .from('users')
            .insert([newUser]);

          if (!insertError) {
            setUser(newUser);
            setPermissions(getRolePermissions(newUser.role));
          }
        }
      } else if (data) {
        setUser(data as User);
        setPermissions(getRolePermissions(data.role));
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check rate limiting
    const clientId = getClientIdentifier();
    const rateLimitCheck = loginRateLimiter.check(clientId);

    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000);
      console.error(`Too many login attempts. Please try again in ${waitMinutes} minutes.`);
      throw new Error(`Too many login attempts. Please try again in ${waitMinutes} minutes.`);
    }

    // Demo mode fallback for development
    if (config.enableDemoMode && !config.environment.includes('production')) {
      console.warn('Using demo authentication - not for production use');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        // Reset rate limiter on successful login
        loginRateLimiter.reset(clientId);
        await fetchUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      setPermissions(null);
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
