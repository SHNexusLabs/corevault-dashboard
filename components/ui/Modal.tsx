"use client";

import { cn } from "@/lib/utils";
import { X, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  footer,
}: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-2xl bg-surface-card border border-border shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-150",
          sizeClasses[size],
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <button
            className="w-7 h-7 rounded-lg hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Enhanced Confirm Dialog ────────────────────────────────────────────── */
type Severity = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  /** What entity is being affected */
  entity?: string;
  /** Describe what will actually happen */
  consequence?: string;
  /** Can the action be undone? */
  reversible?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: Severity;
  loading?: boolean;
}

const severityConfig: Record<
  Severity,
  { icon: React.ReactNode; iconBg: string; confirmClass: string }
> = {
  danger: {
    icon: <ShieldAlert className="w-5 h-5 text-danger" />,
    iconBg: "bg-danger-muted border border-danger/20",
    confirmClass:
      "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    iconBg: "bg-warning-muted border border-warning/20",
    confirmClass:
      "bg-warning/15 text-warning hover:bg-warning/25 border border-warning/30",
  },
  info: {
    icon: <Info className="w-5 h-5 text-info" />,
    iconBg: "bg-info-muted border border-info/20",
    confirmClass: "bg-brand text-surface hover:opacity-90",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  entity,
  consequence,
  reversible,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  severity = "danger",
  loading,
}: ConfirmDialogProps) {
  const cfg = severityConfig[severity];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            className="h-8 px-3 text-sm rounded-lg border border-border text-text-secondary hover:text-text hover:bg-surface-elevated transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              "h-8 px-3 text-sm rounded-lg font-medium transition-colors flex items-center gap-2",
              cfg.confirmClass,
            )}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
          >
            {loading && (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            cfg.iconBg,
          )}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm text-text-secondary leading-relaxed">
            {message}
          </p>

          {entity && (
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border mt-2">
              <p className="text-[11px] text-text-muted font-mono">{entity}</p>
            </div>
          )}

          {consequence && (
            <p className="text-[11px] text-text-muted mt-2">
              <strong className="text-text-secondary">
                What will happen:{" "}
              </strong>
              {consequence}
            </p>
          )}

          {reversible !== undefined && (
            <p
              className={cn(
                "text-[11px] flex items-center gap-1 mt-1",
                reversible ? "text-success" : "text-warning",
              )}
            >
              {reversible
                ? "↩ This action can be reversed."
                : "⚠ This action cannot be undone."}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
