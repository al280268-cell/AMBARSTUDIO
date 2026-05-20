import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthData, RegisterPayload } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ambar_auth');
    if (stored) {
      try {
        const data: AuthData = JSON.parse(stored);
        setUser(data.user);
        // Refresh user data from server
        api.getMe().then(u => setUser(u)).catch((err) => {
          if (err.message === 'Sesión expirada' || err.message.includes('401')) {
            localStorage.removeItem('ambar_auth');
            setUser(null);
          }
        });
      } catch { localStorage.removeItem('ambar_auth'); }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.login({ email, password });
    localStorage.setItem('ambar_auth', JSON.stringify(data));
    setUser(data.user);
    return data.user;
  };

  const register = async (userData: RegisterPayload): Promise<User> => {
    const data = await api.register(userData);
    localStorage.setItem('ambar_auth', JSON.stringify(data));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ambar_auth');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      const stored = JSON.parse(localStorage.getItem('ambar_auth') || '{}') as AuthData;
      stored.user = u;
      localStorage.setItem('ambar_auth', JSON.stringify(stored));
    } catch { /* silently fail */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
