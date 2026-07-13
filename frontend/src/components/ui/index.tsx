/**
 * components/ui/index.tsx — UI primitives dùng chung toàn app
 *
 * Thêm component mới vào đây thay vì tạo file rải rác.
 */

import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

// ─── LoadingSpinner ────────────────────────────────────────────────────────────

interface SpinnerProps { size?: "sm" | "md" | "lg"; text?: string; }

export function LoadingSpinner({ size = "md", text }: SpinnerProps) {
  const sizeClass = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sizeClass} border-2 border-red-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

// ─── GlobalAlert ──────────────────────────────────────────────────────────────

interface AlertProps { message: string | null; onClose: () => void; autoCloseMs?: number; }

export function GlobalAlert({ message, onClose, autoCloseMs = 4000 }: AlertProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [message, onClose, autoCloseMs]);

  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full mx-4">
      <div className="bg-red-900/95 border border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-2xl backdrop-blur-sm">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-red-200 text-sm flex-1">{message}</p>
        <button onClick={onClose} className="text-red-400 hover:text-red-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-5xl mb-2">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
