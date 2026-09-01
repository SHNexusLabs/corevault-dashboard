import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-text-muted" />
      </div>
      <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-3 py-3">
          <div
            className="h-4 bg-surface-elevated rounded animate-pulse"
            style={{ width: `${60 + ((i * 13) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-surface-elevated rounded animate-pulse", className)}
    />
  );
}

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-text mb-2">
        Access Restricted
      </h3>
      <p className="text-sm text-text-muted max-w-xs">
        You don&apos;t have permission to view this section. Contact your Super Admin
        for access.
      </p>
    </div>
  );
}
