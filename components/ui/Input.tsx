import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "h-8 w-full rounded-lg border border-border bg-surface-elevated text-sm text-text placeholder:text-text-muted",
            "focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/50",
            "transition-colors duration-150",
            icon ? "pl-8 pr-3" : "px-3",
            error && "border-danger/50 focus:ring-danger/30",
            className,
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
      <input
        className={cn(
          "h-8 w-full rounded-lg border border-border bg-surface-elevated text-sm text-text placeholder:text-text-muted",
          "pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/50 transition-colors duration-150",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        className={cn(
          "h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text",
          "px-2.5 focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/50 transition-colors cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
