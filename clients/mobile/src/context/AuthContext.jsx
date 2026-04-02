import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'schedulite_token';
const USER_KEY = 'schedulite_user';

/** Align session user shape with web (`id`, `email`, `name`, `photoUrl`). */
function normalizeUser(u) {
  if (!u) return null;
  const id = u.id ?? (u._id != null ? String(u._id) : undefined);
  return {
    id,
    email: u.email,
    name: u.name,
    photoUrl: u.photoUrl || '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback(async (token, userData) => {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (userData) await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(userData)));
      setUser(normalizeUser(userData) || null);
    } else {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => setAuth(null), [setAuth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const { user: u } = await getMe();
        if (!cancelled) setUser(normalizeUser(u));
      } catch {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const value = { user, loading, setAuth, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
