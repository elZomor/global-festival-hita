'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiQueryClient } from '../api/reactQueryClient';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '') as string;
const ACCESS_TOKEN_KEY = 'gf_accessToken';
const REFRESH_TOKEN_KEY = 'gf_refreshToken';
const USER_KEY = 'gf_user';

export type AuthUser = {
  name: string;
  email: string;
  picture?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const clearStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const decodeJwtPayload = (token: string): Record<string, unknown> => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Hydrate auth state from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      apiQueryClient.setAuthToken(token);
    }
  }, []);

  const loginWithGoogleCredential = async (credential: string) => {
    const response = await fetch(`${BASE_URL}/auth/google/login/callback`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${credential}` },
    });
    const data = await response.json();
    if (!data?.data?.ACCESS_TOKEN) throw new Error('Login failed');

    const googlePayload = decodeJwtPayload(credential);
    const authUser: AuthUser = {
      name: (googlePayload.name as string) || (googlePayload.email as string),
      email: googlePayload.email as string,
      picture: googlePayload.picture as string | undefined,
    };

    localStorage.setItem(ACCESS_TOKEN_KEY, data.data.ACCESS_TOKEN);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.REFRESH_TOKEN);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    apiQueryClient.setAuthToken(data.data.ACCESS_TOKEN);
    setUser(authUser);
  };

  /**
   * Refresh the access token using the stored refresh token.
   * Mirrors HITA's apiClient 401 interceptor logic.
   */
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      signOut();
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    const newAccessToken: string = data.access;
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    apiQueryClient.setAuthToken(newAccessToken);
  };

  const signOut = () => {
    clearStorage();
    apiQueryClient.setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      loginWithGoogleCredential,
      refreshAccessToken,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
