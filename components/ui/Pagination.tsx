"use client";

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  total,
  perPage,
  onChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
      <p className="text-[11px] text-text-muted">
        Showing{" "}
        <span className="font-medium text-text">
          {start}-{end}
        </span>{" "}
        of <span className="font-medium text-text">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-2.5 py-1.5 rounded border border-border text-[11px] text-text-secondary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="px-2.5 py-1.5 text-[11px] font-medium text-text">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-2.5 py-1.5 rounded border border-border text-[11px] text-text-secondary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
