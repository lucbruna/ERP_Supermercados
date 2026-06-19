'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { jwtDecode } from 'jwt-decode';
import api from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  const loadUserFromToken = useCallback(() => {
    try {
      const { token } = parseCookies();
      if (token) {
        const decoded = jwtDecode<{ id: string; email: string; name: string; role: string; avatar?: string; permissions: string[] } & Record<string, unknown>>(token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          avatar: decoded.avatar,
          permissions: decoded.permissions || [],
        });
      }
    } catch {
      destroyCookie(null, 'token');
      destroyCookie(null, 'refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user: userData } = data;
    setCookie(null, 'token', token, {
      maxAge: 60 * 60,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    setCookie(null, 'refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    setUser(userData);
    router.push('/dashboard');
  };

  const signOut = useCallback(() => {
    destroyCookie(null, 'token');
    destroyCookie(null, 'refreshToken');
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
