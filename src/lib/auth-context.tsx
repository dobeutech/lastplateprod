import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RolePermissions } from '@/lib/types';
import { getRolePermissions } from '@/lib/permissions';
import { useKV } from '@github/spark/hooks';

interface AuthContextType {
  user: User | null;
  permissions: RolePermissions | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [users] = useKV<User[]>('users', []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setPermissions(getRolePermissions(userData.role));
    }
  }, []);

  const login = async (username: string, _password: string): Promise<boolean> => {
    // ⚠️ CRITICAL SECURITY WARNING ⚠️
    // This is DEMO authentication only - password is NOT validated!
    // DO NOT deploy to production without replacing this with real authentication.
    // See SECURITY_BEST_PRACTICES.md for implementation requirements.
    
    // Fail-safe: Prevent accidental production deployment
    if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_DEMO_MODE !== 'true') {
      console.error('SECURITY: Demo authentication is disabled in production');
      return false;
    }
    
    const foundUser = users?.find((u) => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      setPermissions(getRolePermissions(foundUser.role));
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
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
