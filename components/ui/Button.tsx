import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-surface hover:bg-cyan-300 shadow-sm shadow-brand/20",
  secondary:
    "bg-surface-elevated text-text hover:bg-surface-hover border border-border",
  ghost: "text-text-secondary hover:text-text hover:bg-surface-elevated",
  danger: "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/25",
  success:
    "bg-success/15 text-success hover:bg-success/25 border border-success/25",
  outline:
    "border border-border text-text-secondary hover:text-text hover:border-border/80",
};

const sizeClasses: Record<Size, string> = {
  xs: "h-6 px-2 text-xs gap-1",
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-8 px-3 text-sm gap-2",
  lg: "h-9 px-4 text-sm gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
}

export function IconButton({
  className,
  children,
  size = "md",
  variant = "ghost",
  ...props
}: ButtonProps) {
  const sz: Record<Size, string> = {
    xs: "w-6 h-6",
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-9 h-9",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sz[size as Size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
