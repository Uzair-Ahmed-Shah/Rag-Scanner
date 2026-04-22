import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getSession, setSession, clearSession, type Session } from '../lib/auth';
import { authLogin, authSignup } from '../lib/api';

interface AuthContextValue {
  userId: string;
  userName: string;
  email: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(getSession);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authLogin(email, password);
    const s: Session = { token: res.token, userId: res.userId, userName: res.name, email: res.email };
    setSession(s);
    setSessionState(s);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await authSignup(email, password, name);
    const s: Session = { token: res.token, userId: res.userId, userName: res.name, email: res.email };
    setSession(s);
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const value: AuthContextValue = {
    userId: session?.userId ?? '',
    userName: session?.userName ?? '',
    email: session?.email ?? '',
    isAuthenticated: !!session,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
