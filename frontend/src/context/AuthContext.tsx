import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { AuthUser, LoginResponse } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userCd: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mitsuhide_auth_user';
const TOKEN_STORAGE_KEY = 'mitsuhide_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [user]);

  const login = async (userCd: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', {
        userCd,
        password,
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
        }
        return res.data;
      }

      return { success: false, message: res.data.message || 'ログインに失敗しました。' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || '通信エラーが発生しました。';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'ログインしていません。' };
    }

    try {
      const res = await apiClient.post<LoginResponse>('/auth/change-password', {
        userCd: user.userCd,
        oldPassword,
        newPassword,
      });

      if (res.data.success) {
        return { success: true, message: res.data.message || 'パスワードを変更しました。' };
      }
      return { success: false, message: res.data.message || 'パスワード変更に失敗しました。' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || '通信エラーが発生しました。';
      return { success: false, message: errorMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
