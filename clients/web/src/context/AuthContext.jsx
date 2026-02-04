import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'schedulite_token';
const USER_KEY = 'schedulite_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((token, userData) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData || null);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => setAuth(null), [setAuth]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(({ user: u }) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = { user, loading, setAuth, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
