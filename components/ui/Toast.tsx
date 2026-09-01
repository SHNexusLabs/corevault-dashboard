"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastCtx {
  toast: (opts: Omit<ToastItem, "id">) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastCtx>({
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-info/30 bg-info/10 text-info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<ToastItem, "id">) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: ToastItem = { ...opts, id };
      setToasts((prev) => [...prev.slice(-4), item]);
      setTimeout(() => dismiss(id), opts.duration ?? 3500);
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, description?: string) =>
      toast({ type: "success", message, description }),
    [toast],
  );
  const error = useCallback(
    (message: string, description?: string) =>
      toast({ type: "error", message, description }),
    [toast],
  );
  const warning = useCallback(
    (message: string, description?: string) =>
      toast({ type: "warning", message, description }),
    [toast],
  );
  const info = useCallback(
    (message: string, description?: string) =>
      toast({ type: "info", message, description }),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-200 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 min-w-70 max-w-sm",
              "px-3.5 py-3 rounded-xl border shadow-xl",
              "bg-surface-card",
              "animate-in slide-in-from-right-4 fade-in duration-200",
            )}
          >
            <span className={cn("shrink-0 mt-0.5", STYLES[t.type])}>
              {ICONS[t.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text leading-snug">
                {t.message}
              </p>
              {t.description && (
                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                  {t.description}
                </p>
              )}
            </div>
            <button
              className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-text transition-colors"
              onClick={() => dismiss(t.id)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
