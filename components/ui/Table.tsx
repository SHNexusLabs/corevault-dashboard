import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border">{children}</thead>;
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/50">{children}</tbody>;
}

export function Th({
  children,
  className,
  sortable,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onClick?: () => void;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-left text-xs font-medium text-text-muted tracking-wide whitespace-nowrap",
        sortable && "cursor-pointer hover:text-text-secondary select-none",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 text-sm text-text-secondary whitespace-nowrap",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-surface-hover",
        selected && "bg-brand-muted",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}

export function Pagination({
  page,
  total,
  perPage,
  onChange,
}: PaginationProps) {
  const pages = Math.ceil(total / perPage);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5 border-t border-border">
      <span className="text-xs text-text-muted font-mono">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <Button
              key={p}
              variant={p === page ? "primary" : "ghost"}
              size="xs"
              className="w-6 h-6 px-0"
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="xs"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
