import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { UIProvider, useUI } from "./contexts/UIContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MovieProvider, useMoviePersistence } from "./contexts/MovieContext";
import { BookingProvider, useBookingPersistence } from "./contexts/BookingContext";
import App from "./App";
import "./index.css";

// ErrorBoundary đơn giản — hiện thông báo lỗi thay vì trang trắng
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "monospace" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid #C8102E", borderRadius: "12px", padding: "2rem", maxWidth: "600px", width: "100%" }}>
            <h2 style={{ color: "#C8102E", marginBottom: "1rem" }}>🎬 X Cinema — Lỗi khởi động</h2>
            <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem" }}>
              Vui lòng mở DevTools (F12) → Console để xem chi tiết, hoặc gửi thông báo này cho nhóm phát triển.
            </p>
            <pre style={{ background: "#0a0a0a", padding: "1rem", borderRadius: "8px", fontSize: "0.75rem", color: "#ff6b6b", overflowX: "auto", whiteSpace: "pre-wrap" }}>
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "1rem", background: "#C8102E", color: "#fff", border: "none", padding: "0.5rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PersistenceLayer() {
  useMoviePersistence();
  useBookingPersistence();
  return null;
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { setGlobalAlert } = useUI();
  const loadUserBookingsRef = React.useRef<((email: string) => Promise<void>) | undefined>(undefined);

  return (
    <AuthProvider onUserLogin={(email) => loadUserBookingsRef.current?.(email)}>
      <MovieProvider onAlert={setGlobalAlert}>
        <BookingProvider
          onAlert={setGlobalAlert}
          onRegisterLoadUserBookings={(fn) => { loadUserBookingsRef.current = fn; }}
        >
          <PersistenceLayer />
          {children}
        </BookingProvider>
      </MovieProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <UIProvider>
        <InnerProviders>
          <App />
        </InnerProviders>
      </UIProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
