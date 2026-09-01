import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border border-border rounded-xl",
        onClick && "cursor-pointer hover:border-border/80 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
  onClick,
}: KPICardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <Card
      className="p-4 cursor-pointer hover:border-brand/20 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-muted font-medium truncate mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-text font-mono leading-tight">
            {value}
          </p>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1.5 text-xs font-medium",
                positive ? "text-success" : "text-danger",
              )}
            >
              {positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {positive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-text-muted font-normal">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
