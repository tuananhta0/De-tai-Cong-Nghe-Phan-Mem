/**
 * contexts/UIContext.tsx
 *
 * State giao diện thuần túy, không liên quan đến data:
 *   - Tab hiện tại (navigation)
 *   - Alert toàn cục
 *   - Search query
 *   - Modal phim đang xem
 *
 * Tách riêng để các context data (Movie, Booking) có thể gọi onAlert
 * mà không tạo circular dependency.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Movie } from "../types/movie";

interface UIContextValue {
  activeTab: string;
  navigateToTab: (tab: string) => void;
  handleGoBack: () => void;
  globalAlert: string | null;
  setGlobalAlert: (msg: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMovie: Movie | null;
  setSelectedMovie: (m: Movie | null) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("home");
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setSelectedMovie(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleGoBack = useCallback(() => {
    if (selectedMovie) { setSelectedMovie(null); return; }
    if (activeTab !== "home") setActiveTab("home");
  }, [selectedMovie, activeTab]);

  return (
    <UIContext.Provider value={{
      activeTab, navigateToTab, handleGoBack,
      globalAlert, setGlobalAlert,
      searchQuery, setSearchQuery,
      selectedMovie, setSelectedMovie,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
