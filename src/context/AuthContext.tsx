/**
 * AuthContext — login state for the app.
 * Real login talks to the FastAPI backend. Demo login works with no backend.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setToken, clearToken, getToken, type UserProfile } from '../api/client';

const DEMO_KEY = 'hb_demo_user';

const DEMO_USER: UserProfile = {
  id: 0,
  email: 'demo@healthbridge.ai',
  full_name: 'Demo User',
  is_active: true,
  is_verified: false,
};

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isDemo: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  demoLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    if (localStorage.getItem(DEMO_KEY)) {
      setUser(DEMO_USER);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }
    if (!getToken()) { setIsLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.access_token);
    setUser(await authApi.me());
    setIsDemo(false);
  }, []);

  const register = useCallback(async (email: string, fullName: string, password: string) => {
    const res = await authApi.register(email, fullName, password);
    setToken(res.access_token);
    setUser(await authApi.me());
    setIsDemo(false);
  }, []);

  const demoLogin = useCallback(() => {
    localStorage.setItem(DEMO_KEY, '1');
    setUser(DEMO_USER);
    setIsDemo(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(DEMO_KEY);
    setUser(null);
    setIsDemo(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isDemo, isLoading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
