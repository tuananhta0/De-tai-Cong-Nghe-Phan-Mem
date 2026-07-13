/**
 * contexts/AuthContext.tsx
 *
 * Quản lý phiên đăng nhập của khách hàng (userProfile) và
 * nhân viên/admin (operatorProfile). Tách riêng khỏi data context
 * để auth state không re-render toàn bộ cây khi phim/suất chiếu thay đổi.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { UserProfile } from "../types/auth";
import { accountApi } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppMode = "customer" | "admin" | "employee";

interface AuthContextValue {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  operatorProfile: UserProfile | null;
  setOperatorProfile: (p: UserProfile | null) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  toggleFavoriteMovie: (movieId: string) => void;
  login: (emailOrPhone: string, password: string) => Promise<UserProfile>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<UserProfile>;
  logoutCustomer: () => void;
  logoutOperator: () => void;
  isLoggedIn: boolean;
  isOperator: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "null" || raw === "undefined") return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch { return fallback; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, onUserLogin }: { children: React.ReactNode; onUserLogin?: (email: string) => void }) {
  const [appMode, _setAppMode] = useState<AppMode>(() =>
    readLS<AppMode>("tcd_app_mode", "customer")
  );
  const setAppMode = (mode: AppMode) => {
    _setAppMode(mode);
    localStorage.setItem("tcd_app_mode", mode);
  };

  const [userProfile, _setUserProfile] = useState<UserProfile | null>(() =>
    readLS<UserProfile | null>("tcd_user", null)
  );
  const [operatorProfile, _setOperatorProfile] = useState<UserProfile | null>(() =>
    readLS<UserProfile | null>("tcd_operator", null)
  );

  const setUserProfile = (p: UserProfile | null) => {
    _setUserProfile(p);
    localStorage.setItem("tcd_user", JSON.stringify(p));
  };
  const setOperatorProfile = (p: UserProfile | null) => {
    _setOperatorProfile(p);
    localStorage.setItem("tcd_operator", JSON.stringify(p));
  };

  // Làm mới profile từ server khi app khởi động lại (tránh dùng dữ liệu stale từ localStorage)
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const cachedUser = readLS<UserProfile | null>("tcd_user", null);
        if (cachedUser?.email) {
          const fresh = await accountApi.getByEmail(cachedUser.email);
          _setUserProfile(fresh);
          localStorage.setItem("tcd_user", JSON.stringify(fresh));
          // Tải lịch sử vé sau khi khôi phục session
          onUserLogin?.(fresh.email);
        }
        const cachedOp = readLS<UserProfile | null>("tcd_operator", null);
        if (cachedOp?.email) {
          const fresh = await accountApi.getByEmail(cachedOp.email);
          _setOperatorProfile(fresh);
          localStorage.setItem("tcd_operator", JSON.stringify(fresh));
        }
      } catch (err) {
        console.warn("Không thể làm mới phiên đăng nhập:", err);
      }
    };
    refreshSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavoriteMovie = useCallback((movieId: string) => {
    _setUserProfile(prev => {
      if (!prev) return null;
      const isFav = prev.favoriteMovies.includes(movieId);
      const updatedFavs = isFav
        ? prev.favoriteMovies.filter(id => id !== movieId)
        : [...prev.favoriteMovies, movieId];
      const updated = { ...prev, favoriteMovies: updatedFavs };
      localStorage.setItem("tcd_user", JSON.stringify(updated));
      accountApi.updateProfile(prev.email, { favoriteMovies: updatedFavs })
        .catch(err => console.warn("Không thể đồng bộ phim yêu thích:", err));
      return updated;
    });
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<UserProfile> => {
    const profile = await accountApi.login(emailOrPhone, password);
    if (profile.role === "admin" || profile.role === "employee") {
      setOperatorProfile(profile);
      setAppMode(profile.role);
    } else {
      setUserProfile(profile);
      setAppMode("customer");
      // Tải lịch sử vé ngay sau khi khách hàng đăng nhập
      onUserLogin?.(profile.email);
    }
    return profile;
  };

  const register = async (data: { name: string; email: string; phone?: string; password: string }): Promise<UserProfile> => {
    const profile = await accountApi.register(data);
    setUserProfile(profile);
    return profile;
  };

  const logoutCustomer = () => setUserProfile(null);
  const logoutOperator = () => { setOperatorProfile(null); setAppMode("customer"); };

  return (
    <AuthContext.Provider value={{
      userProfile, setUserProfile,
      operatorProfile, setOperatorProfile,
      appMode, setAppMode,
      toggleFavoriteMovie,
      login, register,
      logoutCustomer, logoutOperator,
      isLoggedIn: !!userProfile,
      isOperator: !!operatorProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
