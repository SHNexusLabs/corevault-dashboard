import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus, FulfillmentStatus, StockStatus } from '@/lib/types';

/* ─── Base Badge ─────────────────────────────────────────────────────────── */
interface BadgeProps { className?: string; children: React.ReactNode; dot?: boolean }

export function Badge({ className, children, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium font-mono tracking-wide whitespace-nowrap',
      className,
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />}
      {children}
    </span>
  );
}

/* ─── Order Status ───────────────────────────────────────────────────────── */
const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  placed:        { label: 'Placed',         className: 'bg-slate-500/15 text-slate-300 border border-slate-500/25' },
  confirmed:     { label: 'Confirmed',      className: 'bg-blue-500/15 text-blue-300 border border-blue-500/25' },
  processing:    { label: 'Processing',     className: 'bg-purple-500/15 text-purple-300 border border-purple-500/25' },
  packed:        { label: 'Packed',         className: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' },
  ready_to_ship: { label: 'Ready to Ship',  className: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25' },
  shipped:       { label: 'Shipped',        className: 'bg-sky-500/15 text-sky-300 border border-sky-500/25' },
  delivered:     { label: 'Delivered',      className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
  cancelled:     { label: 'Cancelled',      className: 'bg-red-500/15 text-red-300 border border-red-500/25' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = orderStatusConfig[status] ?? orderStatusConfig.placed;
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/* ─── Payment Status ─────────────────────────────────────────────────────── */
const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending:             { label: 'Pending',       className: 'bg-amber-500/15 text-amber-300 border border-amber-500/25' },
  paid:                { label: 'Paid',          className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
  failed:              { label: 'Failed',        className: 'bg-red-500/15 text-red-300 border border-red-500/25' },
  refunded:            { label: 'Refunded',      className: 'bg-orange-500/15 text-orange-300 border border-orange-500/25' },
  partially_refunded:  { label: 'Part. Refund',  className: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = paymentStatusConfig[status] ?? paymentStatusConfig.pending;
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/* ─── Fulfillment Status ─────────────────────────────────────────────────── */
const fulfillmentStatusConfig: Record<FulfillmentStatus, { label: string; className: string }> = {
  unfulfilled: { label: 'Unfulfilled',  className: 'bg-slate-500/15 text-slate-400 border border-slate-500/25' },
  processing:  { label: 'Processing',   className: 'bg-purple-500/15 text-purple-300 border border-purple-500/25' },
  packed:      { label: 'Packed',       className: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' },
  shipped:     { label: 'Shipped',      className: 'bg-sky-500/15 text-sky-300 border border-sky-500/25' },
  delivered:   { label: 'Delivered',    className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
  returned:    { label: 'Returned',     className: 'bg-orange-500/15 text-orange-300 border border-orange-500/25' },
};

export function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
  const cfg = fulfillmentStatusConfig[status] ?? fulfillmentStatusConfig.unfulfilled;
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/* ─── Stock ──────────────────────────────────────────────────────────────── */
const stockStatusConfig: Record<StockStatus, { label: string; className: string }> = {
  in_stock:     { label: 'In Stock',     className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
  low_stock:    { label: 'Low Stock',    className: 'bg-amber-500/15 text-amber-300 border border-amber-500/25' },
  out_of_stock: { label: 'Out of Stock', className: 'bg-red-500/15 text-red-300 border border-red-500/25' },
};

export function StockBadge({ status }: { status: StockStatus }) {
  const cfg = stockStatusConfig[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/* ─── Priority ───────────────────────────────────────────────────────────── */
const priorityConfig: Record<string, { label: string; className: string; dot: string }> = {
  urgent: { label: 'Urgent',  className: 'bg-red-500/15 text-red-300 border border-red-500/25',       dot: 'bg-red-400' },
  high:   { label: 'High',    className: 'bg-orange-500/15 text-orange-300 border border-orange-500/25', dot: 'bg-orange-400' },
  normal: { label: 'Normal',  className: 'bg-slate-500/15 text-slate-400 border border-slate-500/25', dot: 'bg-slate-500' },
  low:    { label: 'Low',     className: 'bg-slate-600/10 text-slate-500 border border-slate-600/20', dot: 'bg-slate-600' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] ?? priorityConfig.normal;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap', cfg.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ─── Role ───────────────────────────────────────────────────────────────── */
export function RoleBadge({ role }: { role: string }) {
  if (role === 'super_admin')
    return <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">Super Admin</Badge>;
  return <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/25">Admin</Badge>;
}

/* ─── Status Dot ─────────────────────────────────────────────────────────── */
export function StatusDot({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn(
        'w-1.5 h-1.5 rounded-full shrink-0',
        active ? 'bg-emerald-400 shadow-[0_0_4px_var(--color-emerald-400)]' : 'bg-slate-500',
      )} />
      <span className={active ? 'text-emerald-400' : 'text-text-muted'}>
        {label ?? (active ? 'Active' : 'Inactive')}
      </span>
    </span>
  );
}

/* ─── Return Status ──────────────────────────────────────────────────────── */
const returnStatusConfig: Record<string, { label: string; className: string }> = {
  requested:  { label: 'Requested',  className: 'bg-amber-500/15 text-amber-300 border border-amber-500/25' },
  approved:   { label: 'Approved',   className: 'bg-blue-500/15 text-blue-300 border border-blue-500/25' },
  rejected:   { label: 'Rejected',   className: 'bg-red-500/15 text-red-300 border border-red-500/25' },
  received:   { label: 'Received',   className: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' },
  refunded:   { label: 'Refunded',   className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
};

export function ReturnStatusBadge({ status }: { status: string }) {
  const cfg = returnStatusConfig[status] ?? returnStatusConfig.requested;
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}
